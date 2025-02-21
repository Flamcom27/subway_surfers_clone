import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

let carModel;
mtlLoader.load("./assets/models/car/Car.mtl", function (mtl) {
    objLoader.setMaterials(mtl);
});

objLoader.load("./assets/models/car/Car.obj", (obj) => {
    obj.scale.setScalar(6.5);
    obj.traverse((c) => {
        if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
        }
    });
    obj.position.x -= 10;
    // console.log(obj);
    obj.rotateY(Math.PI);
    carModel = obj;
});

export default class Car {
    constructor(z, scene) {
        this.model = carModel.clone();
        this.model.position.z = z;
        const randomNum = Math.random();
        let x;
        if (randomNum <= 0.25) {
            x = 20;
        } else if (randomNum <= 0.5) {
            x = 40;
        } else if (randomNum <= 0.75) {
            x = -20;
        } else {
            x = -40;
        }
        this.model.position.x += x;
        this.checkBox = new THREE.Box3(
            new THREE.Vector3(),
            new THREE.Vector3()
        );
        scene.add(this.model);
    }
    move(player) {
        this.model.position.z -= 0.4;
        this.checkBox.setFromObject(this.model);
        this._checkCollision(player);
    }
    _checkCollision(player) {
        if (this.checkBox.intersectsBox(player.checkBox)) {
            player.die();
        }
    }
}
