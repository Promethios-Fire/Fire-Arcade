import {END_X, END_Y, SCREEN_WIDTH, GRID} from "../SnakeHole.js";

var Food = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Food (scene)
    {

        Phaser.GameObjects.Image.call(this, scene)

        // Add Timer Text under the fruit
        const ourUI = scene.scene.get('UIScene');
        this.fruitTimerText = scene.add.text(this.x , this.y , 
            ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
            { font: '11px Arial', 
                fill: '#FFFFFF',
                fontSize: "32px"
                
        });
        this.fruitTimerText.setOrigin(0,0);

        this.setTexture('blocks', 2).setDepth(10);
        this.move(scene);
        this.setOrigin(0);

        scene.apples.push(this);

        scene.children.add(this); // Shows on screen
    },
    
    move: function (scene)
    {
        //let x;
        //let y;

        //var safe = [];
        //var safePoints = [];
        
        
        var testGrid = {};

        // Start with all safe points as true. This is important because Javascript treats 
        // non initallized values as undefined and so any comparison or look up throws an error.
        for (var x1 = 0; x1 <= END_X; x1++)
        {
            testGrid[x1] = {};
    
            for (var y1 = 0; y1 <= END_Y; y1++)
            {
                testGrid[x1][y1] = true;
            }
        }
    
        
        // Make all the unsafe places unsafe
        scene.walls.forEach(wall => {
            if (wall.x < SCREEN_WIDTH) {
                // Hack to sanitize index undefined value
                // Current Tiled input script adds additional X values.
                testGrid[wall.x/GRID][wall.y/GRID] = false; 
            }
        });

        scene.apples.forEach(fruit => {
            testGrid[fruit.x/GRID][fruit.y/GRID] = false;
        });

        scene.portals.forEach(portal => {
            testGrid[portal.x/GRID][portal.y/GRID] = false;
        });

        
        var validLocations = [];
    
        for (var x2 = 0; x2 <= END_X; x2++)
        {
            for (var y2 = 0; y2 <= END_Y; y2++)
            {
                if (testGrid[x2][y2] === true)
                {
                    // Push only valid positions to an array.
                    validLocations.push({x: x2, y: y2});
                }
            }
        }
        
        var pos = Phaser.Math.RND.pick(validLocations)

        this.setPosition(pos.x * GRID, pos.y * GRID);

        this.fruitTimerText.setPosition(this.x + GRID + 3 , this.y - 1); // Little Padding to like nice

    },    

});

export { Food };