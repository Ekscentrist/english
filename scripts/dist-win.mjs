import { spawn } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'

const cacheDir = join(homedir(), 'AppData', 'Local', 'electron-builder', 'Cache', 'winCodeSign')

async function main() {
  process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false'

  console.log('Clearing winCodeSign cache…')
  await rm(cacheDir, { recursive: true, force: true })

  console.log('Building renderer/main…')
  await run('npm', ['run', 'build'])

  console.log('Packaging Windows installer (unsigned)…')
  await run('npx', ['electron-builder', '--win'])
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`))
    })
  })
}

main().catch((err) => {
  console.error(err.message || err)
  console.error(`
If you still see "Cannot create symbolic link":
  1. Open Settings → System → For developers → enable Developer Mode
  2. Or run: start ms-settings:developers
  3. Then re-run: npm run dist
`)
  process.exit(1)
})
