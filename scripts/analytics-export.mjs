#!/usr/bin/env node
// scripts/analytics-export.mjs
//
// Pulls Vercel Web Analytics for redoxgrows.com out of Vercel and writes
// it to disk as CSVs (open in Excel/Sheets) plus a single self-contained
// report.html (open in any browser, print to PDF to share).
//
//   npm run analytics:export                      # last 30 days
//   npm run analytics:export -- --days 90
//   npm run analytics:export -- --since 2026-10-01 --until 2026-10-31
//   npm run analytics:export -- --month 2026-10
//   npm run analytics:export -- --last-month       # previous calendar month
//
// Output: analytics-exports/<since>_to_<until>/, or analytics-exports/<YYYY-MM>/
// for a month (gitignored).
//
// Auth: uses VERCEL_TOKEN if set, otherwise the token the Vercel CLI saved
// on `vercel login`. Uses Vercel's public Web Analytics API
// (https://vercel.com/docs/analytics/web-analytics-api) — production
// traffic only, Pro plan allows the latest 366 days, grouped queries cap
// at 100 rows (anything past that is rolled into an "Others" row). UTM
// dimensions need Enterprise or the Web Analytics Plus add-on, so they're
// left out.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const TEAM_SLUG = 'redox-bio-nutrients-projects'
const PROJECT = 'redox-website'
const API = 'https://api.vercel.com/v1/query/web-analytics'

// ── args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const arg = (name) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}
const isoDay = (d) => d.toISOString().slice(0, 10)
const today = new Date()

// A whole calendar month, from --month YYYY-MM or --last-month.
let month = arg('month')
if (args.includes('--last-month')) {
  const d = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
if (month && !/^\d{4}-\d{2}$/.test(month)) {
  console.error(`--month should look like 2026-10, got "${month}".`)
  process.exit(1)
}

let since, until
if (month) {
  const [y, m] = month.split('-').map(Number)
  since = `${month}-01`
  until = `${month}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`
} else {
  until = arg('until') ?? isoDay(today)
  since =
    arg('since') ??
    isoDay(new Date(new Date(until).getTime() - (Number(arg('days') ?? 30) - 1) * 86400000))
}
const label = month ?? `${since}_to_${until}`

// ── auth ──────────────────────────────────────────────────────────────
function getToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN
  const candidates = [
    path.join(os.homedir(), 'Library/Application Support/com.vercel.cli/auth.json'),
    path.join(os.homedir(), '.local/share/com.vercel.cli/auth.json'),
  ]
  for (const file of candidates) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8')).token
    } catch {
      /* try next */
    }
  }
  console.error('No Vercel token found. Run `npx vercel login` or set VERCEL_TOKEN.')
  process.exit(1)
}
const token = getToken()

async function query(endpoint, params = {}) {
  const url = new URL(`${API}/${endpoint}`)
  const all = { slug: TEAM_SLUG, projectId: PROJECT, since, until, ...params }
  for (const [k, v] of Object.entries(all)) url.searchParams.set(k, String(v))
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const body = await res.json()
  if (!res.ok || body.error) {
    throw new Error(`${endpoint} ${JSON.stringify(params)}: ${body.error?.message ?? res.status}`)
  }
  return body.data
}

// ── reports ───────────────────────────────────────────────────────────
// [file name, heading, `by` dimension, column label]
const BREAKDOWNS = [
  ['pages', 'Top pages', 'requestPath', 'Page'],
  ['referrers', 'Top referrers', 'referrerHostname', 'Referrer'],
  ['countries', 'Countries', 'country', 'Country'],
  ['devices', 'Devices', 'deviceType', 'Device'],
  ['browsers', 'Browsers', 'browserName', 'Browser'],
  ['operating-systems', 'Operating systems', 'osName', 'OS'],
]

console.log(`Exporting Web Analytics for ${since} → ${until}…`)

// `totals` comes from the count endpoint because summing daily visitors
// would double-count anyone who came back on another day.
const [totals, daily, ...breakdowns] = await Promise.all([
  query('visits/count'),
  query('visits/aggregate', { by: 'day', limit: 100 }),
  ...BREAKDOWNS.map(([, , by]) => query('visits/aggregate', { by, limit: 100 })),
])

// ── write CSVs ────────────────────────────────────────────────────────
const outDir = path.join(process.cwd(), 'analytics-exports', label)
fs.mkdirSync(outDir, { recursive: true })

const csvCell = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const writeCsv = (name, header, rows) =>
  fs.writeFileSync(
    path.join(outDir, `${name}.csv`),
    [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n',
  )

const dailyRows = daily.map((r) => [r.timestamp.slice(0, 10), r.pageviews, r.visitors])
writeCsv('daily', ['Date', 'Page views', 'Visitors'], dailyRows)

const labelFor = (by, value) => {
  if (value === '' || value == null) return by === 'referrerHostname' ? '(direct / none)' : '(none)'
  return value
}
const tables = BREAKDOWNS.map(([file, heading, by, label], i) => {
  const rows = breakdowns[i].map((r) => [labelFor(by, r[by]), r.pageviews, r.visitors])
  writeCsv(file, [label, 'Page views', 'Visitors'], rows)
  return { heading, label, rows, file }
})

// ── write report.html ─────────────────────────────────────────────────
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const fmt = (n) => Number(n).toLocaleString('en-US')
const fmtSecs = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s` : `${Math.round(s)}s`)
const pct = (now, then) => {
  if (!then) return ''
  const p = Math.round(((now - then) / then) * 100)
  return `<em class="${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '+' : ''}${p}% vs last year</em>`
}

// ── year-over-year vs Google Analytics ───────────────────────────────
// The old site (pre-2026-09-28) was measured by GA4 property 328430001
// (G-TC9K0REQ8R). Its monthly numbers were copied out of GA once into
// analytics-exports/ga-baseline.json (`months` keyed YYYY-MM, built by
// scripts/ga-baseline-import.mjs), since history doesn't change. The new
// site reports to that same property, so later months can be added to the
// same file and their engagement time shows here too. Month runs only.
const GA_BASELINE = path.join(process.cwd(), 'analytics-exports', 'ga-baseline.json')
const NEW_SITE_LAUNCH = '2026-09-28'
let ga = null
try {
  ga = JSON.parse(fs.readFileSync(GA_BASELINE, 'utf8'))
} catch {
  /* no baseline yet — report runs without the comparison */
}
const priorYear = month && `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`
const gaThen = priorYear && ga?.months?.[priorYear]
const gaNow = month && month >= NEW_SITE_LAUNCH.slice(0, 7) ? ga?.months?.[month] : null

// Vercel only knows referrer hostnames, so bucket them into GA's channel
// names to compare where traffic comes from.
function channelOf(host) {
  if (!host || host === '(direct / none)') return 'Direct'
  if (/(^|\.)(google|bing|duckduckgo|yahoo|ecosia|baidu|naver|yandex|brave)\.|googlequicksearchbox|^search\./.test(host)) return 'Organic Search'
  if (/facebook|linkedin|instagram|^t\.co$|twitter|x\.com|youtube|pinterest|reddit|tiktok/.test(host)) return 'Organic Social'
  if (/mailchi\.mp|campaign-archive|constantcontact|mail\./.test(host)) return 'Email'
  return 'Referral'
}

function yoyHtml() {
  if (!gaThen) return ''
  const t = gaThen.totals
  const refRows = tables.find((x) => x.file === 'referrers').rows.filter((r) => r[0] !== 'Others')
  const nowCh = {}
  for (const [host, , visitors] of refRows) nowCh[channelOf(host)] = (nowCh[channelOf(host)] ?? 0) + visitors
  // "Direct" can't be compared: Vercel's empty referrer also covers clicks
  // between pages, while GA's Direct is per session. So compare only
  // traffic that arrived from somewhere else.
  delete nowCh.Direct
  const thenCh = gaThen.channels.filter((c) => c.name !== 'Direct' && c.name !== 'Unassigned')
  const nowChTotal = Object.values(nowCh).reduce((a, b) => a + b, 0) || 1
  const thenChTotal = thenCh.reduce((a, c) => a + c.sessions, 0) || 1
  const channelNames = [...new Set([...thenCh.map((c) => c.name), ...Object.keys(nowCh)])]
  const usNow = tables.find((x) => x.file === 'countries').rows.find((r) => r[0] === 'US')?.[2] ?? 0
  const usThen = gaThen.countries.find((c) => c.name === 'United States')?.users ?? 0
  const share = (n, d) => `${Math.round((n / d) * 100)}%`

  const nowPages = tables.find((x) => x.file === 'pages').rows.filter((r) => r[0] !== 'Others').slice(0, 10)
  const thenPages = gaThen.pages.slice(0, 10)

  const engagementNow = gaNow
    ? `<b>${fmtSecs(gaNow.totals.engagementSecs)}</b><span>Avg engagement time, new site</span>${pct(gaNow.totals.engagementSecs, t.engagementSecs)}`
    : `<b class="na">Not yet</b><span>Avg engagement time, new site — GA4 measuring starts ${esc(ga.newSiteGaStart ?? 'soon')}</span>`

  return `
<h2>Compared with ${esc(priorYear)} (old site, Google Analytics)</h2>
<div class="stats stats--yoy">
  <div class="stat"><b>${fmt(totals.pageviews)}</b><span>Page views (last year ${fmt(t.views)})</span>${pct(totals.pageviews, t.views)}</div>
  <div class="stat"><b>${fmt(totals.visitors)}</b><span>Visitors (last year ${fmt(t.users)} users)</span>${pct(totals.visitors, t.users)}</div>
  <div class="stat"><b>${fmt(usNow)}</b><span>US visitors (last year ${fmt(usThen)} users)</span>${pct(usNow, usThen)}</div>
  <div class="stat"><b>${fmtSecs(t.engagementSecs)}</b><span>Avg engagement time, old site ${esc(priorYear)}</span></div>
  <div class="stat">${engagementNow}</div>
</div>
<div class="grid">
  <section><h3>Where outside traffic came from</h3>
  <table><thead><tr><th>Source</th><th>${esc(priorYear)}</th><th>${esc(month)}</th></tr></thead><tbody>
  ${channelNames.map((n) => `<tr><td>${esc(n)}</td><td>${share(thenCh.find((c) => c.name === n)?.sessions ?? 0, thenChTotal)}</td><td>${share(nowCh[n] ?? 0, nowChTotal)}</td></tr>`).join('')}
  </tbody></table>
  <p class="more">Share of visits that came from another site (direct visits left out). GA counts sessions; Vercel counts visitors by referrer.</p></section>
  <section><h3>Devices</h3>
  <table><thead><tr><th>Device</th><th>${esc(priorYear)}</th><th>${esc(month)}</th></tr></thead><tbody>
  ${['desktop', 'mobile', 'tablet'].map((d) => {
    const thenUsers = gaThen.devices.find((x) => x.name === d)?.users ?? 0
    const nowUsers = tables.find((x) => x.file === 'devices').rows.find((r) => r[0] === d)?.[2] ?? 0
    return `<tr><td>${d}</td><td>${share(thenUsers, t.users)}</td><td>${share(nowUsers, totals.visitors)}</td></tr>`
  }).join('')}
  </tbody></table></section>
</div>
<section><h3>Top 10 pages, then and now</h3>
<table class="then-now"><thead><tr><th>#</th><th>${esc(priorYear)} (old site)</th><th>Views</th><th>${esc(month)} (new site)</th><th>Views</th></tr></thead><tbody>
${thenPages.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.path)}</td><td>${fmt(p.views)}</td><td>${esc(nowPages[i]?.[0] ?? '')}</td><td>${nowPages[i] ? fmt(nowPages[i][1]) : ''}</td></tr>`).join('')}
</tbody></table>
<p class="more">The old site's URLs were different (e.g. /ag-bionutrients/ is now /agriculture, /product/… is now /products/…), and several old pages now redirect into /contact-us.</p></section>
<p class="note">How to read this: Google Analytics and Vercel count differently. GA counted “users” with cookies; Vercel counts visitors without cookies. Last year's GA numbers also include about ${fmt(gaThen.countries.filter((c) => c.engagementSecs === 0 && c.users >= 100).reduce((a, c) => a + c.users, 0))} users from countries with 0s engagement (almost certainly bots), and Vercel filters most bots out. Treat the % changes as rough direction, not exact growth.</p>`
}

function trendSvg(rows) {
  const w = 900, h = 220, pad = 30
  const max = Math.max(1, ...rows.map((r) => r[1]))
  const bw = (w - pad * 2) / Math.max(1, rows.length)
  const bars = rows
    .map(([date, pv, v], i) => {
      const bh = (pv / max) * (h - pad * 2)
      const vh = (v / max) * (h - pad * 2)
      const x = pad + i * bw
      return `<g><title>${date}: ${fmt(pv)} views, ${fmt(v)} visitors</title>
        <rect x="${x + 1}" y="${h - pad - bh}" width="${Math.max(1, bw - 2)}" height="${bh}" fill="#7CC242"/>
        <rect x="${x + bw * 0.3}" y="${h - pad - vh}" width="${Math.max(1, bw * 0.4)}" height="${vh}" fill="#253A2A"/></g>`
    })
    .join('')
  const first = rows[0]?.[0] ?? '', last = rows.at(-1)?.[0] ?? ''
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Daily page views and visitors">
    <line x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" stroke="#ccc"/>
    <text x="${pad}" y="${pad - 10}" font-size="11" fill="#666">max ${fmt(max)}</text>
    ${bars}
    <text x="${pad}" y="${h - 10}" font-size="11" fill="#666">${first}</text>
    <text x="${w - pad}" y="${h - 10}" font-size="11" fill="#666" text-anchor="end">${last}</text>
  </svg>`
}

// The report (and its PDF) only shows the top rows of each list so it
// prints in a few pages; the CSVs keep everything the API returned.
const REPORT_ROWS = 25
const tableHtml = ({ heading, label, rows, file }) => {
  const named = rows.filter((r) => r[0] !== 'Others')
  const shown = named.slice(0, REPORT_ROWS)
  const more = named.length - shown.length
  return `
  <section><h2>${esc(heading)}</h2>
  ${rows.length === 0 ? '<p class="empty">No data for this period.</p>' : `
  <table><thead><tr><th>${esc(label)}</th><th>Page views</th><th>Visitors</th></tr></thead>
  <tbody>${shown.map((r) => `<tr><td>${esc(r[0])}</td><td>${fmt(r[1])}</td><td>${fmt(r[2])}</td></tr>`).join('')}</tbody></table>
  ${more > 0 ? `<p class="more">+ ${more} more in ${file}.csv</p>` : ''}`}
  </section>`
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>redoxgrows.com analytics ${since} to ${until}</title>
<style>
  body { font: 14px/1.5 system-ui, sans-serif; color: #1d2a20; background: #fff; max-width: 960px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 24px; margin: 0 0 4px; } h2 { font-size: 17px; margin: 32px 0 8px; }
  .sub { color: #666; margin: 0 0 24px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
  .stat { border: 1px solid #e3e8e1; border-radius: 10px; padding: 14px 16px; }
  .stat b { display: block; font-size: 26px; } .stat span { color: #666; font-size: 12px; }
  .legend { font-size: 12px; color: #666; } .legend i { display: inline-block; width: 10px; height: 10px; margin: 0 4px 0 12px; vertical-align: middle; }
  svg { width: 100%; height: auto; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 0 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 3px 8px; border-bottom: 1px solid #eef1ec; }
  th:not(:first-child), td:not(:first-child) { text-align: right; white-space: nowrap; }
  td:first-child { word-break: break-all; }
  h3 { font-size: 15px; margin: 20px 0 6px; }
  .stat em { display: block; font-style: normal; font-size: 12px; margin-top: 2px; } .up { color: #2f7a1f; } .down { color: #b3261e; }
  .stats--yoy { grid-template-columns: repeat(5, 1fr); gap: 8px; } .stats--yoy .stat { padding: 12px; } .stats--yoy .stat b { font-size: 22px; }
  @media (max-width: 700px) { .stats--yoy { grid-template-columns: repeat(2, 1fr); } }
  .stat b.na { color: #888; font-size: 20px; }
  .then-now td:first-child { width: 2em; } .then-now :is(td, th):nth-child(2), .then-now :is(td, th):nth-child(4) { text-align: left; word-break: break-all; }
  .note { font-size: 12px; color: #555; background: #f5f7f3; border-radius: 8px; padding: 10px 12px; margin-top: 16px; }
  .empty, .more { color: #888; } .more { font-size: 12px; margin: 6px 8px 0; }
  footer { margin-top: 40px; color: #888; font-size: 12px; }
  @media print { body { padding: 0; } h2 { break-after: avoid; } tr { break-inside: avoid; } }
</style></head><body>
<h1>redoxgrows.com — site analytics</h1>
<p class="sub">${since} to ${until} · production traffic · source: Vercel Web Analytics${gaThen ? ' (last year: Google Analytics)' : ''}</p>
<div class="stats">
  <div class="stat"><b>${fmt(totals.pageviews)}</b><span>Page views</span></div>
  <div class="stat"><b>${fmt(totals.visitors)}</b><span>Unique visitors</span></div>
  <div class="stat"><b>${fmt(Math.round(totals.pageviews / Math.max(1, daily.length)))}</b><span>Avg views / day</span></div>
</div>
<h2>Daily traffic</h2>
<p class="legend"><i style="background:#7CC242"></i>Page views<i style="background:#253A2A"></i>Visitors</p>
${trendSvg(dailyRows)}
${yoyHtml()}
<div class="grid">${tables.map(tableHtml).join('')}</div>
<footer>Generated ${new Date().toLocaleString('en-US')} by scripts/analytics-export.mjs. Lists show the top ${REPORT_ROWS}; the full lists are in the CSV files alongside this report. Visitors are counted per row, so they don’t add up across rows.</footer>
</body></html>`
const htmlPath = path.join(outDir, 'report.html')
fs.writeFileSync(htmlPath, html)

// PDF copy for printing/emailing, rendered by the locally installed Chrome.
// Skipped (with a note) if Chrome isn't there — report.html still works.
const pdfName = `redoxgrows-analytics-${label}.pdf`
const chrome = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].find((p) => fs.existsSync(p))
let pdfMade = false
if (chrome) {
  try {
    execFileSync(chrome, [
      '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
      `--print-to-pdf=${path.join(outDir, pdfName)}`, `file://${htmlPath}`,
    ], { stdio: 'ignore' })
    pdfMade = true
  } catch {
    /* fall through to the note below */
  }
}

console.log(`Done → ${path.relative(process.cwd(), outDir)}/`)
console.log(`  ${fmt(totals.pageviews)} page views, ${fmt(totals.visitors)} visitors`)
console.log(`  daily.csv, ${BREAKDOWNS.map(([f]) => `${f}.csv`).join(', ')}, report.html${pdfMade ? `, ${pdfName}` : ''}`)
if (!pdfMade) console.log('  (No PDF — Google Chrome not found. Open report.html and print to PDF instead.)')
