export const mag = ([x, y, z]) => Math.sqrt(x ** 2 + y ** 2 + z ** 2)

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
