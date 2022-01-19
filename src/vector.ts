export type Vector = [x: number, y: number, z: number]

export const magSq = ([x, y, z]: Vector) => x ** 2 + y ** 2 + z ** 2
export const mag = (vec: Vector) => Math.sqrt(magSq(vec))

export const dot = (a: Vector, b: Vector) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

export const add = (a: Vector, b: Vector): Vector => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
]

export const sub = (a: Vector, b: Vector): Vector => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
]

export const mult = ([x, y, z]: Vector, n: number): Vector => [
  x * n,
  y * n,
  z * n,
]

export const norm = (vec: Vector): Vector => mult(vec, 1 / mag(vec))

export const rgb = (...c: Vector) =>
  '#' +
  c.map(v => ('00' + Math.floor(v * 0xff).toString(16)).slice(-2)).join('')

export const reflect = (a: Vector, b: Vector) => sub(a, mult(b, 2 * dot(a, b)))
