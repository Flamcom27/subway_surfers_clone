// 1 loadCharacter
// 2 animateCharacter
//      a. running
//      b. dying
//      c. jumping/falling
// 3. addController
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
            scene.add(model);

            _this._loadAnimations();
            document.addEventListener("keydown", _this.onKeyDown.bind(_this))
            // console.log(Player.instance)
            // console.log(_this)
            
        });
        // console.log(this)
    }
    _loadAnimations() {
        const animations = [["die", 'dying.fbx'], ["run", 'fast_run.fbx'], ["jump", 'jumping.fbx']]
        this.mixer = new THREE.AnimationMixer(this.model);
        let _this = this
        for (let animation of animations) {
            loader.load("animations/" + animation[1], function (anim) {
                _this.clips[animation[0]] = _this.mixer.clipAction(anim.animations[0]);
                switch (animation[0]){
                    case "run":
                        _this.clips.run.play()
                        break;
                    case "jump":
                        _this.clips.jump.setDuration(1)
                        
                }
            })
        }


    }
    _move(direction){

        const x = this.model.position.x
        const targetX = x+direction

        if (Math.abs(targetX) <= 30 && !this.isMoving){
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
    _jump(){
        if (!this.isJumping){
            this.isJumping = !this.isJumping
            this.clips.jump.setLoop( THREE.LoopOnce )
            this.clips.jump.stop()
            this.clips.jump.play()
            const y = this.model.position.y
            const targetY = y+25
            const tween = new TWEEN.Tween({ y: y })
            .to({ y: targetY }, 500)
            .onUpdate(coords => {
                this.model.position.y = coords.y
            })
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete( () => { 
                const tween = new TWEEN.Tween({ y: targetY })
                .to({ y: y }, 500)
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

    onKeyDown(event) {
        console.info(`key ${event.key} is pressed`)
        // const targetPosition = Player.instance.model.position.clone()
        switch (event.key) {
            case "a":
                this._move(20);
                break;
            case "d":
                this._move(-20);
                break;
            case " ":
                this._jump();
                break;

        }
    }
}
