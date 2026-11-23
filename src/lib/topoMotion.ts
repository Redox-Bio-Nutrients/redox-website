// src/lib/topoMotion.ts
//
// Moving topographic backgrounds (2026-11-23, after landonorris.com):
// every TopoBackground's contour map is redrawn live in WebGL so the
// terrain flows — hills rise, sink, merge and split, and lines fade in
// and out. Accent lines and their colours (product label colours, or
// the homepage spectrum) come from the same seeded data as the still
// /topo.svg map, which is only the fallback for reduced motion or no
// WebGL2. The lines fade in over the ground + glow on first draw.
//
// One shared WebGL context draws every visible map in turn and copies
// it into that map's own 2D canvas: browsers allow only ~16 WebGL
// contexts per page, and a catalog page has 24+ product cards.
// Off-screen maps aren't drawn; with none visible the loop stops.

import { parseTopoSvgParams, topoShaderData } from './topo'

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
precision highp int;
uniform highp sampler2D uLat;
uniform vec2 uRes;
uniform float uDpr, uTime, uWarp, uSpacing, uMin, uPhase, uMix, uDensity;
uniform vec2 uPeak;
uniform int uAccentEvery;
uniform float uWidths[32];
uniform vec3 uColors[32];
out vec4 outColor;

float lat(ivec2 p, int c) { return texelFetch(uLat, p & 255, 0)[c]; }

float vnoise(vec2 q, int c) {
  vec2 i = floor(q);
  vec2 f = q - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  ivec2 ii = ivec2(i);
  return mix(mix(lat(ii, c), lat(ii + ivec2(1, 0), c), u.x),
             mix(lat(ii + ivec2(0, 1), c), lat(ii + ivec2(1, 1), c), u.x), u.y);
}

// 2 octaves, normalised — topo.ts's fbm(x, y, 2)
float fbm(vec2 q, int c) { return (vnoise(q, c) + 0.5 * vnoise(q * 2.0, c)) / 1.5; }

void main() {
  // Pixel → the 2400×1200 viewBox, cover-fit like the <img>'s object-fit.
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float scale = max(uRes.x / 2400.0, uRes.y / 1200.0);
  vec2 vb = (p - uRes * 0.5) / scale + vec2(1200.0, 600.0);

  const float H = 1200.0;
  const float f = 0.75;
  vec2 xy = vb / H;
  vec2 d0 = (vb - uPeak) / H;
  float k = uWarp * (0.2 + min(length(d0), 1.4));
  // The only change from the still map: the warp noise drifts with time.
  vec2 drift1 = uTime * vec2(0.021, 0.013);
  vec2 drift2 = uTime * vec2(-0.017, 0.011);
  float wx = d0.x + k * fbm(xy * f + drift1, 0);
  float wy = d0.y + k * fbm(xy * f + vec2(7.3, -3.1) + drift2, 1);
  float field = length(vec2(wx * 0.78, wy)) + 0.015 * fbm(xy * 2.0, 2);

  float uRings = (field - uMin) / uSpacing - (0.5 + uPhase);

  // Free terrain (landonorris.com-style): three noise layers drifting in
  // different directions, so hills rise, sink, merge and split instead
  // of only sliding. uMix blends rings (0) → free (1).
  // Low frequencies + wide spacing = few, large, smooth shapes.
  float hFree = fbm(xy * 0.8 + uTime * vec2(0.020, 0.008), 0)
              + 0.55 * fbm(xy * 1.4 + vec2(3.1, 1.7) - uTime * vec2(0.012, 0.018), 1);
  float u = mix(uRings, hFree * uDensity / 0.11, uMix);

  // Contour level n sits at integer u; distance to it in device pixels.
  float n = floor(u + 0.5);
  float dist = abs(u - n) / max(fwidth(u), 1e-5);
  if (uMix < 0.001 && n < 0.0) discard;

  // Every Nth level is an accent (floor-mod, since free levels go negative).
  float N = float(uAccentEvery);
  bool accent = mod(n - (N - 2.0), N) < 0.5;
  int ai = int(mod(floor((n - (N - 2.0)) / N), 32.0));
  float w = (accent ? uWidths[ai] : 1.3) * uDpr;
  float cover = clamp(w * 0.5 + 0.5 - dist, 0.0, 1.0);
  vec4 c = accent ? vec4(uColors[ai], 0.85) : vec4(196.0, 214.0, 190.0, 0.22 * 255.0) / vec4(255.0, 255.0, 255.0, 255.0);
  float a = c.a * cover;
  // Free mode: lines fade in and out along their length (a slow-moving
  // mask), so they read as drifting strands rather than a full grid.
  float fade = smoothstep(-0.3, 0.3, fbm(xy * 0.6 + uTime * vec2(-0.010, 0.015), 2));
  a *= mix(1.0, fade, uMix);
  outColor = vec4(c.rgb * a, a);
}`

/** The look, tuned on /preview/topo-motion (2026-11-23): drift speed,
 * rings (0) → free terrain (1), and line density. */
const settings = { speed: 3, mix: 0.8, density: 0.8 }

/** Live tuning (the /preview/topo-motion sliders). */
export function setTopoMotion(s: Partial<typeof settings>): void {
  Object.assign(settings, s)
}

interface TopoMap {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  tex: WebGLTexture
  data: ReturnType<typeof topoShaderData>
  colors: number[]
  visible: boolean
  shown: boolean
}

let renderer: ReturnType<typeof createRenderer> | null | undefined
const maps: TopoMap[] = []
let raf = 0
let last = 0
let elapsed = 0

function createRenderer() {
  const glCanvas = document.createElement('canvas')
  const gl = glCanvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false })
  if (!gl) return null // no WebGL2: every map keeps its still image

  const shader = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader')
    return sh
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link')
  gl.useProgram(prog)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)

  const names = ['uRes', 'uDpr', 'uTime', 'uWarp', 'uSpacing', 'uMin', 'uPhase', 'uMix', 'uDensity', 'uPeak', 'uAccentEvery', 'uWidths', 'uColors'] as const
  const u = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(prog, n)])) as Record<(typeof names)[number], WebGLUniformLocation | null>
  return { gl, glCanvas, u }
}

function frame(now: number) {
  const r = renderer!
  const { gl, glCanvas, u } = r
  elapsed += (settings.speed * Math.min(now - (last || now), 100)) / 1000 // no jump after a pause
  last = now
  const visible = maps.filter((m) => m.visible)
  if (!visible.length) {
    raf = 0
    return
  }

  const dpr = Math.min(devicePixelRatio, 2)
  const sizes = visible.map((m) => [Math.round(m.canvas.clientWidth * dpr), Math.round(m.canvas.clientHeight * dpr)])
  const maxW = Math.max(...sizes.map((s) => s[0]))
  const maxH = Math.max(...sizes.map((s) => s[1]))
  if (glCanvas.width < maxW || glCanvas.height < maxH) {
    glCanvas.width = Math.max(glCanvas.width, maxW)
    glCanvas.height = Math.max(glCanvas.height, maxH)
  }

  gl.uniform1f(u.uDpr, dpr)
  gl.uniform1f(u.uTime, elapsed)
  gl.uniform1f(u.uMix, settings.mix)
  gl.uniform1f(u.uDensity, settings.density)
  gl.clearColor(0, 0, 0, 0)

  visible.forEach((m, i) => {
    const [w, h] = sizes[i]
    if (!w || !h) return
    if (m.canvas.width !== w || m.canvas.height !== h) {
      m.canvas.width = w
      m.canvas.height = h
    }
    const d = m.data
    gl.viewport(0, 0, w, h)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindTexture(gl.TEXTURE_2D, m.tex)
    gl.uniform2f(u.uRes, w, h)
    gl.uniform1f(u.uWarp, d.warp)
    gl.uniform1f(u.uSpacing, d.spacing)
    gl.uniform1f(u.uMin, d.min)
    gl.uniform1f(u.uPhase, d.phase)
    gl.uniform2f(u.uPeak, d.peakX * d.width, d.peakY * d.height)
    gl.uniform1i(u.uAccentEvery, d.accentEvery)
    gl.uniform1fv(u.uWidths, d.accentWidths)
    gl.uniform3fv(u.uColors, m.colors)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    // GL's origin is bottom-left: the map sits at the bottom of glCanvas.
    m.ctx.clearRect(0, 0, w, h)
    m.ctx.drawImage(glCanvas, 0, glCanvas.height - h, w, h, 0, 0, w, h)
    if (!m.shown) {
      m.shown = true
      m.canvas.style.opacity = '1' // fades in over the ground + glow
    }
  })
  raf = requestAnimationFrame(frame)
}

/** Starts the moving map beside `img` (a TopoBackground's .topo-bg__still,
 * whose data-src is the still map's URL). False when it can't run
 * (reduced motion, no WebGL2) — the caller then shows the still map. */
export function animateTopo(img: HTMLImageElement): boolean {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (renderer === undefined) renderer = createRenderer()
  if (!renderer) return false
  const { gl } = renderer

  const src = img.dataset.src!
  const params = parseTopoSvgParams(new URL(src, location.href).searchParams)
  if (!params) throw new Error(`topoMotion: bad map URL ${src}`)
  const data = topoShaderData(params)

  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB32F, 256, 256, 0, gl.RGB, gl.FLOAT, data.lattice)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 1s ease'
  img.after(canvas)

  const map: TopoMap = {
    canvas,
    ctx: canvas.getContext('2d')!,
    tex,
    data,
    colors: data.ringColors.flatMap((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)),
    visible: false,
    shown: false,
  }
  maps.push(map)
  new IntersectionObserver(([entry]) => {
    map.visible = entry.isIntersecting
    if (map.visible && !raf) {
      last = 0
      raf = requestAnimationFrame(frame)
    }
  }).observe(canvas)
  return true
}
