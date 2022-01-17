import { mag, dot, add, sub, mult, norm, rgb, reflect } from './vector'

const renderLights = true
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

const objs = [[[-7, 7, 10], 9]]

for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = 0; z < 3; z++)
      objs.push([[x * 3 + 2, y * 3 - 2, z * 3 + 12], 1])

const nl = 300
const gr = (1 + 5 ** 0.5) / 2
for (let i = 0; i < nl; i++) {
  const theta = (2 * Math.PI * i) / gr
  const phi = Math.acos(1 - (2 * (i + 0.5)) / nl)
  objs.push([
    [
      Math.cos(theta) * Math.sin(phi),
      Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
    ].map((v) => v * 100),
    8,
    [(i / nl) * 1, 0, (1 - i / nl) * 1],
  ])
}

let lm = null
let getOrd = (pos) => {
  if (lm && lm[0][0] === pos[0] && lm[0][1] === pos[1] && lm[0][2] === pos[2])
    return lm[1]
  const mags = objs
    .map(([v, r], i) => [mag(sub(v, pos)) - r, i])
    .sort(([a], [b]) => a - b)
    .map(([, i]) => i)
  lm = [pos, mags]
  return mags
}

function trace(pos, dir, lvl = 0) {
  if (lvl >= 5) return null
  const mags = getOrd(pos)
  for (let i = 0; i < objs.length; i++) {
    let obj = objs[mags[i]]
    if (lvl === 0 && !renderLights && obj[2]) continue
    const v = intersect(pos, dir, obj[0], obj[1])
    if (!v) continue
    const cr = obj[2]
      ? [obj[2], 0]
      : trace(v[0], reflect(dir, norm(sub(v[0], obj[0]))), lvl + 1)
    if (!cr) return null
    return [cr[0], cr[1] + v[1]]
  }
  return null
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
