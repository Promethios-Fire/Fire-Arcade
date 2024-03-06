import {GRID } from "../SnakeHole.js";


var Portal = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,

    initialize:

    function Portal(scene, color, from, to)
    {
        Phaser.GameObjects.Image.call(this, scene);
        this.setTexture('portals', 0);
        this.setPosition(from[0] * GRID, from[1] * GRID);
        this.setOrigin(.125,.125);

        this.target = { x: to[0], y: to[1]};

        scene.portals.push(this);
        
        this.tint = color.color; // Color is a Phaser Color Object
        scene.children.add(this);

        // Add Glow
        this.preFX.setPadding(32);

        this.fx = this.preFX.addGlow();

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