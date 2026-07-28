import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import toIco from 'to-ico'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = join(root, 'build', 'icon.svg')
const outDir = join(root, 'build')

const sizes = [16, 24, 32, 48, 64, 128, 256, 512]

async function main() {
  await mkdir(outDir, { recursive: true })
  const svg = await readFile(svgPath)

  const pngBuffers = []
  for (const size of sizes) {
    const buf = await sharp(svg, { density: 384 })
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .png()
      .toBuffer()

    pngBuffers.push({ size, buf })
    if (size === 256 || size === 512) {
      await writeFile(join(outDir, `icon-${size}.png`), buf)
    }
  }

  // Primary PNG for electron-builder / linux
  await writeFile(join(outDir, 'icon.png'), pngBuffers.find((p) => p.size === 512).buf)

  // Windows ICO with multiple sizes
  const ico = await toIco(
    pngBuffers.filter((p) => [16, 24, 32, 48, 64, 128, 256].includes(p.size)).map((p) => p.buf),
  )
  await writeFile(join(outDir, 'icon.ico'), ico)

  // Also refresh public favicon as transparent PNG for renderer
  const favicon = await sharp(svg, { density: 384 })
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer()
  await writeFile(join(root, 'public', 'favicon.png'), favicon)

  console.log('Icons written to build/ (icon.ico, icon.png) with transparent background')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
