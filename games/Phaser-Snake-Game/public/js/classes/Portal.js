import {GRID } from "../SnakeHole.js";


var Portal = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Portal(scene, color, from, to)
    {
        Phaser.GameObjects.Sprite.call(this, scene);
        //this.setTexture('portals', 0);
        this.setPosition(from[0] * GRID, from[1] * GRID);
        this.setOrigin(.3125,.3125);
        this.setDepth(5);
        this.play("portalIdle")


        this.target = { x: to[0], y: to[1]};
        this.targetObject = {};
        this.snakePortalingSprite = scene.add.sprite(from[0] * GRID, from[1] * GRID, 'snakeDefault', 1
        ).setDepth(16).setOrigin(0,0).setPipeline('Light2D');

        //this.snakePortalingSprite.setTint(0x00FFFF);
        this.snakePortalingSprite.visible = false;

        scene.portals.push(this);
        
        this.tint = color.color; // Color is a Phaser Color Object
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
    
});


export { Portal };