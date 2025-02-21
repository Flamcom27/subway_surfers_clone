import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import Car from "./car.js";

const sleep = (m) => new Promise((r) => setTimeout(r, m));

const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

const ENUM = Object.freeze({
    CAR: "car",
    ROAD: "road",
    LEFT_HOUSE: "leftHouse",
    RIGHT_HOUSE: "rightHouse",
});

const roadTexture = new THREE.TextureLoader().load(
    "./assets/textures/road.jpeg"
);
const roadModel = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 80),
    new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: roadTexture,
    })
);

roadModel.position.y = 0;
roadModel.rotation.x = Math.PI / 2;
roadModel.rotateZ(Math.PI / 2);
mtlLoader.load("./assets/models/house/house.mtl", function (mtl) {
    objLoader.setMaterials(mtl);
});
let leftHouseModel;
let rightHouseModel;
objLoader.load("./assets/models/house/house.obj", function (obj) {
    obj.scale.setScalar(2);
    obj.traverse((c) => {
        if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
        }
    });
    obj.children[0].material.opacity = 100;
    obj.children[0].material.side = THREE.DoubleSide;
    obj.position.y = 0;
    obj.position.x = roadModel.position.x + 279;
    obj.position.z = roadModel.position.z - 13;
    leftHouseModel = obj;
    const obj2 = obj.clone();
    obj2.position.x -= 558;
    obj2.position.z += 27;
    obj2.rotateY(Math.PI);
    rightHouseModel = obj2;
});

export default class Obstacle {
    static groups = [];
    static cars = [];
    constructor(type, z, scene = undefined) {
        let model;
        switch (type) {
            case ENUM.ROAD:
                model = roadModel.clone();
                model.position.z += z;
                break;
            case ENUM.RIGHT_HOUSE:
                model = rightHouseModel.clone();
                model.position.z += z;
                break;
            case ENUM.LEFT_HOUSE:
                model = leftHouseModel.clone();
                model.position.z += z;
                break;
            case ENUM.CAR:
                model = new Car(z, scene);

                break;
            default:
                throw `type ${type} doesn't exist`;
        }
        return model;
    }
    static createGroup(startZ, playerZ, scene) {
        let group = new THREE.Group();
        const models = [
            new Obstacle(ENUM.ROAD, startZ),
            new Obstacle(ENUM.RIGHT_HOUSE, startZ),
            new Obstacle(ENUM.LEFT_HOUSE, startZ),
        ];
        for (let model of models) {
            group.add(model);
        }
        scene.add(group);
        Obstacle.groups.push(group);
        console.info("group position: ", group.position);
        console.info("groups: ", Obstacle.groups);
        return group;
    }
    static _getGroupZ(index) {
        if (Obstacle.groups.length !== 0) {
            const lastObject = Obstacle.groups[index].children[0];
            return lastObject.position.z;
        } else {
            return -50;
        }
    }

    static async generateGroups(lastZ, playerZ, scene) {
        lastZ = Obstacle._getGroupZ(Obstacle.groups.length - 1);

        if (lastZ - playerZ < 500) {
            Obstacle.createGroup(lastZ + 50, playerZ, scene);
            if (Math.random() < 25) {
                const car = new Obstacle(ENUM.CAR, lastZ + 50, scene);
                Obstacle.cars.push(car);
            }

            await sleep(500);
            const firstZ = Obstacle._getGroupZ(0);
            if (playerZ - firstZ > 50) {
                let firstGroup = Obstacle.groups.shift();
                scene.remove(firstGroup);
            }
            Obstacle.generateGroups(lastZ + 50, playerZ, scene);
        }
    }
    static updateCars(player) {
        console.log(Obstacle.cars);
        for (let car of Obstacle.cars) {
            car.move(player);
        }
    }
}
