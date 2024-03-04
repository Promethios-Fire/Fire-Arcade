//******************************************************************** */
// GameSettings           SnakeHole
//******************************************************************** */

var GRID = 24;           //.................. Size of Sprites and GRID
var FRUIT = 4;           //.................. Number of fruit to spawn
var FRUITGOAL = 24;      //............................. Win Condition

var SPEEDWALK = 96; // 96 In milliseconds 
var SPEEDWALK = 96; // 96 In milliseconds 
var SPEEDSPRINT = 24; // 24

// DEBUG OPTIONS

var DEBUG = true;
var DEBUG_AREA_ALPHA = 0.0;   // Between 0,1 to make portal areas appear

// Game Objects
var snake;
var crunchSounds = [];

// Tilemap variables
var map;  // Phaser.Tilemaps.Tilemap 
var tileset;

//  Direction consts
var LEFT = 0;
var RIGHT = 1;
var UP = 2;
var DOWN = 3;

var PORTAL_COLORS = [
    // This color order will be respected. TODO add Slice
    '#fc0303',
    '#06f202',
    '#e2f202',
    '#fc03f8',
    //'#AABBCC'
];

var SOUND_CRUNCH = [
    ['crunch01', [ 'crunch01.ogg', 'crunch01.mp3' ]],
    ['crunch02', [ 'crunch02.ogg', 'crunch02.mp3' ]],
    ['crunch03', [ 'crunch03.ogg', 'crunch03.mp3' ]],
    ['crunch04', [ 'crunch04.ogg', 'crunch04.mp3' ]],
    ['crunch05', [ 'crunch05.ogg', 'crunch05.mp3' ]],
    ['crunch06', [ 'crunch06.ogg', 'crunch06.mp3' ]],
    ['crunch07', [ 'crunch07.ogg', 'crunch07.mp3' ]],
    ['crunch08', [ 'crunch08.ogg', 'crunch08.mp3' ]]
];

// TODOL: Need to truncate this list based on number of portals areas.
// DO this dynamically later based on the number of portal areas.


class GameScene extends Phaser.Scene
{

    constructor ()
    {
        super({key: 'GameScene'});
    }
    
    preload ()
    {
        this.load.image('bg01', 'assets/sprites/background01.png');
        this.load.spritesheet('blocks', 'assets/Tiled/tileSheet.png', { frameWidth: GRID, frameHeight: GRID });
        this.load.spritesheet('portals', 'assets/sprites/portalSheet.png', { frameWidth: 32, frameHeight: 32 });

        // Tilemap
        this.load.image('tileSheetx24', 'assets/Tiled/snakeMap.png');
        this.load.tilemapTiledJSON('map', 'assets/Tiled/snakeMap.json');

        // Audio
        this.load.setPath('assets/audio');

        SOUND_CRUNCH.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });
        //this.load.audio('crunch01', [ 'crunch01.ogg', 'crunch01.mp3' ]);
        //this.load.audio('crunch02', [ 'crunch02.ogg', 'crunch02.mp3' ]);
        //this.load.audio('crunch03', [ 'crunch03.ogg', 'crunch03.mp3' ]);
        //this.load.audio('crunch04', [ 'crunch04.ogg', 'crunch04.mp3' ]);
        //this.load.audio('crunch05', [ 'crunch05.ogg', 'crunch05.mp3' ]);
        //this.load.audio('crunch06', [ 'crunch06.ogg', 'crunch06.mp3' ]);
        //this.load.audio('crunch07', [ 'crunch07.ogg', 'crunch07.mp3' ]);
        //this.load.audio('crunch08', [ 'crunch08.ogg', 'crunch08.mp3' ]);
    }

    

    create ()
    {
        //RESET
        this.crunchSounds = [];
        crunchSounds = this.crunchSounds;

        // Tilemap
        this.map = this.make.tilemap({ key: 'map', tileWidth: GRID, tileHeight: GRID });
        this.tileset = this.map.addTilesetImage('tileSheetx24');

        this.layer = this.map.createLayer('Wall', this.tileset);
        
        // add background
        this.add.image(286, 286, 'bg01').setDepth(-1);

        // Audio
        SOUND_CRUNCH.forEach(soundID =>
            {
                this.crunchSounds.push(this.sound.add(soundID[0]));
            });
        //sounds.push(this.sound.add('crunch01'));
        //sounds.push(this.sound.add('crunch02'));
        //sounds.push(this.sound.add('crunch03'));
        //sounds.push(this.sound.add('crunch04'));
        //sounds.push(this.sound.add('crunch05'));
        //sounds.push(this.sound.add('crunch06'));
        //sounds.push(this.sound.add('crunch07'));
        //sounds.push(this.sound.add('crunch08'));

        this.crunchSounds = crunchSounds.slice(); // This copies. Does it need to copy here?
        //console.log(this.sound.length)

        // arrays for collision detection
        this.apples = [];
        this.walls = [];
        this.portals = [];

        this.fruitCount = 0;

        // Make a copy of Portal Colors.
        // You need Slice to make a copy. Otherwise it updates the pointer only and errors on scene.restart()
        this.portalColors = PORTAL_COLORS.slice(); 

        // Initalize Screen Text Objects
        
        this.fruitCountText = this.add.text(SCREEN_WIDTH - GRID*2, 1*GRID,
                                            FRUITGOAL - this.fruitCount,
                                            { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
                                            fontSize: "32px"});

        
        this.lastMoveTime = 0; // The last time we called move()

        // define keys       
        this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');

        var ourGame = this.scene.get('GameScene');

        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        var ourGame = this.scene.get('GameScene');
        this.input.keyboard.on('keydown', e => {
            ourGame.updateDirection(this, e);
        })

        this.input.keyboard.on('keyup-SPACE', e => { // Capture for releasing sprint
            console.log(e.code+" unPress", this.time.now);
            var ourUI = this.scene.get('UIScene');
            console.log(ourUI.scoreMulti, Math.sqrt(ourUI.scoreMulti));
        }) 

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

        var makePair = function (scene, to, from){
            
            var colorHex = Phaser.Utils.Array.RemoveRandomElement(scene.portalColors); // May Error if more portals than colors.
            var color = new Phaser.Display.Color.HexStringToColor(colorHex);
            
            var p1 = new Portal(scene, color, to, from);
            var p2 = new Portal(scene, color, from, to)
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
                this.heading = LEFT;
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
            let tail = this.body.slice(1);

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

            if (this.heading === LEFT)
            {
                x = Phaser.Math.Wrap(x - GRID, 0, SCREEN_WIDTH);
            }
            else if (this.heading === RIGHT)
            {
                x = Phaser.Math.Wrap(x + GRID, 0 - GRID, SCREEN_WIDTH - GRID);
            }
            else if (this.heading === UP)
            {
                y = Phaser.Math.Wrap(y - GRID, 0, SCREEN_HEIGHT);
            }
            else if (this.heading === DOWN)
            {
                y = Phaser.Math.Wrap(y + GRID, 0 - GRID, SCREEN_HEIGHT - GRID);
            }
            Phaser.Actions.ShiftPosition(this.body, x, y, this.tail);

            // Check if dead by map
            if (scene.map.getTileAtWorldXY(snake.head.x, snake.head.y )) {
                snake.alive = false;
            }

            // Check collision for all Fruits
            scene.apples.forEach(fruit => { 
                if(snake.head.x === fruit.x && snake.head.y === fruit.y){
                    //console.log("HIT");
                    snake.grow(scene);
                    fruit.move(scene);
                    
                    // Play crunch sound
                    var index = Math.round(Math.random() * scene.crunchSounds.length); 
                    if (index == 8){ //this is to ensure index isn't called outside of array length
                        index = 7;
                    }
                    console.log(index);
                    var soundRandom = scene.crunchSounds[index];
                    
                    soundRandom.play();

                    //  Scene.crunch01.play();
                    //  Dispatch a Scene event
                    scene.events.emit('addScore'); // Sends to UI Listener
                    scene.fruitCount++;
                    
                    scene.fruitCountText.setText(FRUITGOAL - scene.fruitCount);
                    
                    if (DEBUG) {console.log(                         
                        "FRUITCOUNT=", scene.fruitCount,
                        );
                    }
                    return 'valid';
                }
            });
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

        for (let index = 0; index < FRUIT; index++) {
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

        var spawnAreaA = new SpawnArea(this, 2,3,6,5, 0x6666ff);
        var spawnAreaB = new SpawnArea(this, 10,3,6,5, 0x6666ff);
        var spawnAreaC = new SpawnArea(this, 24,3,6,5, 0x6666ff);
        var spawnAreaF = new SpawnArea(this, 2,23,6,5, 0x6666ff);

        var spawnAreaG = new SpawnArea(this, 10,13,6,5, 0x6666ff);
        var spawnAreaH = new SpawnArea(this, 24,23,6,5, 0x6666ff);

        var spawnAreaJ = new SpawnArea(this, 16,13,6,5, 0x6666ff);
        var spawnAreaI = new SpawnArea(this, 16,23,6,5, 0x6666ff);





        var A1 = spawnAreaA.genPortalChords(this);
        var H1 = spawnAreaH.genPortalChords(this);

        var B1 = spawnAreaB.genPortalChords(this);
        var G1 = spawnAreaG.genPortalChords(this);

        var C1 = spawnAreaC.genPortalChords(this);
        var F1 = spawnAreaF.genPortalChords(this);

        var J1 = spawnAreaJ.genPortalChords(this);
        var I1 = spawnAreaI.genPortalChords(this);

        makePair(this, A1, H1);
        makePair(this, B1, G1);
        makePair(this, C1, F1);
        makePair(this, J1, I1);

    }


    updateDirection(game, event) 
    {
        // console.log(event.keyCode, this.time.now); // all keys
//console.profile("UpdateDirection");
        //console.time("UpdateDirection");
        switch (event.keyCode) {
            case 87: // w
            //console.log(event.code, game.time.now);
            if (snake.heading === LEFT || snake.heading  === RIGHT || snake.body.length <= 2) { 
                snake.heading = UP; // Prevents backtracking to death
                snake.move(game);
                game.lastMoveTime = game.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            }
            break;

            case 65: // a
            //console.log(event.code, game.time.now);
            if (snake.heading  === UP || snake.heading  === DOWN || snake.body.length <= 2) {
                snake.heading = LEFT;
                snake.move(game);
                game.lastMoveTime = game.time.now;
            }
            break;

            case 83: // s
            //console.log(event.code, game.time.now);
            if (snake.heading  === LEFT || snake.heading  === RIGHT || snake.body.length <= 2) { 
                snake.heading = DOWN;
                snake.move(game);
                game.lastMoveTime = game.time.now;
            }
            break;

            case 68: // d
            //console.log(event.code, game.time.now);
            if (snake.heading  === UP || snake.heading  === DOWN || snake.body.length <= 2) { 
                snake.heading = RIGHT;
                snake.move(game);
                game.lastMoveTime = game.time.now;
            }
            break;

            case 38: // UP
            //console.log(event.code, game.time.now);
            if (snake.heading  === LEFT || snake.heading  === RIGHT || snake.body.length <= 2) {
                snake.heading = UP;
                snake.move(game);
                game.lastMoveTime = game.time.now;
            }
            break;

            case 37: // LEFT
            //console.log(event.code, game.time.now);
            if (snake.heading  === UP || snake.heading  === DOWN || snake.body.length <= 2) { 
                snake.heading = LEFT;
                snake.move(game);
                game.lastMoveTime = game.time.now;
            }
            break;

            case 40: // DOWN
            //console.log(event.code, game.time.now);
            if (snake.heading  === LEFT || snake.heading  === RIGHT || snake.body.length <= 2) { 
                snake.heading = DOWN;
                snake.move(game);
                game.lastMoveTime = game.time.now;
            }
            break;

            case 39: // RIGHT
            //console.log(event.code, game.time.now);
            if (snake.heading  === UP || snake.heading  === DOWN || snake.body.length <= 2) { 
                snake.heading = RIGHT;
                snake.move(game);
                game.lastMoveTime = game.time.now;
            }
            break;

            case 32: // SPACE
            console.log(event.code, game.time.now);

        }
        //console.timeEnd("UpdateDirection");
        //console.profileEnd();

    }

    update (time, delta) 
    {
    // console.log("update -- time=" + time + " delta=" + delta);
        if (!snake.alive)
            {
                // game.scene.scene.restart(); // This doesn't work correctly
                if (DEBUG) { console.log("DEAD"); }
                
                this.events.emit('saveScore');
                //game.destroy();
                this.scene.restart();
                return;
            }

        
        // Only Calculate things when snake is moved.
        if(time >= this.lastMoveTime + this.moveInterval){
            //console.log(time, this.lastMoveTime, this.moveInterval);
            this.lastMoveTime = time;

            //Snake head is moved, check collisions


            // Different ways to look for collisions (keep both for documentation)
            
            // Direct lookup method
            //if (this.map.getTileAtWorldXY(snake.head.x, snake.head.y )) {
            //    console.log(this.map.getTileAtWorldXY(snake.head.x, snake.head.y ));
            //}

            // ForEach method
            /*this.walls.forEach(wall => {
                if(snake.head.x === wall.x && snake.head.y === wall.y){
                    snake.alive = false;
                    return 'valid';
                }
            });
            */

            
            // Calculate Closest Portal to Snake Head
            let closestPortal = Phaser.Math.RND.pick(this.portals); // Start with a random portal
            closestPortal.fx.setActive(false);

            //var fxPortalGlow = closestPortal.postFX.addGlow(0xffffff, 0, 0, false, 0.1, 10);
            
            // Distance on an x y grid

            var closestPortalDist = Phaser.Math.Distance.Between(snake.head.x/GRID, snake.head.y/GRID, 
                                                                closestPortal.x/GRID, closestPortal.y/GRID);

            this.portals.forEach( portal => {
                var dist = Phaser.Math.Distance.Between(snake.head.x/GRID, snake.head.y/GRID, 
                                                    portal.x/GRID, portal.y/GRID);

                if (dist < closestPortalDist) { // Compare and choose closer portals
                    closestPortalDist = dist;
                    closestPortal = portal;
                }
            });


            // This is a bit eccessive because I only store the target portal coordinates
            // and I need to get the portal object to turn on the effect. Probably can be optimized.
            // Good enough for testing.
            if (closestPortalDist < 6) {
                this.portals.forEach(portal => {
                    if (portal.x/GRID === closestPortal.target.x && portal.y/GRID === closestPortal.target.y) {
                        portal.fx.setActive(true);
                        
                        //portal.fx.innerStrength = 6 - closestPortalDist*0.5;
                        portal.fx.outerStrength = 6 - closestPortalDist;

                        closestPortal.fx.setActive(true);
                        closestPortal.fx.innerStrength = 3 - closestPortalDist;
                        closestPortal.fx.outerStrength = 0;

                    }
                });
            };
            if (this.fruitCount >= FRUITGOAL) { // not winning instantly
                console.log("YOU WIN");
    
                this.winText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 , 
                ["YOU WIN YAY!"
                ],
                { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
                    fontSize: "32px",
                    align: "center",
                });
    
                game.destroy();
            }
       
            const ourUI = this.scene.get('UIScene');
            var timeTick = ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
            if (timeTick < 10) {
                
            } else {
                this.apples.forEach( fruit => {
                    fruit.fruitTimerText.setText(timeTick);
                });
            }
            
            // Move at last second
            snake.move(this);
        }
        if (!this.spaceBar.isDown){
            this.moveInterval = SPEEDWALK;} // Less is Faster
        else{
            this.moveInterval = SPEEDSPRINT; // Sprinting now
            var ourUI = this.scene.get('UIScene');
            ourUI.scoreMulti ++;
        }
    }
}

class UIScene extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'UIScene', active: true });

        this.score = 0;
        this.bestScore = 0;
        this.fruitCount = 0;

        this.scoreMulti = 0;
    }

    create()
    {
        const ourGame = this.scene.get('GameScene');
        
        const currentScore = this.add.text(0.5*GRID, 1.5*GRID, 'Score: 0', { font: '18px Arial', fill: '#FFFFFF' });
        const bestScore = this.add.text(5*GRID, 1.5*GRID, 'Best: 0', { font: '18px Arial', fill: '#FFFFFF' });

        // Start Fruit Score Timer
        if (DEBUG) { console.log("STARTING SCORE TIMER"); }

        this.scoreTimer = this.time.addEvent({
            delay: 10000,
            paused: false
         });
        
        this.timerText = this.add.text(SCREEN_WIDTH/2 - 1*GRID , 1.5*GRID , 
                                       this.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
                                       { font: '30px Arial', 
                                         fill: '#FFFFFF',
                                         fontSize: "32px"
                                       });

        //  Event: addScore
        ourGame.events.on('addScore', function ()
        {

            var timeLeft = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
            if (timeLeft > 10) {
                this.score += timeLeft;
            } else {
                this.score += 10;
            }

            //this.score += this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;

            currentScore.setText(`Score: ${this.score}`);

             // Restart Score Timer
            this.scoreTimer = this.time.addEvent({
            delay: 10000,
            paused: false
            });
        }, this);

        //  Event: saveScore
        ourGame.events.on('saveScore', function ()
        {
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                bestScore.setText(`Best: ${this.bestScore}`);
            }
            
            // Reset Score for new game
            this.score = 0;
            this.scoreMulti = 0;
            currentScore.setText(`Score: ${this.score}`); // Update Text on Screen

        }, this);
        
    }
    update()
    {
        var timeTick = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
        if (timeTick < 10) {
            
        } else {
            this.timerText.setText(timeTick);
        }

    }
    
}

var config = {
    type: Phaser.WEBGL,
    width: 768,
    height: 720,
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
    scene: [GameScene, UIScene]
};

// Screen Settings
var SCREEN_WIDTH = config.width;
var SCREEN_HEIGHT = config.height; 

// Edge locations for X and Y
var END_X = SCREEN_WIDTH/GRID -1;
var END_Y = SCREEN_HEIGHT/GRID -1;

// Collision only works if GRID is whole divisor of HEIGHT and WIDTH
if (SCREEN_HEIGHT % GRID != 0 || SCREEN_WIDTH % GRID != 0 ) {
    throw "SCREEN DOESN'T DIVIDE INTO GRID EVENLY SILLY";
}

const game = new Phaser.Game(config);


