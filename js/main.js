import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Player from "./player.js";
import Obstacle from "./obstacle.js";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );

const light = new THREE.AmbientLight(0x3f2f29);

directionalLight.position.set(-40, 5, 0)
directionalLight.target.position.set(0,0,0)
directionalLight.castShadow = true
scene.add( light );
scene.add( directionalLight );
scene.add( directionalLight.target );
const player = new Player("models/player/player.fbx", scene, camera);

camera.rotateZ(Math.PI / 2);
// directionalLight .shadow.mapSize.width = 512; // default
// directionalLight .shadow.mapSize.height = 512; // default
// directionalLight .shadow.camera.near = 0.5; // default
// directionalLight .shadow.camera.far = 500;



const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.y = 30;

controls.update();
document.body.appendChild(renderer.domElement);
new THREE.TextureLoader().load();




scene.background = new THREE.TextureLoader().load("./assets/textures/sky.jpg");





function updateCamera() {
    try {
        camera.position.z = player.model.position.z - 50;
        camera.position.x = player.model.position.x;

    } catch (e) {
        console.error(e);
    }
}

let btn = document.getElementById("play");
let start = false;
btn.addEventListener("click", () => {
    start = true
    btn.style.visibility = "hidden"
});

const clock = new THREE.Clock();
let activated = false;

async function animate() {
    if ( player.model ) {
        if ( !activated ){
            activated = true
            await Obstacle.generateGroups(0, player.model.position.z, scene)
            activated = false
        }
        if ( start ) {
            player.move()
            updateCamera()
            Obstacle.updateCars(player, scene)
        }   
    }
    const delta = clock.getDelta();
    if (player.mixer) {
        player.mixer.update(delta);
    }
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
