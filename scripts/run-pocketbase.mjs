import { existsSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const pbDir = join(root, 'pocketbase')
const isWin = process.platform === 'win32'
const binaryPath = join(pbDir, isWin ? 'pocketbase.exe' : 'pocketbase')

if (!existsSync(binaryPath)) {
  console.log('PocketBase binary missing — downloading...')
  const result = spawnSync(process.execPath, [join(__dirname, 'download-pocketbase.mjs')], {
    cwd: root,
    stdio: 'inherit',
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const child = spawn(
  binaryPath,
  ['serve', '--http=127.0.0.1:8090', '--dir=pb_data', '--migrationsDir=pb_migrations'],
  {
    cwd: pbDir,
    stdio: 'inherit',
    shell: false,
  },
)

child.on('exit', (code) => process.exit(code ?? 0))

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    child.kill(signal)
  })
}
