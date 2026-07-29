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
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
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
  position: Vector3;
  scale: number;
  phase: number;
  spin: number;
  velocityY: number;
  floorY: number;
  gravity: number;
  restitution: number;
}

function normalizeModel(model: Group, targetHeight: number) {
  const bounds = new Box3().setFromObject(model);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  model.position.sub(center);
  model.position.y += size.y / 2;
  model.scale.setScalar(targetHeight / Math.max(size.y, 0.001));
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

    const mobileCoinPositions = [
      new Vector3(-2.7, 4.65, -0.4),
      new Vector3(2.7, 4.55, -0.8),
      new Vector3(-2.7, -1.82, -0.4),
      new Vector3(2.7, -1.82, -0.8),
    ];
    const coinCount = isMobile ? mobileCoinPositions.length : 22;
    const coinGeometry = new CylinderGeometry(0.48, 0.48, 0.12, 48);
    coinGeometry.rotateX(Math.PI / 2);
    const rimGeometry = new TorusGeometry(0.39, 0.045, 12, 48);
    const coinMaterial = new MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.82,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });
    const rimMaterial = new MeshPhysicalMaterial({
      color: 0xffffff,
      emissiveIntensity: 0.32,
      metalness: 0.65,
      roughness: 0.2,
    });
    const coins = new InstancedMesh(coinGeometry, coinMaterial, coinCount);
    const rims = new InstancedMesh(rimGeometry, rimMaterial, coinCount);
    const coinTransforms: CoinTransform[] = [];
    const dummy = new Object3D();

    for (let index = 0; index < coinCount; index += 1) {
      const angle = (index / coinCount) * Math.PI * 2 + 0.34;
      const sideBias = Math.abs(Math.cos(angle));
      const radiusX = isMobile ? 4.65 : 7.15;
      const radiusY = isMobile ? 4.1 : 4.25;
      const position = isMobile
        ? mobileCoinPositions[index].clone()
        : new Vector3(
            Math.cos(angle) * radiusX,
            Math.sin(angle) * radiusY,
            -1.8 + (index % 5) * 0.46,
          );
      if (!isMobile && sideBias < 0.42) position.x *= 1.42;
      if (!isMobile && Math.abs(position.x) < 4.3) {
        position.x = (Math.cos(angle) < 0 ? -1 : 1) * 4.3;
      }
      const scale = (isMobile ? 0.34 : 0.42) + (index % 4) * (isMobile ? 0.055 : 0.08);
      coinTransforms.push({
        position,
        scale,
        phase: index * 0.77,
        spin: 0.14 + (index % 3) * 0.045,
        velocityY: 0.15 + (index % 5) * 0.18,
        floorY: isMobile ? -2.15 : -4.15 + (index % 3) * 0.18,
        gravity: 0.72 + (index % 4) * 0.14,
        restitution: 0.74 + (index % 3) * 0.06,
      });
      const color = index % 3 === 0 ? GREEN : PURPLE;
      coins.setColorAt(index, color);
      rims.setColorAt(index, color);
    }
    coins.instanceColor!.needsUpdate = true;
    rims.instanceColor!.needsUpdate = true;
    scene.add(coins, rims);

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

    void loader.loadAsync(CHARACTER_URL).then(({ scene: character }) => {
      if (disposed) return;
      normalizeModel(character, isMobile ? 1.45 : 2.35);
      character.position.set(isMobile ? 3.8 : 6.25, isMobile ? -4.1 : -4.35, -0.75);
      character.rotation.y = isMobile ? -0.18 : -0.24;
      scene.add(character);
      floatingObjects.push({
        object: character,
        origin: character.position.clone(),
        phase: 0.7,
        spin: 0.012,
        velocity: 0,
        mode: "gravity",
        baseScale: character.scale.x,
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
    const onPointerMove = (event: PointerEvent) => {
      pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.fov = camera.aspect < 0.7 ? 52 : camera.aspect < 1.2 ? 44 : 38;
      camera.updateProjectionMatrix();
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

      coinTransforms.forEach((transform, index) => {
        if (motion) {
          transform.velocityY -= transform.gravity * delta;
          transform.position.y += transform.velocityY * delta;
          if (transform.position.y < transform.floorY) {
            transform.position.y = transform.floorY;
            transform.velocityY = Math.max(0.68, Math.abs(transform.velocityY) * transform.restitution);
          }
        }
        dummy.position.copy(transform.position);
        dummy.position.x += Math.sin(elapsed * 0.32 + transform.phase) * 0.08 * motion;
        dummy.position.x *= 1 - scrollProgress * (isMobile ? 0.18 : 0.34);
        dummy.position.y *= 1 - scrollProgress * 0.14;
        dummy.position.z += scrollProgress * (3.2 + (index % 4) * 0.42);
        dummy.rotation.set(
          0.24 + transform.velocityY * 0.12,
          elapsed * transform.spin * motion * 2.4 + transform.phase,
          Math.sin(transform.phase) * 0.28,
        );
        dummy.scale.setScalar(transform.scale * (1 + scrollProgress * 0.52));
        dummy.updateMatrix();
        coins.setMatrixAt(index, dummy.matrix);
        rims.setMatrixAt(index, dummy.matrix);
      });
      coins.instanceMatrix.needsUpdate = true;
      rims.instanceMatrix.needsUpdate = true;

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