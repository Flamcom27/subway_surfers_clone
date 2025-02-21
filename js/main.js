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
// mtlLoader.load("./assets/models/house/house.mtl", function (mtl) {
//     loader.setMaterials(mtl)
// }

// )
// const roadTexture = new THREE.TextureLoader().load(
//     "./assets/textures/road.jpeg"
// );
// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(50, 80),
//     new THREE.MeshStandardMaterial({
//         color: 0xffffff,
//         side: THREE.DoubleSide,
//         map: roadTexture,
//     })
// );

// plane.position.y = 0;
// plane.rotation.x = Math.PI / 2;
// scene.add(plane);
// plane.rotateZ(Math.PI / 2);
camera.rotateZ(Math.PI / 2);



// let rightHouse; 
// let leftHouse;
// loader.load("./assets/models/house/house.obj", function (fbx) {
//     fbx.scale.setScalar(2);
//     fbx.traverse((c) => {
//         c.castShadow = true;

        
//     });

//     fbx.children[0].material.opacity = 100
//     fbx.children[0].material.side = THREE.DoubleSide

//     scene.add(fbx);

//     console.log(fbx)

//     fbx.position.y = 0;
//     fbx.position.x = plane.position.x +279
//     fbx.position.z = plane.position.z -13
//     leftHouse = fbx
//     const fbx2 = fbx.clone()
//     scene.add(fbx2);
//     fbx2.position.x -=558;
//     fbx2.position.z +=27;
//     fbx2.rotateY(Math.PI);
//     rightHouse = fbx2


// });

const newLoader = new OBJLoader();
mtlLoader.load("./assets/models/car/Car.mtl", function (mtl) {
    newLoader.setMaterials(mtl)
})

newLoader.load("./assets/models/car/Car.obj", (obj) => {
    obj.scale.setScalar(7);
    obj.traverse((c) => {
        c.castShadow = true;
    });
    obj.getObjectByName("Body")
    obj.position.x = 0
    console.log(obj)
    obj.rotateY(Math.PI)
    scene.add(obj)
})

// setTimeout(() => {
//     const models = [plane, leftHouse, rightHouse]
//     for (let i=1; i<10;i++){
//         for (const model of models){
//             let newModel = model.clone()
//             newModel.position.z+=i*50
//             scene.add(newModel)
//         }
//     }
// }, 500)


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
let lastZ;
async function animate() {
    

    if ( player.model ) {
        if (!activated){
            activated = true
            // let z;
            // // console.log("obstacle groups length: ", Obstacle.groups.length)
            // if (Obstacle.groups.length === 0 ){
            //     z = player.model.position.z-50
            // } else {

                
            //     // console.log( lastIndex )
            //     const lastObject =  Obstacle.groups[ lastIndex ]
            //     // console.info( "last object position: ", lastObject.position.z )
            //     z = lastObject.position.z
            // }
            // if (Obstacle.groups.length !== 0){
            //     const lastIndex = Obstacle.groups.length-1
            //     const lastObject =  Obstacle.groups[ lastIndex ].children[0]
            //     console.info( "last object position: ", lastObject.position.z )
            //     lastZ = lastObject.position.z
            // } else {
            //     lastZ = -50
            // }
            await Obstacle.generateGroups(0, player.model.position.z, scene)
            activated = false
        // }
        // const lastIndex = Obstacle.groups.length-1
        // if ( lastIndex === -1 ){
        //     z = 0
        //     Obstacle.createGroup(z, player.model.position.z, scene)
        // } else if ( Obstacle.groups[lastIndex].children[0].position.z - player.model.position.z < 500 ) {
        //     z += 50
        //     Obstacle.createGroup(z, player.model.position.z, scene)
        // }

    }
        if ( start ) {
            player.model.position.z += 0.7
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
