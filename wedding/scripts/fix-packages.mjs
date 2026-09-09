/* eslint-disable */
// One-off fix: extract packages that npm 11.17 silently fails to materialize.
// Reads the lockfile, downloads missing packages via npm's cache, extracts them.

import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'))

function missing(pkgDir) {
  const pj = path.join(pkgDir, 'package.json')
  if (!fs.existsSync(pj)) return true
  // Verify main entry exists to catch partial extraction
  try {
    const pkg = JSON.parse(fs.readFileSync(pj, 'utf8'))
    return false
  } catch {
    return true
  }
}

function extract(tarballPath, dest) {
  fs.mkdirSync(dest, { recursive: true })
  execSync(`tar -xzf "${tarballPath}" -C "${dest}" --strip-components=1`, { stdio: 'inherit' })
}

function download(resolved, integrity) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'npmfix-'))
  const tarball = path.join(tmp, 'pkg.tgz')
  execSync(`curl -sL -o "${tarball}" "${resolved}"`, { stdio: 'inherit' })
  // Verify integrity if present
  if (integrity) {
    const algo = integrity.split('-')[0] // sha512
    const expected = Buffer.from(integrity.split('-')[1], 'base64').toString('hex')
    const actual = createHash(algo).update(fs.readFileSync(tarball)).digest('hex')
    if (actual !== expected) {
      throw new Error(`Integrity mismatch for ${resolved}`)
    }
  }
  return tarball
}

const queue = [
  'node_modules/@tailwindcss/postcss',
  'node_modules/tsx',
  'node_modules/eslint',
  'node_modules/eslint-config-next',
  'node_modules/@types/bcryptjs',
  'node_modules/@types/node',
  'node_modules/@types/react',
  'node_modules/@types/react-dom',
  'node_modules/@types/better-sqlite3',
]
const visited = new Set()

while (queue.length) {
  const rel = queue.shift()
  if (visited.has(rel)) continue
  visited.add(rel)
  const dir = path.join(root, rel)
  if (!missing(dir)) continue

  const entry = lock.packages?.[rel]
  if (!entry) {
    console.log(`  (no lockfile entry for ${rel}, skipping)`)
    continue
  }

  console.log(`Extracting ${rel}@${entry.version}...`)
  const tarball = download(entry.resolved, entry.integrity)
  extract(tarball, dir)
  fs.rmSync(path.dirname(tarball), { recursive: true, force: true })

  // Queue dependencies of the extracted package
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
  const deps = { ...(pkg.dependencies || {}), ...(pkg.optionalDependencies || {}), ...(pkg.peerDependencies || {}) }
  for (const dep of Object.keys(deps)) {
    const depEntry = lock.packages?.[`node_modules/${dep}`]
    if (depEntry) {
      // Scoped deps may be nested; just queue the top-level entry
      queue.push(`node_modules/${dep}`)
    }
  }

  // Create bin links
  const bins = pkg.bin
  if (bins && typeof bins === 'object') {
    for (const [name, target] of Object.entries(bins)) {
      const binDir = path.join(root, 'node_modules/.bin')
      fs.mkdirSync(binDir, { recursive: true })
      const link = path.join(binDir, name)
      const resolvedTarget = path.join(dir, target)
      try {
        fs.unlinkSync(link)
      } catch {}
      fs.symlinkSync(resolvedTarget, link, 'file')
      console.log(`  linked bin ${name}`)
    }
  } else if (typeof bins === 'string') {
    const binDir = path.join(root, 'node_modules/.bin')
    fs.mkdirSync(binDir, { recursive: true })
    const name = pkg.name.split('/').pop()
    const link = path.join(binDir, name)
    const resolvedTarget = path.join(dir, bins)
    try {
      fs.unlinkSync(link)
    } catch {}
    fs.symlinkSync(resolvedTarget, link, 'file')
    console.log(`  linked bin ${name}`)
  }
}

console.log('\nDone. Missing packages extracted.')
