var config = {
    type: Phaser.WEBGL,
    width: 768, // If you change these remember 
    height: 720,// to update below as well
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0}
        }
    },
    fx: {
        glow: {
            distance: 32,
            quality: 0.1
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var snake;

// Tilemap variables
var layer;
var tileset;
var map;

//  Direction consts
var LEFT = 0;
var RIGHT = 1;
var UP = 2;
var DOWN = 3;

// Screen Globals
var GRID = 24; // Size of Sprites and GRID. TileSheet specified separately 
var SCREEN_WIDTH = config.width;
var SCREEN_HEIGHT = config.height; 

// Edge locations for X and Y
var END_X = SCREEN_WIDTH/GRID -1;
var END_Y = SCREEN_HEIGHT/GRID -1;

// Collision only works if GRID is whole divisor of HEIGHT and WIDTH
if (SCREEN_HEIGHT % GRID != 0 || SCREEN_WIDTH % GRID != 0 ) {
    throw "SCREEN DOESN'T DIVIDE INTO GRID EVENLY SILLY";
}

// DEBUG OPTIONS

var DEBUG = true;
var DEBUG_AREA_ALPHA = 0.0;   // Between 0,1 to make portal areas appear

const game = new Phaser.Game(config);

function preload ()
{
    this.load.image('bg01', 'assets/sprites/background01.png');
    this.load.spritesheet('blocks', 'assets/Tiled/tileSheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('portals', 'assets/sprites/portalBluex32.png', { frameWidth: 32, frameHeight: 32 });

    // Tilemap
    this.load.image('tileSheet', 'assets/Tiled/snakeMap.png');
    this.load.tilemapTiledJSON('map', 'assets/Tiled/snakeMap.json');

}

function create ()
{
    // Game Settings
    this.fruitGoal = 16;
    

    // Tilemap
    this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 }); // 
    this.tileset = this.map.addTilesetImage('tileSheet');
    this.layer = this.map.createLayer('Wall', this.tileset);
    
    // add background
    this.add.image(286, 286, 'bg01').setDepth(-1);

    // arrays for collision detection
    this.apples = [];
    this.walls = [];
    this.portals = [];


    // Start Fruit Score Timer
    this.score = 0;
    if (DEBUG) { console.log("STARTING SCORE TIMER"); }
    
    this.scoreTimer = this.time.addEvent({
        delay: 10000,
        paused: false
        });
    this.fruitCount = 0;

    // Initalize Screen Text Objects
    this.scoreText = this.add.text(1*GRID, 1*GRID , this.score, { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: "32px" });
    // this.scoreText.setOrigin(0,0);
    this.timerText = this.add.text(SCREEN_WIDTH/2, 1*GRID , 
                                this.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
                                { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
                                    fontSize: "32px"});
    this.fruitCountText = this.add.text(SCREEN_WIDTH - GRID*2, 1*GRID,
                                        this.fruitGoal - this.fruitCount,
                                        { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
                                        fontSize: "32px"});




    
    this.lastMoveTime = 0; // The last time we called move()
    //this.moveInterval = 128;

    // define keys       
    this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');

    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.on('keydown', e => {
        updateDirection(this, e);
    })

    this.input.keyboard.on('keyup-SPACE', e => { // Capture for releasing sprint
        console.log(e.code+" unPress", this.time.now);
    }) 

    var Food = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Food (scene)
        {

            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture('blocks', 2);
            this.move(scene);
            this.setOrigin(0);
            
            this.setScale(.75);

            this.points = 100;

            scene.apples.push(this);

            scene.children.add(this);
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
                // Hack to sanitize index undefined value
                // Current Tiled input script adds additional X values.
                if (wall.x < SCREEN_WIDTH) {
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


        },    

    });

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
  
    var Portal = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,

        initialize:

        function Portal(scene, color, from, to)
        {
            Phaser.GameObjects.Image.call(this, scene);
            this.setTexture('portals', 0);
            this.setPosition(from[0] * GRID, from[1] * GRID);
            this.setOrigin(0);
            this.setScale(0.75);

            this.target = { x: to[0], y: to[1]};

            scene.portals.push(this);
            
            this.tint = color.color;
            scene.children.add(this);

            // Add Glow
            this.preFX.setPadding(32);

            this.fx = this.preFX.addGlow();

            //  For PreFX Glow the quality and distance are set in the Game Configuration

            scene.tweens.add({
                targets: this.fx,
                outerStrength: 10,
                yoyo: true,
                loop: -1,
                ease: 'sine.inout'
            });

            this.fx.setActive(false);

        },
        
    });

    var makePair = function (scene, to, from){

        var color = new Phaser.Display.Color()
        color.random(1);
        
        var p1 = new Portal(scene, color, to, from);
        var p2 = new Portal(scene, color, from, to);

    }

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

    var Snake = new Phaser.Class({
        initialize:

        function Snake (scene, x, y)
        {
            this.alive = true;
            this.body = []
            this.head = scene.add.image(x * GRID, y * GRID, 'blocks', 0);
            this.head.setOrigin(0);
            this.head.setScale(.75);
            
            this.body.push(this.head);


            this.tail = new Phaser.Geom.Point(x, y); // Start the tail as the same place as the head.
            
            this.moveTime = 0;
            this.direction = LEFT;
            this.previousDirection = LEFT;
        },
        
        grow: function (scene)
        {
            // Add a new part at the current tail position
            // The head moves away from the snake 
            // The Tail position stays where it is and then every thing moves in series
            var newPart = scene.add.image(this.tail.x, this.tail.y, 'blocks', 1);
            newPart.setScale(.75);
            this.body.push(newPart);

            newPart.setOrigin(0);
        },
        
        update: function (time)
        {
            //if (time >= this.moveTime) Why is this here, does it do anything?
            //{
            //    return this.move(time);
            //}
        },
        
        move: function (scene)
        {
        snake.previousDirection = snake.direction; //this prevents snake from being able to 180
        // start with current head position
        let x = this.head.x;
        let y = this.head.y;

        // Death by eating itself
        let tail = this.body.slice(1);  // tail - headpos === any of tail positions

        // if any tailpos == headpos
        if(
            tail.some(
                pos => pos.x === this.body[0].x && pos.y === this.body[0].y) 
        ){
            this.alive = false;
        }

        scene.portals.forEach(portal => { 
            if(snake.head.x === portal.x && snake.head.y === portal.y){
                console.log("PORTAL");

                x = portal.target.x*GRID;
                y = portal.target.y*GRID;
                
                return 'valid';  //Don't know why this is here but I left it -James
            }
        });

        if (this.direction === LEFT)
        {
            x = Phaser.Math.Wrap(x - GRID, 0, SCREEN_WIDTH);
        }
        else if (this.direction === RIGHT)
        {
            x = Phaser.Math.Wrap(x + GRID, 0 - GRID, SCREEN_WIDTH - GRID);
        }
        else if (this.direction === UP)
        {
            y = Phaser.Math.Wrap(y - GRID, 0, SCREEN_HEIGHT);
        }
        else if (this.direction === DOWN)
        {
            y = Phaser.Math.Wrap(y + GRID, 0 - GRID, SCREEN_HEIGHT - GRID);
        }
        Phaser.Actions.ShiftPosition(this.body, x, y, this.tail);

        },
    });

    snake = new Snake(this, 11, 6);
    
    // width 25 grid
    // width 19

    this.map.forEachTile( tile => {
        // Empty tiles are indexed at -1. So any tilemap object that is not empty will be considered a wall
        // Index is the sprite value, not the array index. Normal wall is Index 4
        if (tile.index > 0) {  
            var wall = new Wall(this, tile.x, tile.y);
        }

    });

    for (let index = 0; index < 3; index++) {
        var food = new Food(this);
        
    }

    // Todo Portal Spawning Algorithm
    /* 9x9 grid
    var spawnAreaA = new SpawnArea(this, 1,1,7,5, 0x6666ff);
    var spawnAreaB = new SpawnArea(this, 9,1,6,5, 0x6666ff);
    var spawnAreaC = new SpawnArea(this, 16,1,7,5, 0x6666ff);
    var spawnAreaD = new SpawnArea(this, 1,7,6,6, 0x6666ff);
    var spawnAreaE = new SpawnArea(this, 17,7,6,6, 0x6666ff);
    var spawnAreaF = new SpawnArea(this, 1,14,7,5, 0x6666ff);
    var spawnAreaG = new SpawnArea(this, 9,14,6,5, 0x6666ff);
    var spawnAreaH = new SpawnArea(this, 16,14,7,5, 0x6666ff);
    
    var A1 = spawnAreaA.genPortalChords(this);
    var H1 = spawnAreaH.genPortalChords(this);

    var G1 = spawnAreaG.genPortalChords(this);
    var A2 = spawnAreaA.genPortalChords(this);

    var C1 = spawnAreaC.genPortalChords(this);
    var F1 = spawnAreaF.genPortalChords(this);

    makePair(this, A1, H1);
    makePair(this, C1, F1);
    makePair(this, G1, A2);
    */

    var spawnAreaA = new SpawnArea(this, 1,3,7,5, 0x6666ff);
    var spawnAreaB = new SpawnArea(this, 9,3,6,5, 0x6666ff);
    var spawnAreaC = new SpawnArea(this, 16,3,7,5, 0x6666ff);
    var spawnAreaF = new SpawnArea(this, 1,13,7,5, 0x6666ff);
    var spawnAreaG = new SpawnArea(this, 9,13,6,5, 0x6666ff);
    var spawnAreaH = new SpawnArea(this, 16,13,7,5, 0x6666ff);





    var A1 = spawnAreaA.genPortalChords(this);
    var H1 = spawnAreaH.genPortalChords(this);

    var B1 = spawnAreaB.genPortalChords(this);
    var G1 = spawnAreaG.genPortalChords(this);

    var C1 = spawnAreaC.genPortalChords(this);
    var F1 = spawnAreaF.genPortalChords(this);

    makePair(this, A1, H1);
    makePair(this, B1, G1);
    makePair(this, C1, F1);

}


function updateDirection(game, event) 
{
    // console.log(event.keyCode, this.time.now); // all keys
    switch (event.keyCode) {
        case 87: // w
        //console.log(event.code, game.time.now);
        if (snake.previousDirection != DOWN || snake.body.length <= 2) { 
            snake.direction = UP; // Prevents backtracking to death
        }
        break;

        case 65: // a
        //console.log(event.code, game.time.now);
        if (snake.previousDirection != RIGHT || snake.body.length <= 2) {
            snake.direction = LEFT;
        }
        break;

        case 83: // s
        //console.log(event.code, game.time.now);
        if (snake.previousDirection != UP || snake.body.length <= 2) { 
            snake.direction = DOWN;
        }
        break;

        case 68: // d
        //console.log(event.code, game.time.now);
        if (snake.previousDirection != LEFT || snake.body.length <= 2) { 
            snake.direction = RIGHT;
        }
        break;

        case 38: // UP
        //console.log(event.code, game.time.now);
        if (snake.previousDirection != DOWN || snake.body.length <= 2) {
            snake.direction = UP;
        }
        break;

        case 37: // LEFT
        //console.log(event.code, game.time.now);
        if (snake.previousDirection != RIGHT || snake.body.length <= 2) { 
            snake.direction = LEFT;
        }
        break;

        case 40: // DOWN
        //console.log(event.code, game.time.now);
        if (snake.previousDirection != UP || snake.body.length <= 2) { 
            snake.direction = DOWN;
        }
        break;

        case 39: // RIGHT
        //console.log(event.code, game.time.now);
        if (snake.previousDirection != LEFT  || snake.body.length <= 2) { 
            snake.direction = RIGHT;
        }
        break;

        case 32: // SPACE
        console.log(event.code, game.time.now);

    }

}

    function update (time, delta) 
{
// console.log("update -- time=" + time + " delta=" + delta);
    if (!snake.alive)
        {
            // game.scene.scene.restart(); // This doesn't work correctly
            if (DEBUG) { console.log("DEAD"); }
            game.destroy();
            return;
        }

    
    if(time >= this.lastMoveTime + this.moveInterval){
        this.lastMoveTime = time;
        snake.previousDirection == snake.direction;
        snake.move(this);
    }
    if (!this.spaceBar.isDown){
        this.moveInterval = 112;} // Less is Faster
    else{
        this.moveInterval = 32;
    }

    this.timerText.setText(this.scoreTimer.getRemainingSeconds().toFixed(1) * 10);
    //console.log(this.apples[0]);
   
    // Check collision for all Fruits
    this.apples.forEach(fruit => { 
        if(snake.head.x === fruit.x && snake.head.y === fruit.y){
            //console.log("HIT");
            snake.grow(this);
            fruit.move(this);
            var pointsToAdd = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
            this.score = this.score + pointsToAdd;
            this.fruitCount++;
            
            // Text Update
            this.scoreText.setText(this.score);
            this.fruitCountText.setText(this.fruitGoal - this.fruitCount);
            
            if (DEBUG) {console.log(                         
                "SCORE=", this.score, 
                "FRUIT=", pointsToAdd,
                "FRUITCOUNT=", this.fruitCount,
                "FRUIT/SCORE=", this.score/this.fruitCount);
            }

            this.scoreTimer = this.time.addEvent({
                delay: 10000,
                paused: false
              });
            return 'valid';
        }
    });

    this.walls.forEach(wall => {
        if(snake.head.x === wall.x && snake.head.y === wall.y){
            snake.alive = false;
            return 'valid';
        }
    });

    // Calculate Closest Portal to Snake Head
    let closestPortal = Phaser.Math.RND.pick(this.portals); // Start with a random portal
    closestPortal.fx.setActive(false);
    var closestPortalDist = Phaser.Math.Distance.Snake(snake.head.x/GRID, snake.head.y/GRID, 
                                                           closestPortal.x/GRID, closestPortal.y/GRID);

    this.portals.forEach( portal => {
        var dist = Phaser.Math.Distance.Snake(snake.head.x/GRID, snake.head.y/GRID, 
                                              portal.x/GRID, portal.y/GRID);

        if (dist < closestPortalDist) { // Compare and choose closer portals
            closestPortalDist = dist;
            closestPortal = portal;
        }
    });

    //closestPortal.fx.setActive(true);

    // This is a bit eccessive because I only store the target portal coordinates
    // and I need to get the portal object to turn on the effect. Probably can be optimized.
    // Good enough for testing.
    if (closestPortalDist < 5) {
        this.portals.forEach(portal => {
            if (portal.x/GRID === closestPortal.target.x && portal.y/GRID === closestPortal.target.y) {
                portal.fx.setActive(true);
            }
        });
    };



    
    //console.log(closestPortal.x, closestPortal.y);

    if (this.fruitCount >= this.fruitGoal) {
        console.log("YOU WIN");
        console.log("SCORE = ", this.score);
        this.children.bringToTop(this.scoreText);

        this.winText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 , 
        ["YOU WIN YAY!", this.score],
        { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
            fontSize: "32px",
            align: "center",
        });

        game.destroy();
    }
}


