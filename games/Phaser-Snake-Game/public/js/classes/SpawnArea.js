import {GRID, DEBUG_AREA_ALPHA} from "../SnakeHole.js";


const SpawnArea = new Phaser.Class({
    Extends: Phaser.GameObjects.Rectangle,

    initialize:

    function SpawnArea (scene, x, y, width , height , name, fillColor) {
        
        Phaser.GameObjects.Rectangle.call(this, scene, x, y, width, height, fillColor);
        
        this.setPosition(x * GRID, y * GRID); 
        this.width = width*GRID;
        this.height = height*GRID;
        this.name = name;
        
        //debug options
        this.fillColor = 0x6666ff;
        this.fillAlpha = DEBUG_AREA_ALPHA;
        
        this.setOrigin(0,0);

        scene.children.add(this);
        
        this.portalCords = []; // Used as Null
    },

    genChords: function (scene) {

        
        var xMin = this.x/GRID;
        var xMax = this.x/GRID + this.width/GRID - 1;

        var yMin = this.y/GRID;
        var yMax = this.y/GRID + this.height/GRID - 1;
        
        var x = (Phaser.Math.RND.between(xMin, xMax));
        var y = (Phaser.Math.RND.between(yMin, yMax));

        var cords = [x,y];

    
        // Recursively if there is a portal in the same spot as this point try again until there isn't one.
        //console.log(scene.portals);
        scene.portals.forEach( portal => {
            if(portal.x === x*GRID && portal.y === y*GRID){
                console.log("HELP THIS SPACE IS OCUPADO BY PORTAL",portal.x, portal.y);
                cords = this.genChords(scene);
            }
        });

        // Don't spawn over atoms
        scene.atoms.forEach( fruit => {
            if(fruit.x === x*GRID && fruit.y === y*GRID){
                console.log("HELP THIS SPACE IS OCUPADO BY FRUIT",fruit.x, fruit.y);
                cords = this.genChords(scene);
            }
        });

        return cords;
    },

    hasPortal: function() {
        if (this.portalCords.length < 1 || this.portalCords == undefined) {
            return false;
        }
        return true;
    }
});

export { SpawnArea };