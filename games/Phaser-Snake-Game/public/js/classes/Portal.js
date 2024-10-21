import {GRID, SPEED_WALK, PORTAL_PAUSE, GState, DEBUG } from "../SnakeHole.js";


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

        if (anim === "portalForm") {
            this.setOrigin(.3125,.3125);
            scene.portals.push(this);
            this.portalHighlight = scene.add.sprite(from[0], from[1]).setDepth(54).setOrigin(.3125,.3125);
            this.portalHighlight.setTint(color.color);
            //this.portalHighlight.chain(['portalHighlights']);
            


        } else {
            this.setOrigin(0,0);
            scene.wallPortals.push(this);
            this.play(this.anim);
        }
        //this.play("portalIdle");

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

        scene.children.add(this);

        // Add Glow
        this.preFX.setPadding(32);

        this.fx = this.preFX.addGlow([color.color],[.5],[.25],[true]);

        //  For PreFX Glow the quality and distance are set in the Game Configuration

        /*
        scene.tweens.add({
            targets: this.fx,
            outerStrength: 10,
            yoyo: true,
            loop: -1,
            ease: 'sine.inout'
        });*/

        this.fx.setActive(false);

    },
    onOver: function(scene) {
        scene.gState = GState.PORTAL;
        scene.snake.lastPortal = this;
        scene.scoreTimer.paused = true;


        if (DEBUG) { console.log("PORTAL"); }

        // Show portal snake body after head arrives.
        if (scene.snake.body.length > 2) {
            this.snakePortalingSprite.visible = true;   
        }


        var _x = this.target.x;
        var _y = this.target.y;

        var portalSound = scene.portalSounds[0];
        portalSound.play();

        console.log([this.x, this.y], [_x, _y]);

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

            // Set last move to now. Fixes Corner Time.
            scene.lastMoveTime = scene.time.now;
        });
                        
    },
    
});


export { Portal };