"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { asset } from "@/lib/asset";

export const COIN_URL = asset("/models/coin.glb");

/**
 * Everything a driver can steer, in radians / units. Drivers mutate this ref
 * from GSAP or pointer handlers; the scene reads it every frame, so no React
 * state churns at 60fps.
 */
export type CoinPose = {
  rotX: number;
  rotY: number;
  rotZ: number;
  /** Continuous turn, revolutions per second. 0 to hold still. */
  spin: number;
  scale: number;
  /** Extra vertical bob amplitude in scene units. 0 to hold still. */
  bob: number;
};

export const restingPose = (): CoinPose => ({
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  spin: 0.18,
  scale: 1,
  bob: 0.04,
});

/** Soft studio lighting from a room environment — no network fetch. */
function Studio() {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  // Attach through the scene graph rather than by assignment.
  useFrame(({ scene }) => {
    if (scene.environment !== env) scene.environment = env;
  });
  return null;
}

function Model({ pose }: { pose: MutableRefObject<CoinPose> }) {
  const { scene } = useGLTF(COIN_URL);
  const group = useRef<THREE.Group>(null);
  const spinAngle = useRef(0);

  // Normalise the asset: centre it, fit it to ~2.2 units across, and turn the
  // thin axis toward the camera so it reads as a coin face-on at rest.
  const prepared = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    root.position.sub(centre);
    const holder = new THREE.Group();
    holder.add(root);
    const thin = [size.x, size.y, size.z].indexOf(Math.min(size.x, size.y, size.z));
    if (thin === 0) holder.rotation.y = Math.PI / 2;
    if (thin === 1) holder.rotation.x = Math.PI / 2;
    const fit = 2.2 / Math.max(size.x, size.y, size.z);
    holder.scale.setScalar(fit);
    root.traverse((o) => {
      if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshStandardMaterial) {
        o.material.envMapIntensity = 1.1;
      }
    });
    return holder;
  }, [scene]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = pose.current;
    if (p.spin > 0) {
      spinAngle.current += delta * p.spin * Math.PI * 2;
    } else if (spinAngle.current !== 0) {
      // Scroll has taken the wheel again: wind the idle turn back onto the
      // driven angle over about a quarter of a second, via the short way
      // round, so the beats always meet the face they were written for.
      let a = spinAngle.current % (Math.PI * 2);
      if (a > Math.PI) a -= Math.PI * 2;
      if (a < -Math.PI) a += Math.PI * 2;
      a *= Math.max(0, 1 - delta * 4);
      spinAngle.current = Math.abs(a) < 1e-3 ? 0 : a;
    }
    g.rotation.set(p.rotX, p.rotY + spinAngle.current, p.rotZ);
    g.position.y = p.bob ? Math.sin(state.clock.elapsedTime * 1.4) * p.bob : 0;
    g.scale.setScalar(p.scale);
  });

  return (
    <group ref={group}>
      <primitive object={prepared} />
    </group>
  );
}

useGLTF.preload(COIN_URL);

/**
 * A transparent canvas showing the coin. Size it with the wrapper; the camera
 * frames a ~2.2 unit object with a little breathing room.
 */
export default function CoinScene({
  pose,
  className = "",
}: {
  pose: MutableRefObject<CoinPose>;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5.2], fov: 32 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Studio />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <directionalLight position={[-4, -2, 3]} intensity={0.5} />
        <Model pose={pose} />
      </Canvas>
    </div>
  );
}
