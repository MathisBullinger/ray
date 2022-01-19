import objs from './scene'
// @ts-ignore
import Worker from './worker.ts?worker'
import type { Config } from './worker'

const roundUp = (n: number, m: number) => (n % m ? n + m - (n % m) : n)

const renderLights = true
const limit = 50
const threadCount = navigator.hardwareConcurrency
const maxBlockSize = 16

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
let width = (canvas.width = window.innerWidth * devicePixelRatio)
const height = (canvas.height = window.innerHeight * devicePixelRatio)

const chunkWidth = roundUp(width / threadCount, maxBlockSize)
width = chunkWidth * threadCount
const offset = chunkWidth * height

const size = 32 * width * height
const sab = new SharedArrayBuffer(size)
const buffer = new Uint32Array(sab)

const threads = [...Array(threadCount)].map((_, index) => {
  const worker = new Worker()

  const config: Config = {
    objs,
    renderLights,
    thread: { count: threadCount, index },
    sab,
    limit,
    width,
    height,
    viewWidth: 1.5,
    chunkWidth,
    offset,
    maxBlockSize,
  }

  worker.postMessage({
    type: 'config',
    config,
  })
  return worker
})

;(async () => {
  for (let s = maxBlockSize; s >= 1; s /= 2) {
    const t0 = performance.now()
    await render(s, s < maxBlockSize)
    console.log(
      `layer ${s} done in ${Math.round((performance.now() - t0) / 10) / 100} s`
    )
  }
})()

async function render(blockSize: number, interlaced = false) {
  let chunkSize = (width / blockSize / threadCount) * (height / blockSize)
  if (interlaced) chunkSize = (chunkSize / 4) * 3

  for (let i = 0; i < threadCount; i++) {
    const worker = threads[i]
    buffer.fill(0, i * offset, (i + 1) * offset)
    setTimeout(() =>
      worker.postMessage({ type: 'render', blockSize, interlaced })
    )
  }

  const cursors = [...Array(threadCount)].map((_, i) => ({
    i: i * offset,
    done: false,
    xOff: (chunkWidth / blockSize) * i,
    x: +interlaced,
    y: 0,
  }))

  while (cursors.some(({ done }) => !done)) {
    for (let i = 0; i < threadCount; i++) {
      const cursor = cursors[i]

      while (!cursor.done && buffer[cursor.i] !== 0) {
        const r = (buffer[cursor.i] >> 24) & 0xff
        const g = (buffer[cursor.i] >> 16) & 0xff
        const b = (buffer[cursor.i] >> 8) & 0xff

        const clStr = `#${[r, g, b]
          .map(v => {
            const str = v.toString(16)
            return str.length >= 2 ? str : '0' + str
          })
          .join('')}`

        ctx.fillStyle = clStr
        ctx.fillRect(
          (cursor.xOff + cursor.x) * blockSize,
          cursor.y * blockSize,
          blockSize,
          blockSize
        )

        cursor.i++
        cursor.x += interlaced && !(cursor.y % 2) ? 2 : 1
        if (cursor.x >= chunkWidth / blockSize) {
          cursor.y++
          cursor.x = +(interlaced && !(cursor.y % 2))
        }
        cursor.done = cursor.y >= height / blockSize
      }
    }

    await new Promise(requestAnimationFrame)
  }
}
