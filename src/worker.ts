import type { Vector } from './vector'
import * as vec from './vector'

export type Sphere = [
  pos: [x: number, y: number, z: number],
  radius: number,
  color?: [r: number, g: number, b: number]
]
export type Config = {
  objs: Sphere[]
  renderLights: boolean
  limit: number
  sab: SharedArrayBuffer
  thread: { count: number; index: number }
  width: number
  height: number
  viewWidth: number
  chunkWidth: number
  offset: number
  maxBlockSize: number
}

let config: Config
let buffer: Uint32Array

self.addEventListener('message', e => {
  switch (e.data.type) {
    case 'config':
      config = e.data.config
      buffer = new Uint32Array(config.sab)
      buffer[config.thread.index] = config.thread.index
      break
    case 'render':
      render(e.data.blockSize, e.data.interlaced)
      break
    default:
      throw Error(`unknown message type '${e.data.type}'`)
  }
})

const clamp = (min: number, n: number, max: number) =>
  Math.max(min, Math.min(max, n))

const color = (r: number, g: number, b: number) =>
  ((clamp(0, Math.round(r), 0xff) << 24) >>> 0) +
  (clamp(0, Math.round(g), 0xff) << 16) +
  (clamp(0, Math.round(b), 0xff) << 8) +
  0xff

async function render(blockSize: number, inl = false) {
  const vrW = config.viewWidth
  const vrH = (config.height / config.width) * vrW
  const offset = config.offset * config.thread.index
  const x0 = config.chunkWidth * config.thread.index

  let i = 0
  for (let y = 0; y < config.height; y += blockSize) {
    for (
      let x = x0;
      x < config.chunkWidth * (config.thread.index + 1);
      x += blockSize
    ) {
      if (inl && (y / blockSize) % 2 === 0 && ((x - x0) / blockSize) % 2 === 0)
        continue

      const dir: Vector = [
        (x / config.width) * vrW - vrW / 2,
        (y / config.height) * -vrH + vrH / 2,
        1,
      ]
      const pos: Vector = [0, 0, 0]
      const r = trace(pos, vec.norm(dir))
      const bi = offset + i++

      if (!r) {
        buffer[bi] = 0x000000ff
        continue
      }

      let max = 0
      const adj = r[0].map(v => {
        const a = v * (1.2e4 / r[1] ** 2)
        if (a > max) max = a
        return a * 0xff
      }) as Vector

      buffer[bi] = color(...adj)
    }
  }
}

function trace(pos: Vector, dir: Vector, lvl = 0): [Vector, number] | null {
  if (lvl > config.limit) return null
  let candidate = null

  for (const obj of config.objs) {
    if (lvl === 0 && obj[2] && !config.renderLights) continue
    const hit = intersect(pos, dir, obj[0], obj[1])
    if (!hit) continue
    if (hit[1] < (candidate?.dist ?? Infinity))
      candidate = { obj, dist: hit[1], at: hit[0] }
  }

  if (!candidate) return null
  if (candidate.obj[2]) return [candidate.obj[2], candidate.dist]
  let vh = vec.sub(candidate.at, candidate.obj[0])
  if (candidate.obj[1] !== 1) vh = vec.norm(vh)
  const res = trace(candidate.at, vec.reflect(dir, vh), lvl + 1)
  return res && [res[0].map(v => v * 0.97) as any, res[1] + candidate.dist]
}

function intersect(o: Vector, u: Vector, c: Vector, r: number) {
  const omc = vec.sub(o, c)
  const du = vec.dot(u, omc)
  const s = du ** 2 - (vec.mag(omc) ** 2 - r ** 2)
  if (s <= 0) return null
  const d = -du - Math.sqrt(s)
  if (d <= 0) return null
  return [vec.add(o, vec.mult(u, d)), d]
}
