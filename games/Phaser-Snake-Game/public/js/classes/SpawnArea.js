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

        this.portalCords = []; // Used as Null
    },

    genChords: function (scene)
    {
        
        var xMin = this.x/GRID;
        var xMax = this.x/GRID + this.width/GRID - 1;

        var yMin = this.y/GRID;
        var yMax = this.y/GRID + this.height/GRID - 1;
        
        var x1 = (Phaser.Math.RND.between(xMin, xMax));
        var y1 = (Phaser.Math.RND.between(yMin, yMax));
    
        // Recursively if there is a portal in the same spot as this point try again until there isn't one.
        //console.log(scene.portals);
        scene.portals.forEach( portal => {
            //console.log(portal.x === x1*GRID && portal.y === y1*GRID);
            if(portal.x === x1*GRID && portal.y === y1*GRID) {
                var newCords = this.genChords(scene);
                x1 = newCords[0];
                y1 = newCords[1];
            }
        });

        
        var cords = [x1,y1];
        return cords;
    },
});

export { SpawnArea };