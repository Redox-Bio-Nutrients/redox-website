#!/usr/bin/env node
// scripts/ga-baseline-import.mjs
//
// Merges monthly Google Analytics numbers into
// analytics-exports/ga-baseline.json, which analytics-export.mjs reads for
// its year-over-year section.
//
//   node scripts/ga-baseline-import.mjs <raw.json>
//
// <raw.json> is an array of months as read off GA4's standard reports
// (Pages and screens, Traffic acquisition, Demographic details: Country,
// Tech details: Device category), one row per table line with the
// "Total" row first:
//   [{ month: '2025-10',
//      pages: [['Total', '8,464', '3,000', '1m 02s'], ['/', '1,764', '1,262', '17s'], …],
//      ch:    [['Total', '4,334', '1,994', '46.01%', '43s'], ['Organic Search', …], …],
//      co:    [['Total', '3,000', '1m 02s'], ['United States', '1,824', '1m 25s'], …],
//      dev:   [['Total', '3,000', '1m 02s'], ['desktop', '2,132', '1m 03s'], …] }]
// Existing months in the baseline are replaced; other months are kept.

import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'analytics-exports', 'ga-baseline.json')
const src = process.argv[2]
if (!src) {
  console.error('Usage: node scripts/ga-baseline-import.mjs <raw.json>')
  process.exit(1)
}

const num = (s) => Number(String(s ?? '0').replace(/[,%]/g, '')) || 0
const secs = (s) => {
  if (!s || s.startsWith('<')) return 0
  const m = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/.exec(s)
  return (Number(m[1] ?? 0) * 3600) + (Number(m[2] ?? 0) * 60) + Number(m[3] ?? 0)
}
const body = (rows) => rows.filter((r) => r[0] !== 'Total')
const total = (rows) => rows.find((r) => r[0] === 'Total')

const baseline = fs.existsSync(OUT)
  ? JSON.parse(fs.readFileSync(OUT, 'utf8'))
  : {
      source: 'Google Analytics 4 — property "Redox Bio-Nutrients" (328430001), stream www.redoxgrows.com, G-TC9K0REQ8R',
      months: {},
    }

for (const m of JSON.parse(fs.readFileSync(src, 'utf8'))) {
  const p = total(m.pages), c = total(m.ch)
  baseline.months[m.month] = {
    totals: {
      views: num(p[1]),
      users: num(p[2]),
      engagementSecs: secs(p[3]),
      sessions: num(c[1]),
      engagedSessions: num(c[2]),
      engagementRate: num(c[3]),
    },
    pages: body(m.pages).map(([path, views, users, eng]) => ({ path, views: num(views), users: num(users), engagementSecs: secs(eng) })),
    channels: body(m.ch).map(([name, sessions, engaged, , eng]) => ({ name, sessions: num(sessions), engagedSessions: num(engaged), engagementSecs: secs(eng) })),
    countries: body(m.co).map(([name, users, eng]) => ({ name, users: num(users), engagementSecs: secs(eng) })),
    devices: body(m.dev).map(([name, users, eng]) => ({ name, users: num(users), engagementSecs: secs(eng) })),
  }
  const t = baseline.months[m.month].totals
  console.log(`${m.month}: ${t.views} views, ${t.users} users, ${t.engagementSecs}s avg engagement`)
}

baseline.months = Object.fromEntries(Object.entries(baseline.months).sort(([a], [b]) => a.localeCompare(b)))
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(baseline, null, 2) + '\n')
console.log(`Wrote ${path.relative(process.cwd(), OUT)} (${Object.keys(baseline.months).length} months)`)
