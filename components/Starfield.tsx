'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';

// --- THEMES ---
const THEMES = [
    { inside: '#ff8c00', outside: '#0b1026', name: 'Gargantua' }, // Interstellar Orange/Black
    { inside: '#00f0ff', outside: '#3b005e', name: 'Nebula' },     // Cyan/Purple
    { inside: '#ffffff', outside: '#000000', name: 'Singularity' },// White/Black
    { inside: '#44ff00', outside: '#001a00', name: 'Isotope' },    // Toxic Green
    { inside: '#ff0055', outside: '#220000', name: 'Red Dwarf' },  // Deep Red
    { inside: '#88ccff', outside: '#001133', name: 'Ice World' },  // Ice Blue
];

// --- GALAXY COMPONENT ---
function Galaxy({ seed, warping }: { seed: number, warping: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);
    const timeRef = useRef(0);

    // Generate Galaxy Data
    const { positions, colors, scales, randomness } = useMemo(() => {
        // Pseudo-random generator
        const rnd = (input: number) => {
            const x = Math.sin(seed * 12345 + input) * 43758.5453;
            return x - Math.floor(x);
        };

        const theme = THEMES[Math.floor(rnd(0) * THEMES.length)];
        const count = 15000; // High density
        const branches = 3 + Math.floor(rnd(1) * 4); // 3-7 arms
        const radius = 40 + rnd(2) * 20;
        const spin = 0.5 + rnd(3) * 1.0;

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const randomness = new Float32Array(count * 3); // Store random offsets for warp effect

        const colorIn = new THREE.Color(theme.inside);
        const colorOut = new THREE.Color(theme.outside);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const r = Math.random() * radius;
            const spinAngle = r * spin;
            const branchAngle = ((i % branches) / branches) * Math.PI * 2;

            // Random diffusion
            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r;
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r;
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r;

            positions[i3] = Math.cos(branchAngle + spinAngle) * r;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r;

            randomness[i3] = randomX;
            randomness[i3 + 1] = randomY;
            randomness[i3 + 2] = randomZ;

            // Colors
            const mixedColor = colorIn.clone().lerp(colorOut, r / radius);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;

            // varied star sizes
            scales[i] = Math.random();
        }

        return { positions, colors, scales, randomness };
    }, [seed]);

    useFrame((state, delta) => {
        if (!pointsRef.current) return;
        timeRef.current += delta;

        const positionsAttribute = pointsRef.current.geometry.attributes.position;
        const count = positionsAttribute.count;

        // Rotation & Movement
        pointsRef.current.rotation.y += delta * 0.05;

        // WARP SPEED ANIMATION
        // When warping, stretch z-axis and pull particles back
        const warpFactor = warping ? 5.0 : 1.0;

        // NOTE: Updating 15k points every frame in JS is heavy.
        // We will just rotate the group and maybe apply a shader-like scale distortion via group scale
        if (warping) {
            pointsRef.current.scale.set(1, 1, 4); // Stretch stars
            pointsRef.current.rotation.z += delta * 2; // Spin cam effect
        } else {
            // Return to normal smoothly
            pointsRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2);
        }

    });

    return (
        <group rotation={[0.4, 0, 0]}>
            <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    vertexColors
                    size={0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

// --- HYPERSPACE STARS (Background speed lines) ---
function HyperspaceStars({ warping }: { warping: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        if (warping) {
            groupRef.current.rotation.z += delta * 0.5;
            groupRef.current.scale.z = 20;
        } else {
            groupRef.current.rotation.z += delta * 0.02;
            groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, 1, delta * 2);
        }
    });

    const starCount = 1000;
    const { pos, col } = useMemo(() => {
        const p = new Float32Array(starCount * 3);
        const c = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 50 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;
            p[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            p[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            p[i * 3 + 2] = r * Math.cos(theta);

            c[i * 3] = 1; c[i * 3 + 1] = 1; c[i * 3 + 2] = 1;
        }
        return { pos: p, col: c };
    }, []);

    return (
        <group ref={groupRef}>
            <Points positions={pos} colors={col} stride={3}>
                <PointMaterial size={0.3} color="white" transparent opacity={0.4} sizeAttenuation={false} />
            </Points>
        </group>
    );
}

function Rig({ warping }: { warping: boolean }) {
    const { camera } = useThree();
    const vec = new THREE.Vector3();

    useFrame((state, delta) => {
        // Camera drift
        if (warping) {
            if ('fov' in state.camera) {
                (state.camera as any).fov = THREE.MathUtils.lerp((state.camera as any).fov, 100, delta * 2);
            }
        } else {
            if ('fov' in state.camera) {
                (state.camera as any).fov = THREE.MathUtils.lerp((state.camera as any).fov, 60, delta * 2);
            }
        }
        state.camera.updateProjectionMatrix();

        const x = (state.pointer.x * 2);
        const y = (state.pointer.y * 2);

        state.camera.position.lerp(vec.set(x, y + 10, 30), 0.02);
        state.camera.lookAt(0, 0, 0);
    });
    return null;
}

// --- MAIN COMPONENT ---
export default function Starfield() {
    const [seed, setSeed] = useState(0);
    const [warping, setWarping] = useState(false);

    useEffect(() => {
        const handleClick = () => {
            setWarping(true);
            setTimeout(() => {
                setSeed(s => s + 1);
                // Keep warping for a split second after swap
                setTimeout(() => setWarping(false), 200);
            }, 600); // Wait for warp stretch to peak
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="fixed inset-0 -z-10 bg-black">
            <Canvas camera={{ position: [0, 10, 30], fov: 60 }} gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping }}>
                <color attach="background" args={['#000000']} />
                <fog attach="fog" args={['#000000', 20, 120]} />

                <Rig warping={warping} />
                <Galaxy seed={seed} warping={warping} />
                <HyperspaceStars warping={warping} />

                {/* Gargantua Glow */}
                <mesh position={[0, 0, -1]}>
                    <sphereGeometry args={[5, 32, 32]} />
                    <meshBasicMaterial color="#ffaa00" transparent opacity={0.05} blending={THREE.AdditiveBlending} />
                </mesh>
            </Canvas>

            {/* HUD Overlay */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${warping ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-white/50 tracking-[1em] scale-150 animate-pulse">
                    WARPING
                </div>
            </div>

            <div className="absolute bottom-4 left-4 text-[10px] text-white/30 font-mono">
                COORDINATES: {seed.toString(16).toUpperCase()} {"//"} SYSTEM_STATUS: {warping ? 'HYPERDRIVE' : 'NOMINAL'}
            </div>
        </div>
    );
}
