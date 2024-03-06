import {GRID, DEBUG_AREA_ALPHA} from "../SnakeHole.js";


var SpawnArea = new Phaser.Class({
    Extends: Phaser.GameObjects.Rectangle,

    initialize:

    function SpawnArea (scene, x, y, width , height , fillColor)
    {
        Phaser.GameObjects.Rectangle.call(this, scene, x, y, width, height, fillColor);
        
        this.setPosition(x * GRID, y * GRID); 
        this.width = width*GRID;
        this.height = height*GRID;
        this.fillColor = 0x6666ff;
        this.fillAlpha = DEBUG_AREA_ALPHA;
        
        this.setOrigin(0,0);

        scene.children.add(this);
    },

    genPortalChords: function (scene)
    {
        
        var xMin = this.x/GRID;
        var xMax = this.x/GRID + this.width/GRID - 1;

        var yMin = this.y/GRID;
        var yMax = this.y/GRID + this.height/GRID - 1;
        
        var x = (Phaser.Math.RND.between(xMin, xMax));
        var y = (Phaser.Math.RND.between(yMin, yMax));

    
        // Recursively if there is a portal in the same spot as this point try again until there isn't one.
        scene.portals.forEach( portal => {
            console.print("HELL YEAH REROLL THAT PORTAL");
            if(portal.x === x && portal.y === y){
                this.genPortalChords();
            }
        }

        )
        
        var cords = [x,y];
        return cords;
    },
});

export { SpawnArea };