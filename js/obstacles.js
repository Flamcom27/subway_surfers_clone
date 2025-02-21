import *  as THREE from "three";

import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

const objLoader = new OBJLoader();
const fbxLoader = new FBXLoader();
const mtlLoader = new MTLLoader();

const ENUM = Object.freeze({
    CAR: "car",
    ROAD: "road",
    HOUSE: "house",

})