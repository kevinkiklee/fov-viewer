#!/usr/bin/env node
// Detects English strings copied verbatim into non-English locale files.
// Exit code 1 if any HARD flag is found.

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const MESSAGES_DIR = 'src/lib/i18n/messages'
const BASE_LOCALE = 'en'

// Allowlist of English tokens that may appear in any locale file.
// These are brand names, technical codes, unit labels, and sensor format proper nouns.
const ALLOWLIST = new Set([
  // Brand/tool names
  'PhotoTools', 'FOV Simulator', 'Frame Studio', 'EXIF Viewer', 'GitHub', 'Reddit',
  'Markdown (Reddit, GitHub)', 'BBCode (Forums)', 'HTML Embed', 'Direct Link',
  // Technical codes
  'EXIF', 'ISO', 'JPEG', 'PNG', 'RAW', 'GPS', 'NPF', 'DoF', 'CoC',
  'WebGL', 'HDR', 'SD', 'CF', 'URL', 'HTML', 'CSS', 'API',
  // Units
  'mm', 'fps', 'px', 'GB', 'MB', 'KB', 'K',
  // Sensor format proper nouns (kept English across all locales by project convention)
  'Full Frame', 'Medium Format (54x40)', 'Medium Format (44x33)', 'Medium Format (45x30)',
  'APS-C (1.5x)', 'APS-C (Canon)', 'Micro Four Thirds', '1" Sensor',
  'Smartphone Flagship (1/1.3")',
  // Form placeholders
  'your@email.com', 'Email', 'Website', 'Name',
])

// Regex patterns for strings that are ALWAYS allowed (e.g., f-stop notation, shutter speeds).
const ALLOW_PATTERNS = [
  /^f\/[\d.]+$/,                   // f/1.4, f/2.8, f/5.6, etc.
  /^[\d.]+$/,                      // pure numbers
  /^\d+\/\d+s?$/,                  // 1/250s, 1/60
  /^\d+s$/,                        // 30s
  /^\d+K$/,                        // 5500K (color temperature)
  /^\d+mm$/,                       // 50mm
  /^-?\d+(\.\d+)?\s*(EV|stops?)$/i, // -2 EV, +1 stop
]

const STOPWORDS = ['the', 'and', 'of', 'is', 'to', 'in', 'a', 'with', 'for', 'on', 'at', 'by', 'from']

function getLocales() {
  return readdirSync(MESSAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== BASE_LOCALE)
    .map((d) => d.name)
}

function getJsonFiles(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...getJsonFiles(p).map((f) => join(e.name, f)))
    else if (e.name.endsWith('.json')) out.push(e.name)
  }
  return out
}

function flatten(obj, prefix = '') {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null) Object.assign(out, flatten(v, `${prefix}${k}.`))
    else if (typeof v === 'string') out[`${prefix}${k}`] = v
  }
  return out
}

function isAllowed(value) {
  const trimmed = value.trim()
  if (ALLOWLIST.has(trimmed)) return true
  for (const pattern of ALLOW_PATTERNS) {
    if (pattern.test(trimmed)) return true
  }
  return false
}

function countStopwords(value) {
  const words = value.toLowerCase().split(/\s+/)
  return words.filter((w) => STOPWORDS.includes(w)).length
}

function levenshtein(a, b) {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const matrix = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
    }
  }
  return matrix[b.length][a.length]
}

function scanLocale(locale) {
  const baseFiles = getJsonFiles(join(MESSAGES_DIR, BASE_LOCALE))
  const hard = []
  const soft = []

  for (const file of baseFiles) {
    const enPath = join(MESSAGES_DIR, BASE_LOCALE, file)
    const localePath = join(MESSAGES_DIR, locale, file)
    let enFlat, locFlat
    try {
      enFlat = flatten(JSON.parse(readFileSync(enPath, 'utf8')))
      locFlat = flatten(JSON.parse(readFileSync(localePath, 'utf8')))
    } catch (e) {
      hard.push({ file, key: '*', en: '', loc: '', reason: `read/parse failed: ${e.message}` })
      continue
    }

    for (const [key, enVal] of Object.entries(enFlat)) {
      const locVal = locFlat[key]
      if (locVal === undefined) continue
      if (typeof locVal !== 'string') continue
      if (isAllowed(locVal)) continue

      // HARD flag: long strings identical to English source are real leaks.
      // Short strings (≤25 chars) identical to English are usually cross-language cognates
      // like "Distance", "Contact", "Message", "Email", "Sensor" — skip them.
      if (enVal === locVal && enVal.length > 25) {
        hard.push({ file, key, en: enVal, loc: locVal, reason: 'identical to en source (long)' })
        continue
      }

      // SOFT flag: short identical matches — worth a look but often legitimate
      if (enVal === locVal && enVal.length > 2) {
        soft.push({ file, key, en: enVal, loc: locVal, reason: 'identical to en source (short)' })
        continue
      }

      if (countStopwords(locVal) >= 3) {
        soft.push({ file, key, en: enVal, loc: locVal, reason: '3+ English stopwords' })
        continue
      }

      if (enVal.length > 20 && locVal.length > 20) {
        const dist = levenshtein(enVal.toLowerCase(), locVal.toLowerCase())
        if (dist < 5) {
          soft.push({ file, key, en: enVal, loc: locVal, reason: `levenshtein=${dist}` })
        }
      }
    }
  }
  return { hard, soft }
}

const locales = getLocales()
let totalHard = 0
let totalSoft = 0
const report = {}

for (const locale of locales) {
  const { hard, soft } = scanLocale(locale)
  if (hard.length || soft.length) {
    report[locale] = { hard, soft }
    totalHard += hard.length
    totalSoft += soft.length
  }
}

if (totalHard === 0 && totalSoft === 0) {
  console.log('✓ No English leaks detected across all locales.')
  process.exit(0)
}

console.log(`Found ${totalHard} HARD leaks and ${totalSoft} SOFT leaks across ${Object.keys(report).length} locale(s).\n`)
for (const [locale, { hard, soft }] of Object.entries(report)) {
  console.log(`=== ${locale} ===`)
  console.log(`  HARD: ${hard.length}`)
  for (const leak of hard.slice(0, 10)) {
    console.log(`    [${leak.file}] ${leak.key}: "${leak.loc}" — ${leak.reason}`)
  }
  if (hard.length > 10) console.log(`    ... and ${hard.length - 10} more`)
  console.log(`  SOFT: ${soft.length}`)
  for (const leak of soft.slice(0, 5)) {
    console.log(`    [${leak.file}] ${leak.key}: "${leak.loc}" — ${leak.reason}`)
  }
  if (soft.length > 5) console.log(`    ... and ${soft.length - 5} more`)
  console.log()
}

process.exit(totalHard > 0 ? 1 : 0)
