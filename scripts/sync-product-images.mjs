#!/usr/bin/env node
// scripts/sync-product-images.mjs
//
// Keeps each Sanity product's Product Image in step with the product's
// packaging image in the Redox Asset Library (a shared claude.ai
// artifact). Only Claude can read that library — its database and files
// sit behind the viewer's claude.ai sign-in — so a Claude scheduled task
// does the library side and this script does the Sanity side, in two
// steps:
//
//   1. plan  — given the library's product-image records (exported by
//              Claude as JSON), work out which products need a new image.
//              Prints the plan, including which library files to download.
//
//        node scripts/sync-product-images.mjs plan --manifest <records.json> --out <plan.json>
//
//   2. apply — given the plan and a folder holding the downloaded files
//              (named <blobId>.<ext>), upload each image to Sanity and
//              point the product (published copy and any open draft) at
//              it, all in one transaction.
//
//        node scripts/sync-product-images.mjs apply --plan <plan.json> --blobs <dir> [--dry-run]
//
// <records.json> is an array of Asset Library `assets` records:
// { blobId, name, category, contentType, file, updatedAt?, addedAt }.
// Only the "Ag Product Images" and "Turf Product Images" categories are
// used. A product matches the record whose name equals its
// imageSync.libraryName, or else its own title, ignoring ®/™, case,
// spaces and punctuation. A library record's id IS its file's id, so a
// replaced image always shows up as a new blobId.
//
// Sanity auth: SANITY_WRITE_TOKEN if set, otherwise the Sanity CLI's
// saved login (~/.config/sanity/config.json). The read-only
// SANITY_API_TOKEN in .env can't write.

import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const IMAGE_CATEGORIES = new Set(['Ag Product Images', 'Turf Product Images'])
const API_VERSION = 'v2024-01-01'
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

// ── config ────────────────────────────────────────────────────────

function readEnvFile() {
  const file = path.join(process.cwd(), '.env')
  if (!fs.existsSync(file)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((line) => line.match(/^([A-Z0-9_]+)=(.*)$/))
      .filter(Boolean)
      .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]),
  )
}

const env = { ...readEnvFile(), ...process.env }
const PROJECT_ID = env.PUBLIC_SANITY_PROJECT_ID
const DATASET = env.PUBLIC_SANITY_DATASET || 'production'
if (!PROJECT_ID) fail('PUBLIC_SANITY_PROJECT_ID is not set (.env).')

function token() {
  if (env.SANITY_WRITE_TOKEN) return env.SANITY_WRITE_TOKEN
  const file = path.join(os.homedir(), '.config/sanity/config.json')
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')).authToken
  } catch {
    fail('No Sanity write token: set SANITY_WRITE_TOKEN or run `npx sanity login`.')
  }
}

const API = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}`

async function sanity(pathname, init = {}) {
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: { Authorization: `Bearer ${token()}`, ...(init.headers || {}) },
  })
  const text = await res.text()
  if (!res.ok) fail(`Sanity ${res.status} on ${pathname}: ${text.slice(0, 500)}`)
  return JSON.parse(text)
}

// ── helpers ───────────────────────────────────────────────────────

function fail(message) {
  console.error(`sync-product-images: ${message}`)
  process.exit(1)
}

function args() {
  const [command, ...rest] = process.argv.slice(2)
  const opts = {}
  for (let i = 0; i < rest.length; i++) {
    const key = rest[i].replace(/^--/, '')
    const next = rest[i + 1]
    if (next === undefined || next.startsWith('--')) opts[key] = true
    else opts[key] = rest[++i]
  }
  return { command, opts }
}

const normalize = (name) =>
  String(name || '')
    .replace(/[®™]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+]/g, '')

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))

// ── plan ──────────────────────────────────────────────────────────

async function plan({ manifest, out }) {
  if (!manifest) fail('plan needs --manifest <records.json>')
  const records = readJson(manifest).filter((r) => IMAGE_CATEGORIES.has(r.category))
  if (records.length === 0) fail('The manifest has no product-image records — refusing to plan against an empty library.')

  const byName = new Map()
  for (const record of records) {
    const key = normalize(record.name)
    if (byName.has(key)) {
      // Two records with one name: prefer the most recently changed.
      const other = byName.get(key)
      const stamp = (r) => r.updatedAt || r.addedAt || ''
      if (stamp(record) <= stamp(other)) continue
    }
    byName.set(key, record)
  }

  const query = encodeURIComponent(
    `*[_type == "product" && !(_id in path("drafts.**"))]{_id, title, "assetId": image.asset._ref, "sha1": image.asset->sha1hash, imageSync}`,
  )
  const { result: products } = await sanity(`/data/query/${DATASET}?query=${query}`)

  const changes = []
  const unchanged = []
  const paused = []
  const unmatched = []
  for (const product of products) {
    if (product.imageSync?.paused) {
      paused.push(product.title)
      continue
    }
    const lookup = product.imageSync?.libraryName || product.title
    const record = byName.get(normalize(lookup))
    if (!record) {
      unmatched.push({ title: product.title, lookedFor: lookup })
      continue
    }
    if (product.imageSync?.blobId === record.blobId) {
      unchanged.push(product.title)
      continue
    }
    changes.push({
      productId: product._id,
      title: product.title,
      currentAssetId: product.assetId || null,
      currentSha1: product.sha1 || null,
      libraryName: record.name,
      blobId: record.blobId,
      contentType: record.contentType,
      file: record.file,
      libraryUpdatedAt: record.updatedAt || record.addedAt || null,
    })
  }

  const result = {
    plannedAt: new Date().toISOString(),
    changes,
    download: changes.map((c) => c.blobId),
    unchanged: unchanged.length,
    paused,
    unmatched,
  }
  if (out) fs.writeFileSync(out, JSON.stringify(result, null, 2))
  console.log(JSON.stringify({ ...result, changes: changes.map((c) => `${c.title} ← ${c.libraryName} (${c.blobId})`) }, null, 2))
}

// ── apply ─────────────────────────────────────────────────────────

async function apply({ plan: planFile, blobs, 'dry-run': dryRun }) {
  if (!planFile || !blobs) fail('apply needs --plan <plan.json> --blobs <dir>')
  const { changes } = readJson(planFile)
  if (changes.length === 0) {
    console.log('Nothing to sync.')
    return
  }

  const ids = changes.flatMap((c) => [c.productId, `drafts.${c.productId}`])
  const { documents } = await sanity(`/data/doc/${DATASET}/${ids.join(',')}`)
  const existing = new Map(documents.map((d) => [d._id, d]))

  const mutations = []
  const report = []
  const syncedAt = new Date().toISOString()

  for (const change of changes) {
    const ext = EXT[change.contentType] || path.extname(change.file || '').slice(1) || 'png'
    const blobPath = path.join(blobs, `${change.blobId}.${ext}`)
    if (!fs.existsSync(blobPath)) fail(`Missing downloaded file ${blobPath} for ${change.title}.`)
    const bytes = fs.readFileSync(blobPath)
    const sha1 = crypto.createHash('sha1').update(bytes).digest('hex')

    // Sanity dedupes by content, so an identical image only gets the
    // sync record — the product page doesn't change.
    let assetId = change.currentAssetId
    const sameImage = sha1 === change.currentSha1
    if (!sameImage) {
      if (dryRun) assetId = '(would upload)'
      else {
        const filename = encodeURIComponent(change.file || `${change.blobId}.${ext}`)
        const { document } = await sanity(`/assets/images/${DATASET}?filename=${filename}`, {
          method: 'POST',
          headers: { 'Content-Type': change.contentType || 'image/png' },
          body: bytes,
        })
        assetId = document._id
      }
    }

    for (const id of [change.productId, `drafts.${change.productId}`]) {
      const doc = existing.get(id)
      if (!doc) continue
      mutations.push({
        patch: {
          id,
          ifRevisionID: doc._rev,
          set: {
            'image._type': 'image',
            'image.asset': { _type: 'reference', _ref: assetId },
            'image.alt': doc.image?.alt || `${change.title} product image`,
            'imageSync.blobId': change.blobId,
            'imageSync.syncedAt': syncedAt,
          },
        },
      })
    }
    report.push({ title: change.title, libraryName: change.libraryName, imageChanged: !sameImage, assetId })
  }

  if (!dryRun) {
    await sanity(`/data/mutate/${DATASET}?returnIds=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mutations }),
    })
  }
  console.log(JSON.stringify({ dryRun: Boolean(dryRun), synced: report }, null, 2))
}

// ── main ──────────────────────────────────────────────────────────

const { command, opts } = args()
if (command === 'plan') await plan(opts)
else if (command === 'apply') await apply(opts)
else fail('usage: sync-product-images.mjs plan --manifest <file> [--out <file>] | apply --plan <file> --blobs <dir> [--dry-run]')
