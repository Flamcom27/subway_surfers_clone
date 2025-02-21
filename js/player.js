import *  as THREE from "three";
import * as TWEEN from "tween";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'


function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
}

animate();


let loader = new FBXLoader()
loader.setPath('./assets/')

export default class Player {

    constructor(path, scene, camera) {
        if (Player.instance) {
            return Player.instance
        }
        Player.instance = this;        
        this.clips = {};
        this.isMoving = false
        this.isJumping = false
        this.isAlive = true;
        let _this = this;

        loader.load(path, function (model) {

            model.scale.setScalar(0.06);

            model.traverse(c => {
                c.castShadow = true;
            });
            _this.model = model;
            model.position.x -= 10
            camera.position.z = model.position.z-50
            camera.position.x = model.position.x
            camera.lookAt( new THREE.Vector3(model.position.x, model.position.y+25, model.position.z ));
            _this.checkBox = new THREE.Box3( new THREE.Vector3(), new THREE.Vector3() )
            // _this.checkBox.setFromObject(model)
            scene.add(model);

            _this._loadAnimations();
            document.addEventListener("keydown", _this.onKeyDown.bind(_this))
            // console.log(Player.instance)
            // console.log(_this)
            // _this.model.add(_this.checkBox)
            // const box = new THREE.BoxHelper( _this.checkBox, 0xffff00 );
            // scene.add( box );
            console.log(_this.model.matrixWorld )
            console.log(_this.model)
            
        });
        // console.log(this)
    }

    changeSide(direction){

        const x = this.model.position.x
        const targetX = x+direction

        if (Math.abs(targetX) <= 30 && !this.isMoving && this.isAlive){
            this.isMoving = !this.isMoving
            const tween = new TWEEN.Tween({ x: x })
            .to({ x: targetX }, 250)
            .onUpdate(coords => {
                Player.instance.model.position.x = coords.x
            })
            .onComplete( () => { 
                this.isMoving = !this.isMoving
                console.info(`player moves to x: ${targetX}`) 
            });
            tween.start()
        }
    }
    jump(){
        if (!this.isJumping && this.isAlive){
            this.isJumping = !this.isJumping
            this.clips.jumpAnimation.setLoop( THREE.LoopOnce )
            this.clips.jumpAnimation.stop()
            this.clips.jumpAnimation.play()
            const y = this.model.position.y
            const targetY = y+25
            const tween = new TWEEN.Tween({ y: y })
            .to({ y: targetY }, 700)
            .onUpdate(coords => {
                this.model.position.y = coords.y
            })
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete( () => { 
                const tween = new TWEEN.Tween({ y: targetY })
                .to({ y: y }, 700)
                .onUpdate(coords => {
                    this.model.position.y = coords.y
                })
                .easing(TWEEN.Easing.Quadratic.in)
                .onComplete( () => { 
                    this.isJumping = !this.isJumping
                });
                
                tween.start()
            });
            tween.start()
        }
    }
    move(){
        if (this.isAlive){
            this.model.position.z += 0.7
            console.info("player checkbox position: ", this.checkBox)
            // this.checkBox.copy( this.model.children[1].geometry ).applyMatrix4( this.model.matrixWorld )
            this.checkBox.setFromObject(this.model)
            // console.log(this.model.position )
            // console.log(this.checkBox)
    
            console.info("player position: ", this.model.position)
        }

    }
    onKeyDown(event) {
        console.info(`key ${event.key} is pressed`)
        switch (event.key) {
            case "a":
                this.changeSide(20);
                break;
            case "d":
                this.changeSide(-20);
                break;
            case " ":
                this.jump();
                break;

        }
    }
    die(){
        this.isAlive = false
        this.clips.runAnimation.stop()
        this.clips.dieAnimation.play()
        document.getElementById("restart").style.visibility = "visible"
    }
    _loadAnimations() {
        const animations = [["dieAnimation", 'dying.fbx'], ["runAnimation", 'fast_run.fbx'], ["jumpAnimation", 'jumping.fbx']]
        this.mixer = new THREE.AnimationMixer(this.model);
        let _this = this
        for (let animation of animations) {
            loader.load("animations/" + animation[1], function (anim) {
                _this.clips[animation[0]] = _this.mixer.clipAction(anim.animations[0]);
                switch (animation[0]){
                    case "runAnimation":
                        _this.clips.runAnimation.play()
                        break;
                    case "jumpAnimation":
                        _this.clips.jumpAnimation.setDuration(1.4);
                        break;
                    case "dieAnimation":
                        _this.clips.dieAnimation.setLoop( THREE.LoopOnce )
                        _this.clips.dieAnimation.clampWhenFinished = true;
                        break;
                        
                }
            })
        }
    }
}
