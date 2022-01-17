import { mag, magSq, dot, add, sub, mult, norm, rgb, reflect } from './vector'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

async function render(raysW, raysH = Math.ceil(canvas.height / canvas.width * raysW)) {
  const pos = [0, 0, 0]
  const vrW = 1
  const vrH = canvas.height / canvas.width * vrW
  
  for (let y = 0; y < raysH; y++) {
    for (let x = 0; x < raysW; x++) {
      const dir = [
        x / raysW * vrW - vrW / 2,
        y / raysH * -vrH + vrH / 2,
        1
      ]
      const cl = rgb(...trace(pos, norm(dir)) ?? [0,0,0])
      const sx = x * (canvas.width / raysW)
      const sy = y * (canvas.height / raysH)
      ctx.fillStyle = cl
      ctx.fillRect(sx, sy, canvas.width / raysW, canvas.height / raysH)
      if ((y * raysW + x) % (4 * raysW) === 0) await new Promise(requestAnimationFrame)
    }
  }
}

const objs = [
  [[-7, 7, 10], 9]
]

for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = 0; z < 3; z++)
      objs.push([[x*3+2,y*3-2,z*3+12], 1])

const nl = 300
const gr = (1 + 5 ** .5) / 2
for (let i = 0; i < nl; i++) {
  const theta = 2 * Math.PI * i / gr
  const phi = Math.acos(1 - 2 * (i + 0.5) / nl) 
  objs.push([
    [
      Math.cos(theta) * Math.sin(phi),
      Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
    ].map(v => v * 100),
    8,
    [i / nl * 1, 0, (1 - i / nl) * 1]
  ])
}

let lm = null
let getOrd = pos => {
  if (lm && lm[0][0] === pos[0] && lm[0][1] === pos[1] && lm[0][2] === pos[2]) return lm[1]
  const mags = objs.map(([v, r],i) => [mag(sub(v, pos))-r, i]).sort(([a], [b]) => a-b).map(([,i]) => i)
  lm = [pos, mags]
  return mags
}


function trace(pos, dir, lvl = 0) {
  if (lvl >= 5) return null
  const mags = getOrd(pos)
  for (let i = 0; i < objs.length; i++) {
    let obj = objs[mags[i]]
    if (lvl === 0 && obj[2]) continue
    const v = intersects(pos, dir, obj[0], obj[1])
    if (!v) continue
    if (obj[2]) return obj[2]
    const cl = trace(v, reflect(dir, norm(sub(v, obj[0]))), lvl+1)
    return cl ? mult(cl, .8) : null
  }
  return null 
}

function intersects(o, u, c, r) {
  const omc = sub(o, c)
  const du = dot(u, omc)
  const s = du ** 2 - (mag(omc) ** 2 - r ** 2)
  if (s <= 0) return null 
  const d = -du - Math.sqrt(s)
  if (d <= 0) return null
  return add(o, mult(u, d))
}  
  

render()

;(async () => {
  const r = canvas.width
  await render(r / 16)
  await render(r / 4)
  await render(r)
})()
