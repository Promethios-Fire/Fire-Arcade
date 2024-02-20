var config = {
    type: Phaser.WEBGL,
    width: 832,
    height: 640,
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var snake;

//  Direction consts
var LEFT = 0;
var RIGHT = 1;
var UP = 2;
var DOWN = 3;

// Screen Globals
var GRID = 32; // Size of Sprites and GRID
var SCREEN_WIDTH = 832; // In pixels needs to manually be the same in var config
var SCREEN_HEIGHT = 640; // Same as above

// Edge locations for X and Y
var END_X = SCREEN_WIDTH/GRID -1;
var END_Y = SCREEN_HEIGHT/GRID -1;

// Collision only works if GRID is whole divisor of HEIGHT and WIDTH
if (SCREEN_HEIGHT % GRID != 0 || SCREEN_WIDTH % GRID != 0 ) {
    throw "SCREEN DOESN'T DIVIDE INTO GRID EVENLY SILLY";
}

// DEBUG OPTIONS

var DEBUG_AREA_ALPHA = 0.25;   // Between 0,1 to make portal areas appear

const game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/skies/pixelsky.png');
    this.load.spritesheet('blocks', 'assets/sprites/heartstar32.png', { frameWidth: GRID, frameHeight: GRID });
    this.load.spritesheet('portals', 'assets/sprites/portalBluex32.png', { frameWidth: GRID, frameHeight: GRID });
}

function create ()
{
    
    this.apples = [];
    this.walls = [];
    this.portals = [];

    this.score = 0;
    
    this.lastMoveTime = 0; // The last time we called move()
    this.moveInterval = 96;

    // define keys       
    this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');

    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.on('keydown', e => {
        updateDirection(this, e);
    })

    this.input.keyboard.on('keyup-SPACE', e => { // Capture for releasing sprint
        console.log(e.code+" unPress", this.time.now);
    }) 
    
    // add background
    this.add.image(416, 320, 'sky');

    var Food = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Food (scene)
        {

            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture('blocks', 1);
            this.move(scene);
            this.setOrigin(0);

            this.points = 100;

            scene.apples.push(this);

            scene.children.add(this);
        },
        
        move: function (scene)
        {
            let x;
            let y;

            var safe = [];
            var safePoints = [];
            
            
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
                testGrid[wall.x/GRID][wall.y/GRID] = false;
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
            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture('blocks', 0);
            this.setPosition(x * GRID, y * GRID);
            this.setOrigin(0);

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
            this.body.push(this.head);

            this.tail = new Phaser.Geom.Point(x, y); // Start the tail as the same place as the head.
            
            this.moveTime = 0;
            this.direction = LEFT;
        },
        
        grow: function (scene)
        {
            // Add a new part at the current tail position
            // The head moves away from the snake 
            // The Tail position stays where it is and then every thing moves in series
            var newPart = scene.add.image(this.tail.x, this.tail.y, 'blocks', 0);
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
            x = Phaser.Math.Wrap(x + GRID, 0, SCREEN_WIDTH);
        }
        else if (this.direction === UP)
        {
            y = Phaser.Math.Wrap(y - GRID, 0, SCREEN_HEIGHT);
        }
        else if (this.direction === DOWN)
        {
            y = Phaser.Math.Wrap(y + GRID, 0, SCREEN_HEIGHT);
        }
        Phaser.Actions.ShiftPosition(this.body, x, y, this.tail);

        },
    });

    snake = new Snake(this, 8, 8);
    
    // width 25 grid
    // width 19

    for (let i = 0; i <= END_X; i++) {
        wall = new Wall(this, i, 0);
        wall = new Wall(this, i, 19);
      }
    
    var wall = new Wall(this, 10, 10);
    var wall = new Wall(this, 10, 11);
    var wall = new Wall(this, 10, 12);
    var wall = new Wall(this, 10, 13);
    var wall = new Wall(this, 10, 14);

    for (let index = 0; index < 3; index++) {
        var food = new Food(this);
        
    }

    // Todo Portal Spawning Algorithm
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

}


function updateDirection(game, event) 
{
    // console.log(event.keyCode, this.time.now); // all keys
    switch (event.keyCode) {
        case 87: // w
        //console.log(event.code, game.time.now);
        snake.direction = UP;
        break;

        case 65: // a
        //console.log(event.code, game.time.now);
        snake.direction = LEFT;
        break;

        case 83: // s
        //console.log(event.code, game.time.now);
        snake.direction = DOWN;
        break;

        case 68: // d
        //console.log(event.code, game.time.now);
        snake.direction = RIGHT;
        break;

        case 38: // UP
        //console.log(event.code, game.time.now);
        snake.direction = UP;
        break;

        case 37: // LEFT
        //console.log(event.code, game.time.now);
        snake.direction = LEFT;
        break;

        case 40: // DOWN
        //console.log(event.code, game.time.now);
        snake.direction = DOWN;
        break;

        case 39: // RIGHT
        //console.log(event.code, game.time.now);
        snake.direction = RIGHT;
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
            return;
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
            this.score = this.score + fruit.points;
            console.log("HIT: ","SCORE=", this.score);
            return 'valid';  //Don't know why this is here but I left it -James
        }
    });

    this.walls.forEach(wall => {
        if(snake.head.x === wall.x && snake.head.y === wall.y){
            console.log("DEAD");
            snake.alive = false;
            return 'valid'; //Don't know why this is here but I left it -James
        }
    });
}


