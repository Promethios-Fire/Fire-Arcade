var config = {
    type: Phaser.WEBGL,
    width: 768, // If you change these remember 
    height: 640,// to update below as well
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
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
var GRID = 32; // Size of Sprites and GRID
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
var DEBUG_AREA_ALPHA = 0.2;   // Between 0,1 to make portal areas appear

const game = new Phaser.Game(config);

function preload ()
{
    //this.load.image('sky', 'assets/skies/pixelsky.png');
    this.load.spritesheet('blocks', 'assets/sprites/tileSheet.png', { frameWidth: GRID, frameHeight: GRID });
    this.load.spritesheet('portals', 'assets/sprites/portalBluex32.png', { frameWidth: GRID, frameHeight: GRID });

    // Tilemap
    this.load.image('tileSheet', 'assets/Tiled/snakeMap.png');
    this.load.tilemapTiledJSON('map', 'assets/Tiled/snakeMap.json');

}

function create ()
{
    // Tilemap
    this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
    this.tileset = this.map.addTilesetImage('tileSheet');
    this.layer = this.map.createLayer('Wall', this.tileset);

    this.map.setCollision([1,4]);

    this.snake = this.physics.add.sprite(0, 0, 'ball'),
    this.snake.setOrigin(0);

    this.physics.add.collider(this.snake, layer);


    // this.physics.add.overlap(player, layer, () => {
    //     console.log('overlapping');
    // });

    this.apples = [];
    this.walls = [];
    this.portals = [];


    create ()
    {
        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        this.tileset = this.map.addTilesetImage('tileSheet');
        this.layer = this.map.createLayer('Wall', this.tileset);

        this.map.setCollision([1,4]);

        this.pickups = this.map.filterTiles(tile => tile.index === 82);

        this.player = this.add.rectangle(96, 96, 24, 38, 0xffff00);

        this.physics.add.existing(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.cursors.up.on('down', () =>
        {
            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture('blocks', 2);
            this.move(scene);
            this.setOrigin(0);

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
            /*scene.walls.forEach(wall => {
                testGrid[wall.x/GRID][wall.y/GRID] = false;
            });*/

            scene.apples.forEach(fruit => {
                testGrid[fruit.x/GRID][fruit.y/GRID] = false;
            });

            scene.portals.forEach(portal => {
                testGrid[portal.x/GRID][portal.y/GRID] = false;
            });

            
            var validLocations = [];
        
            for (var x2 = 0; x2 <= END_X; x2++)

            {
                this.player.body.setVelocityY(-360);
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
            Phaser.GameObjects.Image.call(this, scene)

            //this.setTexture('blocks', 3);
            //this.setPosition(x * GRID, y * GRID);
            //this.setOrigin(0);

            scene.walls.push(this);

            scene.children.add(this);
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

            this.target = { x: to[0], y: to[1]};

            scene.portals.push(this);
            
            this.tint = color.color;
            scene.children.add(this);

        },
        
    });

    var makePair = function (scene, to, from){

        var color = new Phaser.Display.Color()
        color.random(1);
        
        var p1 = new Portal(scene, color, to, from);
        var p2 = new Portal(scene, color, from, to);

        this.info = this.add.text(10, 10, 'Player');
    }

    update ()
    {
        this.player.body.setVelocityX(0);

        if (this.cursors.left.isDown)
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
            this.body.push(this.head);

            //this.snake here?
            //this.physics.add.existing(this.snake);

            this.tail = new Phaser.Geom.Point(x, y); // Start the tail as the same place as the head.
            
            this.moveTime = 0;
            this.direction = LEFT;
        },
        
        grow: function (scene)
        {
            // Add a new part at the current tail position
            // The head moves away from the snake 
            // The Tail position stays where it is and then every thing moves in series
            var newPart = scene.add.image(this.tail.x, this.tail.y, 'blocks', 1);
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
        else if (this.cursors.right.isDown)
        {
            this.player.body.setVelocityX(200);
        }

        //  Collide player against the tilemap layer
        this.physics.collide(this.player, this.layer);

        //  Custom tile overlap check
        this.physics.world.overlapTiles(this.player, this.pickups, this.hitPickup, null, this);

    var C1 = spawnAreaC.genPortalChords(this);
    var F1 = spawnAreaF.genPortalChords(this);

    makePair(this, A1, H1);
    makePair(this, C1, F1);
    makePair(this, G1, A2);

}


function updateDirection(game, event) 
{
    // console.log(event.keyCode, this.time.now); // all keys
    switch (event.keyCode) {
        case 87: // w
        //console.log(event.code, game.time.now);
        if (snake.direction != DOWN || snake.body.length <= 2) { 
            snake.direction = UP; // Prevents backtracking to death
        }
        break;

        case 65: // a
        //console.log(event.code, game.time.now);
        if (snake.direction != RIGHT || snake.body.length <= 2) {
            snake.direction = LEFT;
        }
        break;

        case 83: // s
        //console.log(event.code, game.time.now);
        if (snake.direction != UP || snake.body.length <= 2) { 
            snake.direction = DOWN;
        }
        break;

        case 68: // d
        //console.log(event.code, game.time.now);
        if (snake.direction != LEFT || snake.body.length <= 2) { 
            snake.direction = RIGHT;
        }
        break;

        case 38: // UP
        //console.log(event.code, game.time.now);
        if (snake.direction != DOWN || snake.body.length <= 2) {
            snake.direction = UP;
        }
        break;

        case 37: // LEFT
        //console.log(event.code, game.time.now);
        if (snake.direction != RIGHT || snake.body.length <= 2) { 
            snake.direction = LEFT;
        }
        break;

        case 40: // DOWN
        //console.log(event.code, game.time.now);
        if (snake.direction != UP || snake.body.length <= 2) { 
            snake.direction = DOWN;
        }
        break;

        case 39: // RIGHT
        //console.log(event.code, game.time.now);
        if (snake.direction != LEFT  || snake.body.length <= 2) { 
            snake.direction = RIGHT;
        }
        break;

        case 32: // SPACE
        console.log(event.code, game.time.now);

        this.info.setText(`left: ${blocked.left} right: ${blocked.right} down: ${blocked.down}`);
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
    //  Collide snake against the tilemap layer
    if (this.physics.collide(this.snake, this.layer)){
        console.log("HIT");
    }
    
    if(time >= this.lastMoveTime + this.moveInterval){
        this.lastMoveTime = time;
        snake.move(this);
        //console.log(this.previousDirection)
    }
    if (!this.spaceBar.isDown){
        this.moveInterval = 96;} // Less is Faster
    else{
        this.moveInterval = 32;
    }
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
    },
    scene: Example
};

const game = new Phaser.Game(config);
