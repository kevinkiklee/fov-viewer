export function mat4Perspective(fovYRad: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1.0 / Math.tan(fovYRad / 2)
  const nf = 1 / (near - far)
  const out = new Float32Array(16)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) * nf
  out[11] = -1
  out[14] = 2 * far * near * nf
  return out
}

export function mat4LookAt(eye: [number, number, number], target: [number, number, number], up: [number, number, number]): Float32Array {
  const zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2]
  let len = 1 / Math.sqrt(zx * zx + zy * zy + zz * zz)
  const fz0 = zx * len, fz1 = zy * len, fz2 = zz * len

  const sx = up[1] * fz2 - up[2] * fz1
  const sy = up[2] * fz0 - up[0] * fz2
  const sz = up[0] * fz1 - up[1] * fz0
  len = Math.sqrt(sx * sx + sy * sy + sz * sz)
  const fx0 = len > 0 ? sx / len : 0
  const fx1 = len > 0 ? sy / len : 0
  const fx2 = len > 0 ? sz / len : 0

  const ux = fz1 * fx2 - fz2 * fx1
  const uy = fz2 * fx0 - fz0 * fx2
  const uz = fz0 * fx1 - fz1 * fx0

  const out = new Float32Array(16)
  out[0] = fx0; out[1] = ux; out[2] = fz0; out[3] = 0
  out[4] = fx1; out[5] = uy; out[6] = fz1; out[7] = 0
  out[8] = fx2; out[9] = uz; out[10] = fz2; out[11] = 0
  out[12] = -(fx0 * eye[0] + fx1 * eye[1] + fx2 * eye[2])
  out[13] = -(ux * eye[0] + uy * eye[1] + uz * eye[2])
  out[14] = -(fz0 * eye[0] + fz1 * eye[1] + fz2 * eye[2])
  out[15] = 1
  return out
}
