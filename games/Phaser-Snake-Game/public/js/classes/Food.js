import {DEBUG, END_X, END_Y, SCREEN_WIDTH, GRID} from "../SnakeHole.js";

var Food = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Food (scene) {
        Phaser.GameObjects.Sprite.call(this, scene)

        if (DEBUG) { // Add Timer Text next to fruit
            const ourUI = scene.scene.get('UIScene');
            this.fruitTimerText = scene.add.text(this.x , this.y , 
                ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
                { font: '11px Arial', 
                    fill: '#FFFFFF',
                    fontSize: "32px"
                    
            });
            this.fruitTimerText.setOrigin(0,0);  
        }

        this.setOrigin(0);
        //this.startDecay(scene);
        this.setDepth(100);
        this.play("atom01idle");
        this.electrons = scene.add.sprite().setOrigin(.2,.175).setDepth(10);
        this.electrons.play("electronIdle");
        //this.setTexture('blocks', 8).setDepth(10); // Fresh now!

        this.decayStage01 = scene.time.addEvent({ delay: 1000, callback: fruit => { //was 2000
            this.electrons.anims.msPerFrame = 112;
            this.play("atom02idle");
        }, callbackScope: scene });

        this.decayStage02 = scene.time.addEvent({ delay: 2000, callback: fruit => { //was 7600
            this.play("atom03idle");
            this.electrons.play("electronDispersion01");
            //this.electrons.setVisible(false);
            //this.stop();
            //this.setTexture('blocks', 10).setDepth(10);
        }, callbackScope: scene });

        this.move(scene);

        scene.atoms.push(this);

        scene.children.add(this); // Shows on screen
    },
    
    move: function (scene) {
        //this.electrons = scene.add.sprite(0, 0).setOrigin(.25,.125).setDepth(10);
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
                testGrid[wall.x][wall.y] = false;
            }
        });

        scene.atoms.forEach(fruit => {
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

        this.setPosition(pos.x * GRID, pos.y * GRID); // This seems to magically reset the fruit timers
        console.log(this.x,this.y)
        this.electrons.setPosition(pos.x * GRID, pos.y * GRID);
        console.log(this.electrons.x,this.electrons.y)

        if (DEBUG) { // Reset Fruit Timer Text
            this.fruitTimerText.setPosition(this.x + GRID + 3 , this.y - 1); // Little Padding to like nice
        }
    },

    startDecay: function(scene){
        this.electrons.play("electronIdle");
        this.electrons.anims.msPerFrame = 66; // Setting electron framerate here to reset it after slowing in delay 2
        this.decayStage01.destroy(); // Destory Old Timers
        this.decayStage02.destroy();

        this.decayStage01 = scene.time.addEvent({ delay: 1000, callback: fruit => {
            //this.electrons.setVisible(false);
            this.electrons.frameRate = 1;
            this.play("atom02idle");
        }, callbackScope: scene });

        this.decayStage02 = scene.time.addEvent({ delay:2000, callback: fruit => {
            this.play("atom03idle");
            this.electrons.play("electronDispersion01");
            //this.electrons.setVisible(false);
            //console.log("stop")
            //this.stop();
        }, callbackScope: scene });

    },

});

export { Food };