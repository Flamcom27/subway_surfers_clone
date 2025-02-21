import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Player from "./player.js";
import Obstacle from "./obstacle.js";

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.rotateZ(Math.PI / 2);

const scene = new THREE.Scene();
scene.background = new THREE.TextureLoader().load("./assets/textures/sky.jpg");

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
const light = new THREE.AmbientLight(0x3f2f29);
directionalLight.position.set(-40, 5, 0);
directionalLight.target.position.set(0, 0, 0);
directionalLight.castShadow = true;

scene.add(light);
scene.add(directionalLight);
scene.add(directionalLight.target);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// const controls = new OrbitControls(camera, renderer.domElement);
camera.position.y = 30;
// controls.update();

document.body.appendChild(renderer.domElement);

const player = new Player("models/player/player.fbx", scene, camera);

function updateCamera() {
    try {
        camera.position.z = player.model.position.z - 50;
        camera.position.x = player.model.position.x;
    } catch (e) {
        console.error(e);
    }
}

let btn = document.getElementById("play");

btn.addEventListener("click", () => {
    start = true;
    btn.style.visibility = "hidden";
});

const clock = new THREE.Clock();
let activated = false;
let start = false;

async function animate() {
    if (player.model) {
        if (!activated) {
            activated = true;
            await Obstacle.generateGroups(0, player.model.position.z, scene);
            activated = false;
        }
        if (start) {
            player.move();
            updateCamera();
            Obstacle.updateCars(player);
        }
    }
    const delta = clock.getDelta();
    if (player.mixer) {
        player.mixer.update(delta);
    }
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
