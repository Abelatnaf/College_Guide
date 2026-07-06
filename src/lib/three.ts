/**
 * Small, dependency-free geometry helpers for the WebGL scenes.
 * Kept out of the three/* components so they can be unit-reasoned about and
 * reused by both the ambient field and the globe.
 */

/**
 * Uniformly distribute `count` points inside a sphere of `radius`, returned as
 * a flat Float32Array [x,y,z, x,y,z, …] ready for a BufferAttribute.
 */
export function randomInSphere(count: number, radius: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    // cube-root keeps the distribution uniform by volume rather than clumping
    // toward the center.
    const r = Math.cbrt(Math.random()) * radius;
    const sinPhi = Math.sin(phi);
    arr[i * 3] = r * sinPhi * Math.cos(theta);
    arr[i * 3 + 1] = r * sinPhi * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

/**
 * Convert latitude/longitude (degrees) to a point on a sphere of `radius`,
 * as a [x, y, z] tuple. Uses the standard equirectangular mapping so pins land
 * where you'd expect relative to a 0°-meridian-facing globe.
 */
export function latLongToVector3(
  lat: number,
  lon: number,
  radius: number,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}
