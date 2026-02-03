'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function Earth() {
    const earthRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (earthRef.current) {
            earthRef.current.rotation.y = clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <group ref={earthRef}>
            {/* Base Blue Sphere */}
            <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#1e40af"
                    emissive="#1e3a8a"
                    emissiveIntensity={0.2}
                    roughness={0.7}
                />
            </Sphere>
            {/* Tech Wireframe Overlay */}
            <Sphere args={[1.01, 24, 24]} position={[0, 0, 0]}>
                <meshBasicMaterial
                    color="#00f0ff"
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </Sphere>
        </group>
    );
}

function Satellite({ orbitRadius, speed }: { orbitRadius: number; speed: number }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime() * speed;
            ref.current.position.x = Math.cos(t) * orbitRadius;
            ref.current.position.z = Math.sin(t) * orbitRadius;
        }
    });

    return (
        <mesh ref={ref}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial
                color="#00f0ff"
                emissive="#00f0ff"
                emissiveIntensity={1}
            />
        </mesh>
    );
}

function OrbitPath({ radius }: { radius: number }) {
    const points = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        ));
    }

    return (
        <Line
            points={points}
            color="#00f0ff"
            lineWidth={1}
            opacity={0.3}
            transparent
        />
    );
}

interface OrbitVisualizationProps {
    satelliteType: 'LEO' | 'MEO' | 'GEO';
}

export default function OrbitVisualization({ satelliteType }: OrbitVisualizationProps) {
    // Orbit radii (scaled for visualization)
    const orbitRadii = {
        LEO: 1.8,  // Low Earth Orbit
        MEO: 3.2,  // Medium Earth Orbit
        GEO: 5.0,  // Geostationary Orbit
    };

    const orbitSpeeds = {
        LEO: 0.5,
        MEO: 0.3,
        GEO: 0.1,
    };

    const radius = orbitRadii[satelliteType];
    const speed = orbitSpeeds[satelliteType];

    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [5, 3, 5], fov: 50 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Earth />
                <OrbitPath radius={radius} />
                <Satellite orbitRadius={radius} speed={speed} />

                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={3}
                    maxDistance={10}
                />

                {/* Stars in background */}
                <mesh>
                    <sphereGeometry args={[50, 32, 32]} />
                    <meshBasicMaterial
                        color="#000000"
                        side={THREE.BackSide}
                    />
                </mesh>
            </Canvas>
        </div>
    );
}
