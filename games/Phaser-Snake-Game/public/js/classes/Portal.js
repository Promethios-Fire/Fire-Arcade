import {GRID, SPEED_WALK, PORTAL_PAUSE, GState, DEBUG, PLAYER_STATS, X_OFFSET, Y_OFFSET } from "../SnakeHole.js";


var Portal = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Portal(scene, anim, color, from, to, freeDir, spawnDelay)
    /**
     * holdDir is Boolean.
     */
    {
        Phaser.GameObjects.Sprite.call(this, scene);

        this.anim = anim;
        //this.playAfterDelay(anim, 0); //setting spawnDelay to 0 for now
        this.chain(['portalIdle']);


        //debugger
        this.setPosition(from[0], from[1]);
        
        this.setDepth(47);

        //this.canHighlight = false;

        if (anim === "portalForm") {
            this.setOrigin(.3125,.3125);
            scene.portals.push(this);
            this.portalHighlight = scene.add.sprite(from[0], from[1]).setDepth(46).setOrigin(.3125,.3125);
            // this.portalHighlight.setTint(color.color);
            // this.portalHighlight.chain(['portalHighlights']);
            


        } else {
            this.setOrigin(0,0);
            scene.wallPortals.push(this);
            this.play(this.anim);
        }

        // code related to fixing portal speedup... 
        // would replace 'this.chain(['portalIdle']);' from earlier
        /*this.once('animationcomplete-portalForm', () => {
            this.play('portalIdle');
            scene.time.delayedCall(300, event => {
                this.canHighlight = true;
            });
            
        });*/

        this.freeDir = freeDir;

        this.target = { x: to[0], y: to[1]};
        this.targetObject = {};
        this.snakePortalingSprite = scene.add.sprite(from[0], from[1], 'snakeDefault', 1
        ).setDepth(52).setOrigin(0,0).setPipeline('Light2D');
        this.snakePortalingSprite.setAlpha(0.66);
        scene.snakePortalingSprites.push(this.snakePortalingSprite);


        
        
        this.tint = color.color; // Color is a Phaser Color Object
        this.snakePortalingSprite.setTint(color.color);
        this.snakePortalingSprite.visible = false;

        this.portalTimerRunning = false;

        scene.children.add(this);

        // Add Glow
        //this.preFX.setPadding(32);

        //this.fx = this.preFX.addGlow([color.color],[.5],[.25],[true]);
        //this.fx.setActive(false);

    },
    onOver: function(scene) {
        if (scene.canPortal === true) {
            scene.gState = GState.PORTAL;
            scene.snake.lastPortal = this;
            scene.scoreTimer.paused = true;

            // Start other portal spinning
            debugger
            this.targetObject.anims.msPerFrame = 16;
    

            this.portalTimerRunning = true;
            //this.target.portalTimerRunning = true;
            
            //this.anims.msPerFrame = 128;
            //this.portalHighlight.anims.msPerFrame =  128;
            //this.portalHighlight.alpha = 0;

            scene.time.delayedCall(750, () => { 
                this.portalTimerRunning = false;
                //this.target.portalTimerRunning = false;    
            });

            /*scene.tweens.add({
                    targets: this,
                    alpha: {from: this.targetObject.portalHighlight.anims.msPerFrame,
                         to: 8},
                    duration: 98,
                    ease: 'Sine.Out',
                    onUpdate:() => {
                        this.portalHighlight.anims.msPerFrame = 8;
                        this.anims.msPerFrame = 8;
                    },
            });*/

            if (DEBUG) { console.log("PORTAL"); }
    
            // Show portal snake body after head arrives.
            if (scene.snake.body.length > 2) {
                this.snakePortalingSprite.visible = true;   
            }
    
    
            var _x = this.target.x;
            var _y = this.target.y;
    
            
    
            var portalSound = scene.portalSounds[0];
            portalSound.play();
    
            var _tween = scene.tweens.add({
                targets: scene.snake.body[0], 
                x: _x,
                y: _y,
                yoyo: false,
                duration: SPEED_WALK * PORTAL_PAUSE,
                ease: 'Linear',
                repeat: 0,
                //delay: 500
                onStart: function () {       
                }
            });
            
            _tween.on('complete',()=>{
                scene.gState = GState.PLAY;
                scene.scoreTimer.paused = false;
    
                // Show portal snake body after head arrives.
                if (scene.snake.body.length > 2) {
                    this.targetObject.snakePortalingSprite.visible = true;   
                }
    
    
                scene.scene.get("InputScene").moveHistory.push([
                    [(this.x - X_OFFSET)/GRID, (this.y - Y_OFFSET)/GRID], 
                    [(_x - X_OFFSET)/GRID, (_y - Y_OFFSET)/GRID], 
                    scene.snake.direction
                ]);
    
    
                // Set last move to now. Fixes Corner Time.
                scene.lastMoveTime = scene.time.now;
    
                PLAYER_STATS.portals += 1;
            });
        }

                        
    },
    
});


export { Portal };