import { mag, dot, add, sub, mult, norm, rgb, reflect } from './vector'
import objs from './scene'

const renderLights = true
const limit = 50
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth * devicePixelRatio
canvas.height = window.innerHeight * devicePixelRatio

const clAss = (ch, d) => {
  let max = 0
  const adj = ch.map((v) => {
    const r = v * (1.2e4 / d ** 2)
    if (r > max) max = r
    return r
  })
  return rgb(...(max <= 1 ? adj : adj.map((v) => v * (1 / max))))
}

async function render(raysW, skip = 0) {
  const raysH = Math.ceil((canvas.height / canvas.width) * raysW)
  const pos = [0, 0, 0]
  const vrW = 1
  const vrH = (canvas.height / canvas.width) * vrW

  for (let y = 0; y < raysH; y++) {
    for (let x = 0; x < raysW; x++) {
      if ((y * raysW + x) % (4 * raysW) === 0)
        await new Promise(requestAnimationFrame)
      if (skip && x % skip === 0 && y % skip === 0) continue
      const dir = [(x / raysW) * vrW - vrW / 2, (y / raysH) * -vrH + vrH / 2, 1]
      const r = trace(pos, norm(dir))
      const cl = r ? clAss(r[0], r[1]) : '#000'
      const sx = x * (canvas.width / raysW)
      const sy = y * (canvas.height / raysH)
      ctx.fillStyle = cl
      ctx.fillRect(sx, sy, canvas.width / raysW, canvas.height / raysH)
    }
  }
}

function trace(pos, dir, lvl = 0) {
  if (lvl > limit) return null
  let candidate = null

  for (const obj of objs) {
    if (lvl === 0 && obj[2] && !renderLights) continue
    const hit = intersect(pos, dir, obj[0], obj[1])
    if (!hit) continue
    if (hit[1] < (candidate?.dist ?? Infinity))
      candidate = { obj, dist: hit[1], at: hit[0] }
  }

  if (!candidate) return null
  if (candidate.obj[2]) return [candidate.obj[2], candidate.dist]
  const res = trace(
    candidate.at,
    reflect(dir, norm(sub(candidate.at, candidate.obj[0]))),
    lvl + 1
  )
  return res && [res[0], res[1] + candidate.dist]
}

function intersect(o, u, c, r) {
  const omc = sub(o, c)
  const du = dot(u, omc)
  const s = du ** 2 - (mag(omc) ** 2 - r ** 2)
  if (s <= 0) return null
  const d = -du - Math.sqrt(s)
  if (d <= 0) return null
  return [add(o, mult(u, d)), d]
}

;(async () => {
  for (let i = 16; i >= 1; i /= 2) {
    const t0 = performance.now()
    await render(canvas.width / i, i < 16 ? 2 : 0)
    console.log(
      `done with layer ${i} in ${
        Math.round((performance.now() - t0) / 10) / 100
      }s`
    )
  }
})()
