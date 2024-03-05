import {GRID} from "../SnakeHole.js";

var Wall = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,

    initialize:

    function Wall (scene, x, y)
    {
        // Phaser.GameObjects.Image.call(this, scene) // commented out because we don't need to redraw

        //this.setTexture('blocks', 3); // or use a texture
        this.setPosition(x * GRID, y * GRID);
        this.setOrigin(0);

        scene.walls.push(this);

        // scene.children.add(this);   // walls are added through tilemaps now
    },
    });


export { Wall };