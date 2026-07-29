"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  Plane,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const PURPLE = new Color(0x760cbc);
const GREEN = new Color(0x56e628);
const CHARACTER_URL = "/glb/meshy-character-web.glb";
const PARACHUTE_URL = "/glb/parachute-medal-web.glb";
const DESKTOP_MIN_SIZE = 0.37;
const DESKTOP_MAX_SIZE = 1.47;
const DESKTOP_BASE_SIZE = 1.07;
const MOBILE_SCALE = 0.56;
const TOKEN_VISUAL_SCALE = 0.32;

interface FloatingObject {
  object: Group;
  origin: Vector3;
  phase: number;
  spin: number;
  velocity: number;
  mode: "gravity" | "parachute" | "thrust";
  baseScale: number;
}

interface CoinTransform {
  object?: Group;
  phase: number;
  spin: number;
  baseScale: number;
}

interface CoinPhysicsConfig {
  count: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  minSize: number;
  maxSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
}

class CoinPhysics {
  config: CoinPhysicsConfig;
  positions: Float32Array;
  velocities: Float32Array;
  sizes: Float32Array;
  pointerCenter = new Vector3();
  pointerActive = false;

  constructor(config: CoinPhysicsConfig) {
    this.config = config;
    this.positions = new Float32Array(config.count * 3);
    this.velocities = new Float32Array(config.count * 3);
    this.sizes = new Float32Array(config.count);
    this.initialize();
  }

  initialize() {
    for (let index = 0; index < this.config.count; index += 1) {
      const offset = index * 3;
      this.positions[offset] = MathUtils.randFloatSpread(this.config.maxX * 2);
      this.positions[offset + 1] = MathUtils.randFloatSpread(this.config.maxY * 2);
      this.positions[offset + 2] = MathUtils.randFloatSpread(this.config.maxZ * 2);
      this.sizes[index] = index === 0
        ? this.config.size0
        : MathUtils.randFloat(this.config.minSize, this.config.maxSize);
    }
  }

  update(delta: number) {
    const { config, positions, sizes, velocities } = this;
    const frameScale = Math.min(delta * 60, 2);

    if (this.pointerActive) {
      const pointerPosition = new Vector3().fromArray(positions, 0);
      pointerPosition.lerp(this.pointerCenter, 0.16).toArray(positions, 0);
      velocities.fill(0, 0, 3);
    }

    for (let index = this.pointerActive ? 1 : 0; index < config.count; index += 1) {
      const offset = index * 3;
      const velocity = new Vector3().fromArray(velocities, offset);
      const position = new Vector3().fromArray(positions, offset);
      velocity.y -= delta * config.gravity * sizes[index];
      velocity.multiplyScalar(Math.pow(config.friction, frameScale));
      velocity.clampLength(0, config.maxVelocity);
      position.addScaledVector(velocity, frameScale);
      position.toArray(positions, offset);
      velocity.toArray(velocities, offset);
    }

    for (let index = 0; index < config.count; index += 1) {
      const offset = index * 3;
      const position = new Vector3().fromArray(positions, offset);
      const velocity = new Vector3().fromArray(velocities, offset);
      const radius = sizes[index];

      for (let otherIndex = index + 1; otherIndex < config.count; otherIndex += 1) {
        const otherOffset = otherIndex * 3;
        const otherPosition = new Vector3().fromArray(positions, otherOffset);
        const difference = otherPosition.clone().sub(position);
        const distance = difference.length();
        const minimumDistance = radius + sizes[otherIndex];
        if (distance >= minimumDistance) continue;

        const normal = distance > 0.0001
          ? difference.multiplyScalar(1 / distance)
          : new Vector3(1, 0, 0);
        const correction = normal.multiplyScalar((minimumDistance - distance) * 0.5);
        const otherVelocity = new Vector3().fromArray(velocities, otherOffset);
        position.sub(correction);
        otherPosition.add(correction);
        const impulse = Math.max(velocity.length(), otherVelocity.length(), 0.035);
        velocity.addScaledVector(normal, -impulse * config.wallBounce);
        otherVelocity.addScaledVector(normal, impulse * config.wallBounce);
        otherPosition.toArray(positions, otherOffset);
        otherVelocity.toArray(velocities, otherOffset);
      }

      if (Math.abs(position.x) + radius > config.maxX) {
        position.x = Math.sign(position.x) * (config.maxX - radius);
        velocity.x *= -config.wallBounce;
      }
      if (config.gravity === 0 && Math.abs(position.y) + radius > config.maxY) {
        position.y = Math.sign(position.y) * (config.maxY - radius);
        velocity.y *= -config.wallBounce;
      } else if (config.gravity !== 0 && position.y - radius < -config.maxY) {
        position.y = -config.maxY + radius;
        velocity.y *= -config.wallBounce;
      }
      if (Math.abs(position.z) + radius > config.maxZ) {
        position.z = Math.sign(position.z) * (config.maxZ - radius);
        velocity.z *= -config.wallBounce;
      }
      position.toArray(positions, offset);
      velocity.toArray(velocities, offset);
    }
  }
}

function normalizeModel(model: Group, targetHeight: number) {
  const bounds = new Box3().setFromObject(model);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  model.position.sub(center);
  model.position.y += size.y / 2;
  model.scale.setScalar(targetHeight / Math.max(size.y, 0.001));
}

function wrapModel(source: Group) {
  const wrapper = new Group();
  wrapper.add(source.clone(true));
  return wrapper;
}

function createRocket(material: MeshPhysicalMaterial) {
  const rocket = new Group();
  const body = new Mesh(new CylinderGeometry(0.14, 0.18, 0.72, 20), material);
  const nose = new Mesh(new ConeGeometry(0.18, 0.34, 20), material);
  const flame = new Mesh(
    new ConeGeometry(0.13, 0.34, 16),
    new MeshPhysicalMaterial({ color: GREEN, emissive: GREEN, emissiveIntensity: 1.4 }),
  );
  const finGeometry = new BoxGeometry(0.06, 0.24, 0.22);
  const leftFin = new Mesh(finGeometry, material);
  const rightFin = leftFin.clone();

  nose.position.y = 0.53;
  flame.position.y = -0.53;
  flame.rotation.z = Math.PI;
  leftFin.position.set(-0.2, -0.22, 0);
  rightFin.position.set(0.2, -0.22, 0);
  rocket.add(body, nose, flame, leftFin, rightFin);
  return rocket;
}

export function HeroArtifactScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(0, 0, 12);

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));

    scene.add(new AmbientLight(0xffffff, 2.4));
    const keyLight = new DirectionalLight(0xffffff, 4.5);
    keyLight.position.set(-4, 6, 8);
    scene.add(keyLight);
    const accentLight = new DirectionalLight(GREEN, 2.2);
    accentLight.position.set(6, -2, 5);
    scene.add(accentLight);

    const coinCount = isMobile ? 28 : 33;
    const coinPhysics = new CoinPhysics({
      count: coinCount,
      maxX: isMobile ? 2.65 : 6.8,
      maxY: isMobile ? 4.45 : 4.1,
      maxZ: 1.8,
      minSize: isMobile ? DESKTOP_MIN_SIZE * MOBILE_SCALE : DESKTOP_MIN_SIZE,
      maxSize: isMobile ? DESKTOP_MAX_SIZE * MOBILE_SCALE : DESKTOP_MAX_SIZE,
      size0: isMobile ? DESKTOP_BASE_SIZE * MOBILE_SCALE : DESKTOP_BASE_SIZE,
      gravity: 0,
      friction: 0.998,
      wallBounce: 0.7,
      maxVelocity: 0.22,
    });
    const coinTransforms: CoinTransform[] = [];

    for (let index = 0; index < coinCount; index += 1) {
      coinTransforms.push({
        phase: index * 0.77,
        spin: 0.14 + (index % 3) * 0.045,
        baseScale: 1,
      });
    }

    const floatingObjects: FloatingObject[] = [];
    const rocketMaterial = new MeshPhysicalMaterial({
      color: PURPLE,
      metalness: 0.72,
      roughness: 0.22,
      clearcoat: 0.9,
    });
    const rocketPositions = isMobile
      ? [[-4.15, 2.75, -0.4]]
      : [[-6.1, 2.8, -0.2], [5.8, 3.1, -1.1], [-5.5, -3.25, 0.2]];

    rocketPositions.forEach(([x, y, z], index) => {
      const rocket = createRocket(rocketMaterial);
      rocket.position.set(x, y, z);
      rocket.rotation.z = index % 2 === 0 ? -0.58 : 0.62;
      rocket.scale.setScalar(isMobile ? 0.68 : 0.92);
      scene.add(rocket);
      floatingObjects.push({
        object: rocket,
        origin: rocket.position.clone(),
        phase: index * 1.9,
        spin: index % 2 === 0 ? 0.035 : -0.035,
        velocity: 0.62 + index * 0.08,
        mode: "thrust",
        baseScale: rocket.scale.x,
      });
    });

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    let disposed = false;

    void loader.loadAsync(CHARACTER_URL).then(({ scene: tokenSource }) => {
      if (disposed) return;
      normalizeModel(tokenSource, 1);

      coinTransforms.forEach((transform, index) => {
        const token = wrapModel(tokenSource);
        token.rotation.set(0.24, transform.phase, Math.sin(transform.phase) * 0.28);
        token.scale.setScalar(coinPhysics.sizes[index] * TOKEN_VISUAL_SCALE);
        transform.baseScale = token.scale.x;
        transform.object = token;
        scene.add(token);
      });

    });

    void loader.loadAsync(PARACHUTE_URL).then(({ scene: parachuteSource }) => {
      if (disposed) return;
      normalizeModel(parachuteSource, 1);
      const positions = isMobile
        ? [[-4.1, -3.15, -0.1], [4.2, 2.7, -1.3]]
        : [[-5.35, 0.3, -0.15], [5.95, 0.25, -0.8], [4.65, -3.2, 0.2], [-4.1, 3.35, -1.4]];
      positions.forEach(([x, y, z], index) => {
        const parachute = parachuteSource.clone(true);
        parachute.position.set(x, y, z);
        parachute.rotation.y = index * 0.65 - 0.45;
        parachute.rotation.z = index % 2 === 0 ? -0.12 : 0.12;
        parachute.scale.setScalar(isMobile ? 0.72 : 1.05 + (index % 2) * 0.18);
        scene.add(parachute);
        floatingObjects.push({
          object: parachute,
          origin: parachute.position.clone(),
          phase: 1.2 + index * 1.4,
          spin: index % 2 === 0 ? 0.02 : -0.02,
          velocity: 0.16 + index * 0.025,
          mode: "parachute",
          baseScale: parachute.scale.x,
        });
      });
    });

    const pointer = new Vector2();
    const raycaster = new Raycaster();
    const pointerPlane = new Plane(new Vector3(0, 0, 1), 0);
    const onPointerMove = (event: PointerEvent) => {
      pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      coinPhysics.pointerActive = Boolean(raycaster.ray.intersectPlane(pointerPlane, coinPhysics.pointerCenter));
    };
    const onPointerLeave = () => {
      coinPhysics.pointerActive = false;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.fov = camera.aspect < 0.7 ? 52 : camera.aspect < 1.2 ? 44 : 38;
      camera.updateProjectionMatrix();
      const visibleHalfHeight = Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      coinPhysics.config.maxY = visibleHalfHeight * 0.95;
      coinPhysics.config.maxX = visibleHalfHeight * camera.aspect * 0.95;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    const start = performance.now();
    let previousTime = start;
    const render = (time: number) => {
      const elapsed = (time - start) / 1000;
      const delta = Math.min((time - previousTime) / 1000, 0.04);
      previousTime = time;
      const motion = reducedMotion ? 0 : 1;
      const stage = canvas.closest<HTMLElement>("[data-hero-stage]");
      const stageRect = stage?.getBoundingClientRect();
      const scrollDistance = Math.max((stageRect?.height ?? window.innerHeight) - window.innerHeight, 1);
      const scrollProgress = reducedMotion
        ? 0
        : MathUtils.clamp(-(stageRect?.top ?? 0) / scrollDistance, 0, 1);

      if (motion) coinPhysics.update(delta);

      coinTransforms.forEach((transform, index) => {
        const token = transform.object;
        if (!token) return;
        token.position.fromArray(coinPhysics.positions, index * 3);
        token.position.x *= 1 - scrollProgress * (isMobile ? 0.18 : 0.34);
        token.position.y *= 1 - scrollProgress * 0.14;
        token.position.z += scrollProgress * (3.2 + (index % 4) * 0.42);
        const velocityY = coinPhysics.velocities[index * 3 + 1];
        token.rotation.set(
          0.24 + velocityY * 1.2,
          elapsed * transform.spin * motion * 2.4 + transform.phase,
          Math.sin(transform.phase) * 0.28,
        );
        token.scale.setScalar(transform.baseScale * (1 + scrollProgress * 0.52));
      });

      floatingObjects.forEach((item) => {
        const { object, origin, phase, spin, mode } = item;
        if (motion && mode === "parachute") {
          object.position.y -= item.velocity * delta;
          object.position.x = origin.x + Math.sin(elapsed * 0.5 + phase) * 0.16;
          if (object.position.y < -4.7) object.position.y = 4.7;
        } else if (motion && mode === "thrust") {
          object.position.y += item.velocity * delta;
          object.position.x = origin.x + Math.sin(elapsed * 0.8 + phase) * 0.1;
          if (object.position.y > 4.8) object.position.y = -4.6;
        } else if (motion && mode === "gravity") {
          item.velocity -= 0.58 * delta;
          object.position.y += item.velocity * delta;
          if (object.position.y < -4.35) {
            object.position.y = -4.35;
            item.velocity = Math.max(0.45, Math.abs(item.velocity) * 0.7);
          }
        }
        object.position.x += (origin.x * (mode === "gravity" ? 0.58 : 0.72) - object.position.x) * scrollProgress;
        object.position.y *= 1 - scrollProgress * 0.08;
        object.position.z = origin.z + scrollProgress * (mode === "gravity" ? 4.8 : 3.4);
        const scrollScale = 1 + scrollProgress * (mode === "gravity" ? 0.72 : 0.38);
        object.scale.setScalar(item.baseScale * scrollScale);
        object.rotation.y += spin * 0.016 * motion;
      });

      camera.position.x = pointer.x * 0.18 * motion;
      camera.position.y = pointer.y * 0.12 * motion - scrollProgress * 0.18;
      camera.position.z = 12 - scrollProgress * 2.35;
      camera.lookAt(0, 0, 0);
      const heroContent = stage?.querySelector<HTMLElement>(".iv-hero-content");
      if (heroContent) {
        heroContent.style.opacity = String(1 - MathUtils.smoothstep(scrollProgress, 0.24, 0.9) * 0.82);
        heroContent.style.transform = `translate3d(0, ${-scrollProgress * 24}px, 0)`;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="iv-hero-artifacts" aria-hidden="true" />;
}