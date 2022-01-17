import { mag, dot, sub, norm } from './vector'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

const raysW = 50 
const raysH = Math.ceil(canvas.height / canvas.width * raysW)

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const pos = [0, 0, 0]
  const vrW = 1
  const vrH = canvas.height / canvas.width * vrW
  
  for (let y = 0; y < raysH; y++) {
    for (let x = 0; x < raysW; x++) {
      const dir = [
        x / raysW * vrW - vrW / 2,
        y / raysH * vrH - vrH / 2,
        1
      ]
      const cl = trace(pos, norm(dir))
      const sx = x * (canvas.width / raysW)
      const sy = y * (canvas.height / raysH)
      ctx.fillStyle = cl
      ctx.fillRect(sx, sy, canvas.width / raysW, canvas.height / raysH)
    }
  }
}

const sphere = {
  pos: [0, 0, 5],
  rad: 1
}

function trace(pos, dir) {
  return intersects(pos, dir, sphere.pos, sphere.rad) ? '#fff' : '#000'
}

function intersects(o, u, c, r) {
  const v = dot(u, sub(o, c)) 
  const s = v ** 2 - (mag(sub(o, c)) ** 2 - r ** 2)
  console.log(s, u)
  return s >= 0
}

render()
