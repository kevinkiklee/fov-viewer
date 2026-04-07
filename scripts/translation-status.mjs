#!/usr/bin/env node
// Reports per-locale translation status: file count, key parity, last modified.

import { readdirSync, readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'

const MESSAGES_DIR = 'src/lib/i18n/messages'
const BASE_LOCALE = 'en'

function getJsonFiles(dir) {
  const out = []
  if (!existsSync(dir)) return out
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...getJsonFiles(p).map((f) => join(e.name, f)))
    else if (e.name.endsWith('.json')) out.push(e.name)
  }
  return out
}

function getKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? getKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  )
}

const baseFiles = getJsonFiles(join(MESSAGES_DIR, BASE_LOCALE))
const expectedFileCount = baseFiles.length
const expectedKeysByFile = {}
for (const f of baseFiles) {
  expectedKeysByFile[f] = getKeys(JSON.parse(readFileSync(join(MESSAGES_DIR, BASE_LOCALE, f), 'utf8')))
}

const locales = readdirSync(MESSAGES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()

console.log(`Expected: ${expectedFileCount} files per locale`)
console.log()
console.log('Locale  | Files | Missing keys | Last modified')
console.log('--------|-------|--------------|-------------------')

for (const locale of locales) {
  const localeDir = join(MESSAGES_DIR, locale)
  const files = getJsonFiles(localeDir)
  let missingKeys = 0
  let latestMtime = 0

  for (const f of baseFiles) {
    const p = join(localeDir, f)
    if (!existsSync(p)) {
      missingKeys += expectedKeysByFile[f].length
      continue
    }
    const localeKeys = new Set(getKeys(JSON.parse(readFileSync(p, 'utf8'))))
    for (const k of expectedKeysByFile[f]) {
      if (!localeKeys.has(k)) missingKeys++
    }
    const mtime = statSync(p).mtimeMs
    if (mtime > latestMtime) latestMtime = mtime
  }

  const lastMod = latestMtime ? new Date(latestMtime).toISOString().slice(0, 19).replace('T', ' ') : 'n/a'
  console.log(`${locale.padEnd(7)} | ${String(files.length).padStart(5)} | ${String(missingKeys).padStart(12)} | ${lastMod}`)
}
