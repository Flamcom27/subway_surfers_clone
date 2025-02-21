import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import Player from "./player.js";
import Obstacle from "./obstacle.js";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
// const loader = new OBJLoader();
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

const player = new Player("models/player/player.fbx", scene, camera);

const mtlLoader = new MTLLoader()

camera.rotateZ(Math.PI / 2);



const newLoader = new OBJLoader();
mtlLoader.load("./assets/models/car/Car.mtl", function (mtl) {
    newLoader.setMaterials(mtl)
})
let car;
let carCheckBox;
newLoader.load("./assets/models/car/Car.obj", (obj) => {
    obj.scale.setScalar(6);
    obj.traverse((c) => {
        c.castShadow = true;
    });
    // obj.getObjectByName("Body")
    let checkBox = new THREE.Box3( new THREE.Vector3(), new THREE.Vector3() )
    checkBox.setFromObject(obj)
    car = obj
    carCheckBox = checkBox
    obj.position.x -=10
    obj.position.z += 100
    console.log(obj)
    obj.rotateY(Math.PI)
    scene.add(obj)
})
function moveCar(){
    car.position.z -= 0.07
    carCheckBox.setFromObject(car)
}

function checkCollision() {
    if (carCheckBox.intersectsBox(player.checkBox)){
        console.log("collision")
    }
}


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.y = 30;

controls.update();
document.body.appendChild(renderer.domElement);
let direction = 0.1;
new THREE.TextureLoader().load();




scene.background = new THREE.TextureLoader().load("./assets/textures/sky.jpg");

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


let btn = document.getElementById("play");
let start = false;
btn.addEventListener("click", (e) => {
    start = true
    btn.style.visibility = "hidden"


});


const raycaster = new THREE.Raycaster();


function onMouseDown(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const intersects = raycaster.intersectObjects(scene.children);
    // console.log(intersects);
    if (intersects.length > 0) {

        console.log("Object clicked", intersects);
    }
}

document.addEventListener("mousedown", onMouseDown);
let focused = false;

function updateCamera() {
    try {
        camera.position.z = player.model.position.z - 50;
        camera.position.x = player.model.position.x;

    } catch (e) {
        console.error(e);
    }
}

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
            moveCar()
            player.move()
            checkCollision()
            updateCamera()
        }   
}
    // if (player.clips.jump && !activated){
    //     // console.log(player.clips )
    //     activated = true
    //     player.clips.jump.play()
    // }
    const delta = clock.getDelta();
    if (player.mixer) {
        player.mixer.update(delta);
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
