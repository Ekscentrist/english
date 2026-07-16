import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const VERSION = '0.39.6'
const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'pocketbase')

const platformMap = {
  'win32-x64': 'windows_amd64',
  'win32-arm64': 'windows_arm64',
  'darwin-x64': 'darwin_amd64',
  'darwin-arm64': 'darwin_arm64',
  'linux-x64': 'linux_amd64',
  'linux-arm64': 'linux_arm64',
}

const key = `${process.platform}-${os.arch()}`
const asset = platformMap[key]

if (!asset) {
  console.error(`Unsupported platform: ${key}`)
  process.exit(1)
}

const isWin = process.platform === 'win32'
const binaryName = isWin ? 'pocketbase.exe' : 'pocketbase'
const binaryPath = join(outDir, binaryName)

if (existsSync(binaryPath)) {
  console.log(`Already present: ${binaryPath}`)
  process.exit(0)
}

mkdirSync(outDir, { recursive: true })

const zipName = `pocketbase_${VERSION}_${asset}.zip`
const url = `https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/${zipName}`
const zipPath = join(outDir, zipName)

console.log(`Downloading ${url}`)
const res = await fetch(url)
if (!res.ok) {
  console.error(`Download failed: ${res.status} ${res.statusText}`)
  process.exit(1)
}

await pipeline(Readable.fromWeb(res.body), createWriteStream(zipPath))
console.log('Extracting...')

if (isWin) {
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir}' -Force`,
    ],
    { stdio: 'inherit' },
  )
} else {
  execFileSync('unzip', ['-o', zipPath, '-d', outDir], { stdio: 'inherit' })
}

try {
  unlinkSync(zipPath)
} catch {
  // ignore
}

if (!existsSync(binaryPath)) {
  console.error(`Expected binary not found at ${binaryPath}`)
  process.exit(1)
}

console.log(`Ready: ${binaryPath}`)
