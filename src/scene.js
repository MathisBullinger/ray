const scene = [[[-7, 7, 10], 9]]

for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = 0; z < 3; z++)
      scene.push([[x * 3 + 2, y * 3 - 2, z * 3 + 12], 1])

const nl = 300
const gr = (1 + 5 ** 0.5) / 2
for (let i = 0; i < nl; i++) {
  const theta = (2 * Math.PI * i) / gr
  const phi = Math.acos(1 - (2 * (i + 0.5)) / nl)
  scene.push([
    [
      Math.cos(theta) * Math.sin(phi),
      Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
    ].map((v) => v * 100),
    8,
    [(i / nl) * 1, 0, (1 - i / nl) * 1],
  ])
}

export default scene
