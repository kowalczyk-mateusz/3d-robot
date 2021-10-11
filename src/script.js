import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

let sceneReady = false;
const loadingManager = new THREE.LoadingManager(() => {
  window.setTimeout(() => {
    sceneReady = true;
  }, 1000);
});
const cubeTextureLoader = new THREE.CubeTextureLoader();

const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/1/px.jpg",
  "/textures/environmentMaps/1/nx.jpg",
  "/textures/environmentMaps/1/py.jpg",
  "/textures/environmentMaps/1/ny.jpg",
  "/textures/environmentMaps/1/pz.jpg",
  "/textures/environmentMaps/1/nz.jpg",
]);

environmentMap.encoding = THREE.sRGBEncoding;
scene.background = environmentMap;
scene.environment = environmentMap;

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntenisty = 5;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

let mixer;
setTimeout(() => {
  sceneReady = true;
}, 3000);
const fbxLoader = new FBXLoader();
fbxLoader.load(
  "/models/health.fbx",
  (object) => {
    object.scale.set(0.5, 0.5, 0.5);
    scene.add(object);
    updateAllMaterials();
    object.rotation.y += 1.5;
    mixer = new THREE.AnimationMixer(object);
    const animations = object.animations;
    console.log(mixer.update);
    const clip = THREE.AnimationClip.findByName(animations, "CINEMA_4D_Main");
    const action = mixer.clipAction(clip);
    console.log(action);
    action.play();
    object.rotation.z = 0;
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, -5);

scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas,
  powerPreference: "high-performance",
  antialias: true,
  alpha: true,
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
const a = new THREE.Vector3(1, 0, 0);
const clock = new THREE.Clock();

const tick = () => {
  controls.update();
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);
  const deltTime = clock.getDelta();
  if (sceneReady) {
    mixer.update(deltTime);
  }

  window.requestAnimationFrame(tick);
};

tick();
