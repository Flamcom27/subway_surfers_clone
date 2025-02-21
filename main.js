import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
// import * as TWEEN from "tween";
import Player from "./player.js";
// const loader = new FBXLoader();



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const loader = new OBJLoader();
const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);

const player = new Player("models/player.fbx", scene, camera);
// console.log(player.clips)

// player.clips.die.run()

// let mixer;
// loader.setPath("./assets/");
const mtlLoader = new MTLLoader()
mtlLoader.load("./assets/models/house1/house.mtl", function (mtl) {
    loader.setMaterials(mtl)
}

)
const roadTexture = new THREE.TextureLoader().load(
    "./assets/textures/road.jpeg"
);
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 80),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: roadTexture,
    })
);

plane.position.y = 0;
plane.rotation.x = Math.PI / 2;
scene.add(plane);
plane.rotateZ(Math.PI / 2);
camera.rotateZ(Math.PI / 2);

let rightHouse; 
let leftHouse;
loader.load("./assets/models/house1/house.obj", function (fbx) {
    fbx.scale.setScalar(2);
    fbx.traverse((c) => {
        c.castShadow = true;
        // c.material.opacity = 0

    });
    // fbx.children[0].material.transperent = false
    fbx.children[0].material.opacity = 100
    console.log(fbx.material)

    // const mixer = new THREE.AnimationMixer( model );
    // const action = mixer.clipAction( animations[ 0 ] );
    scene.add(fbx);

    console.log(fbx)
    // player = fbx;
    fbx.position.y = 0;
    fbx.position.x = plane.position.x +279
    fbx.position.z = plane.position.z -13
    leftHouse = fbx
    const fbx2 = fbx.clone()
    scene.add(fbx2);
    fbx2.position.x -=558;
    fbx2.position.z +=27;
    fbx2.rotateY(Math.PI);
    rightHouse = fbx2
    // fbx2.children[0].material.color = 0xff0000

});

// }, undefined, function ( error ) {

// 	console.error( error );

// } );

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// loader.load('./aj.fbx', function (object) {
//     scene.add(object);
// });
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add( cube );
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


let btn = document.getElementById("random-color");

btn.addEventListener("click", (e) => {
    console.log("clicked");
    cube.material.color.setHex(getRandomInt(0, 0xffffff));
});

// cube.addEventListener("mousedown", (e) => {
//     console.log(e.clientX);
// });

// Create a Raycaster
const raycaster = new THREE.Raycaster();

// Set up the event listener

function onMouseDown(event) {
    // Get the mouse position
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log(mouseX, mouseY);

    // Calculate the ray
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(scene.children);
    console.log(intersects);
    if (intersects.length > 0) {
        // Handle the click
        console.log("Object clicked");
    }
}

document.addEventListener("mousedown", onMouseDown);
let focused = false;

function updateCamera() {
    try {
        camera.position.z = player.model.position.z - 50;
        camera.position.x = player.model.position.x;
        // controls.update();
    } catch (e) {
        console.error(e);
    }
}
// scene.add(player.model)
// player.clips.die.run()
const clock = new THREE.Clock();
let activated = false;
function animate() {
    // let player = document.player
    // let player = scene.getObjectByName("p")
    // player.rotation.x += 0.01;
    // player.rotation.y += 0.01;
    // console.log(player)
    // if (player.model) {
    //     // player.position.z += 0.1
    //     updateCamera()
    // }
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
