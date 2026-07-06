import { ShaderMaterial, Color, AdditiveBlending, BackSide } from "three";

/**
 * Procedural globe materials — no textures, no model files.
 *
 * The globe is a dark emerald sphere with faux directional lighting, subtle
 * value-noise "landmass" mottling, and a bright fresnel rim. The atmosphere is
 * a slightly larger back-side sphere whose fresnel drives an additive emerald
 * halo. Both are plain THREE.ShaderMaterials (created via factories and passed
 * as `material={…}` props) so we avoid custom JSX elements + TS augmentation.
 */

const globeVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mvPosition.xyz);
    vPos = position;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const globeFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uGlow;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
    vec3 lightDir = normalize(vec3(0.55, 0.6, 0.75));
    float diff = clamp(dot(vNormal, lightDir), 0.0, 1.0);

    float m = noise(vPos * 4.0) * 0.6 + noise(vPos * 9.0) * 0.4;
    m = smoothstep(0.46, 0.78, m);

    vec3 base = mix(uBase, uBase * 2.4, m);
    vec3 col = base + base * diff * 1.3;
    col += uGlow * m * diff * 0.4;   // lit "landmasses" pick up emerald
    col += uGlow * fres * 1.35;      // glowing rim
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createGlobeMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uBase: { value: new Color("#05130d") },
      uGlow: { value: new Color("#34d399") },
    },
    vertexShader: globeVertex,
    fragmentShader: globeFragment,
  });
}

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 uGlow;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    intensity = clamp(intensity, 0.0, 1.0);
    gl_FragColor = vec4(uGlow, intensity);
  }
`;

export function createAtmosphereMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uGlow: { value: new Color("#34d399") } },
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    transparent: true,
    blending: AdditiveBlending,
    side: BackSide,
    depthWrite: false,
  });
}
