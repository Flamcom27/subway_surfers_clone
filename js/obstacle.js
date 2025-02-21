import *  as THREE from "three";

// import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

const sleep = m => new Promise(r => setTimeout(r, m))

const houseObjLoader = new OBJLoader();
const carObjLoader = new OBJLoader();
// const fbxLoader = new FBXLoader();
const mtlLoader = new MTLLoader();

const ENUM = Object.freeze({
    CAR: "car",
    ROAD: "road",
    LEFT_HOUSE: "leftHouse",
    RIGHT_HOUSE: "rightHouse"
})

const roadTexture = new THREE.TextureLoader().load(
    "./assets/textures/road.jpeg"
);
const roadModel = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 80),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: roadTexture,
    })
);

roadModel.position.y = 0;
roadModel.rotation.x = Math.PI / 2;
roadModel.rotateZ(Math.PI / 2);
mtlLoader.load("./assets/models/house/house.mtl", function (mtl) {
    houseObjLoader.setMaterials(mtl)
})
let leftHouseModel; 
let rightHouseModel; 
houseObjLoader.load("./assets/models/house/house.obj", function (obj) {
    obj.scale.setScalar(2);
    obj.traverse((c) => {
        c.castShadow = true;
    });
    obj.children[0].material.opacity = 100
    obj.children[0].material.side = THREE.DoubleSide
    obj.position.y = 0;
    obj.position.x = roadModel.position.x +279
    obj.position.z = roadModel.position.z -13
    leftHouseModel = obj
    const obj2 = obj.clone()
    obj2.position.x -=558;
    obj2.position.z +=27;
    obj2.rotateY(Math.PI);
    rightHouseModel = obj2
});


let carModel;
mtlLoader.load("./assets/models/car/Car.mtl", function (mtl) {
    carObjLoader.setMaterials(mtl)
})

carObjLoader.load("./assets/models/car/Car.obj", (obj) => {
    obj.scale.setScalar(6.5);
    obj.traverse((c) => {
        c.castShadow = true;
    });
    obj.position.x = 0
    console.log(obj)
    obj.rotateY(Math.PI)

})

export default class Obstacle {
    static groups = [];
    static models = {
        road: roadModel,
        car: carModel,
        rightHouse: rightHouseModel,
        leftHouse: leftHouseModel
    }
    constructor(type, z){
        let model;
        switch (type){
            case ENUM.ROAD:
                model = roadModel.clone();
                break;
            case ENUM.RIGHT_HOUSE:
                model = rightHouseModel.clone();
                break;
            case ENUM.LEFT_HOUSE:
                model = leftHouseModel.clone();
                break;
            case ENUM.CAR:
                model = carModel.clone();
                break;
            default:
                throw `type ${type} doesn't exist`       
        }
        model.position.z += z

        return model
    }
    static createGroup( startZ, playerZ, scene ){
        // console.log(startZ - playerZ)
        
        console.log(startZ - playerZ)
        let group = new THREE.Group();

        const models = [
            new Obstacle( ENUM.ROAD, startZ ) , 
            new Obstacle( ENUM.RIGHT_HOUSE, startZ ) , 
            new Obstacle( ENUM.LEFT_HOUSE, startZ )
        ]
        for (let model of models){
            group.add( model )
        }
        scene.add( group )
        Obstacle.groups.push( group );
        console.info("group position: ", group.position)
        console.info("groups: ", Obstacle.groups)
        return group


    }
    static _getGroupZ(index){
        if (Obstacle.groups.length !== 0){
            const lastObject =  Obstacle.groups[ index ].children[0]
            return lastObject.position.z
        } else {
            return -50
        }
    }

    static async generateGroups(lastZ, playerZ, scene){

        lastZ = Obstacle._getGroupZ(Obstacle.groups.length-1)

        if ( lastZ - playerZ < 500 ) {
            Obstacle.createGroup( lastZ+50, playerZ, scene )
            await sleep(500)
            const firstZ = Obstacle._getGroupZ(0)
            if (playerZ - firstZ > 50){
                let firstGroup = Obstacle.groups.shift()
                scene.remove(firstGroup)
            }
            Obstacle.generateGroups(lastZ+50,  playerZ, scene )
        }
    }
}