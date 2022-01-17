export const magSq = ([x, y, z]) => x ** 2 + y ** 2 + z ** 2
export const mag = vec => Math.sqrt(magSq(vec))

export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

export const add = (a, b) => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2]
]

export const sub = (a, b) => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2]
]

export const mult = ([x,y,z], n) => [x*n, y*n, z*n]

export const norm = vec => mult(vec, 1 / mag(vec))

export const rgb = (...c) => '#' + c.map(v => ('00' + Math.floor((v * 0xFF)).toString(16)).slice(-2)).join('')

export const reflect = (a, b) => sub(a, mult(b, 2 * dot(a, b))) 
