// src/ModelViewer.jsx
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three-stdlib';  // Import RGBELoader for HDR files

const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef();

  // Ensure materials respond to lighting
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;   // Enable casting shadows
        child.receiveShadow = true; // Enable receiving shadows

        // Ensure the material is light-reactive
        if (child.material && !child.material.isMeshStandardMaterial) {
          child.material = new THREE.MeshStandardMaterial({
            color: child.material.color,
            roughness: 0.5,
            metalness: 0.5,
          });
        }
      }
    });
  }, [scene]);

  // Animation: Rotate the model
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.002;
    }
  });

  return <primitive ref={modelRef} object={scene} />;
};


const CustomEnvironment = ({ hdrUrl }) => {
  const texture = useLoader(RGBELoader, hdrUrl);
  texture.mapping = THREE.EquirectangularReflectionMapping;  // Set mapping for reflections

  return <Environment background={false} files={hdrUrl} />;
};

const ModelViewer = () => {
  return (
    <>
      <Canvas className="bg-custom-bg h-screen bg-cover bg-center" shadows style={{ height: '100vh', }}>
        {/* Ambient light for base illumination */}
        <ambientLight intensity={0.2} />
        <PerspectiveCamera
          makeDefault // Sets this camera as the default camera for the scene
          fov={28} // Field of view
          aspect={window.innerWidth / window.innerHeight} // Aspect ratio
          near={.1} // Near clipping plane
          far={1000} // Far clipping plane
          position={[0, 2, 5]} // Camera position
        />

        {/* Directional light to act like a sun source */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
        />

        {/* Hemisphere light for overall soft lighting */}
        <hemisphereLight skyColor={'#ffffff'} groundColor={'#b97a20'} intensity={0.5} />

        {/* Environment for reflections without background */}
        <Suspense fallback={null}>
          <Model url="/ferrarifree/scene.gltf" />

          {/* Custom Environment Map */}
          <CustomEnvironment hdrUrl="/music_hall_02_4k.hdr" />
        </Suspense>

        {/* Camera controls */}
        <OrbitControls />
      </Canvas>
      <Canvas style={{ height: '100vh' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.0} />
        <PerspectiveCamera makeDefault fov={75} position={[0, 0, 5]} />

        <Suspense fallback={null}>
          <mesh>
            <boxGeometry args={[2, 3, 2]} />
            <meshStandardMaterial color="pink" />
          </mesh>
        </Suspense>

        <OrbitControls />
      </Canvas>
    </>
  );
};

export default ModelViewer;
