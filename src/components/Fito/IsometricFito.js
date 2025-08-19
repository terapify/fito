import React from 'react';

const IsometricFito = ({ position }) => {
  return (
    <group position={position}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#99ff99" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 0.2, 0.4]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.2, 0.2, 0.4]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

export default IsometricFito;
