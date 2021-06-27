import {
  h,
  Fragment,
  React,
  createStore,
  combine,
  useFrame,
  THREE,
  MeshProps,
  Canvas,
} from "../deps.ts";

import { OrbitControls } from "https://cdn.skypack.dev/@react-three/drei@beta?dts";

export const useStore = createStore(
  combine(
    {
      counter: 1,
    },
    () => ({})
  )
);

function Box(props: MeshProps) {
  // This reference will give us direct access to the THREE.Mesh object
  const mesh = React.useRef<THREE.Mesh>();
  // Set up state for the hovered and active state
  const [hovered, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (mesh.current!.rotation.x += 0.01));
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

const Scene = () => {
  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
      <OrbitControls />
    </>
  );
};

export default function Home() {
  return (
    <div className="w-screen h-screen">
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
}
