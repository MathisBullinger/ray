import { mag, magSq, dot, add, sub, mult, norm, rgb, reflect } from './vector'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

const raysW = canvas.width
const raysH = Math.ceil(canvas.height / canvas.width * raysW)

async function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

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
      const cl = rgb(...trace(pos, norm(dir)))
      const sx = x * (canvas.width / raysW)
      const sy = y * (canvas.height / raysH)
      ctx.fillStyle = cl
      ctx.fillRect(sx, sy, canvas.width / raysW, canvas.height / raysH)
      if ((y * raysW + x) % (4 * raysW) === 0) await new Promise(requestAnimationFrame)
    }
  }
}

const objs = [
  [[0,0,5], 1],
  [[2,1,8], 1],
]

const nl = 50
for (let i = 0; i < nl; i++) {
  const x = Math.sin(i / nl * 2 * Math.PI) * 20
  const z = Math.cos(i / nl * 2 * Math.PI) * 20
  const y = Math.random() * 100 - 50
  const r = 1 + Math.random() * 2
  const cl = Array(3).fill().map(v => Math.random() * .5 + .5)
  objs.push([[x, y, z], r, cl])
}

function trace(pos, dir) {
  let mags = objs.map((v,i) => [magSq(sub(v, pos)), i]).sort(([a], [b]) => a-b)
  for (let i = 0; i < objs.length; i++) {
    let obj = objs[mags[i][1]]
    const v = intersects(pos, dir, obj[0], obj[1])
    if (!v) continue
    if (obj[2]) return obj[2]
    const cl = trace(v, reflect(dir, norm(sub(v, obj[0]))))
    return mult(cl, .8)
  }
  return [0,0,0] 
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
