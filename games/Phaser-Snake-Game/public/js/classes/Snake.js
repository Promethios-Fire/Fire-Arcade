import { GRID,  SCREEN_WIDTH, SCREEN_HEIGHT,
    LEFT, RIGHT, UP, DOWN, STOP, DEBUG,
    LENGTH_GOAL, SPEEDWALK, COMBO_ADD_FLOOR
} from "../SnakeHole.js";
import { Food } from "./Food.js";

var Snake = new Phaser.Class({
    initialize:

    function Snake (scene, x, y)
    {
        this.alive = true;
        this.body = [];
        this.hold_move = false;
        this.portal_buffer_on = true;  // To avoid taking a portal right after.

        this.head = scene.add.image(x * GRID, y * GRID, 'snakeDefault', 0);
        this.head.setOrigin(0,0).setDepth(10);
        
        this.body.push(this.head);

        this.bonked = false;
        this.lastPlayedCombo = 0;


        this.tail = new Phaser.Geom.Point(x, y); // Start the tail as the same place as the head.
        
    },
    
    grow: function (scene)
    {
        // Current Tail of the snake
        this.tail = this.body.slice(-1);
        
        // Add a new part at the current tail position
        // The head moves away from the snake 
        // The Tail position stays where it is and then every thing moves in series
        var newPart = scene.add.image(this.tail.x*GRID, this.tail.y*GRID, 'snakeDefault', 1);
        newPart.setOrigin(0,0).setDepth(9);

        this.body.push(newPart);

        
        
    },
    
    
    move: function (scene) {
    
    // Alias x and y to the current head position
    let x = this.head.x;
    let y = this.head.y;

    var onPortal = false;

    
    scene.portals.forEach(portal => { 
        if(this.head.x === portal.x && this.head.y === portal.y && this.portal_buffer_on === true){
            onPortal = true; // Used to ignore certain collisions when you are on top of a portal.
            this.portal_buffer_on = false; // Used to keep you from reportaling immediately
            
            this.hold_move = true; // Keep the head from moving while recombinating.

            if (DEBUG) { console.log("PORTAL"); }

            var _x = portal.target.x*GRID;
            var _y = portal.target.y*GRID;

            var portalSound = scene.portalSounds[0]
            portalSound.play();

            scene.lastMoveTime += SPEEDWALK * 2;
            var _tween = scene.tweens.add({
                targets: this.head, 
                x: _x,
                y: _y,
                yoyo: false,
                duration: SPEEDWALK * 2,
                ease: 'Linear',
                repeat: 0,
                //delay: 500
            });
            
            scene.time.delayedCall(SPEEDWALK * 4, event => {
                
                //console.log("YOU CAN PORTAL AGAIN.");
                this.portal_buffer_on = true;
                this.hold_move = false;
                
            }, [], scene);
                                
            return ;  //Don't know why this is here but I left it -James
        }
    });

    // Look ahead for bonks

    var xN = this.head.x;
    var yN = this.head.y;

        
        if (this.direction === LEFT)
        {
            xN = Phaser.Math.Wrap(this.head.x  - GRID, 0, SCREEN_WIDTH);
        }
        else if (this.direction === RIGHT)
        {
            xN = Phaser.Math.Wrap(this.head.x  + GRID, 0 - GRID, SCREEN_WIDTH - GRID);
        }
        else if (this.direction === UP)
        {
            yN = Phaser.Math.Wrap(this.head.y - GRID, GRID * 2, SCREEN_HEIGHT - GRID);
        }
        else if (this.direction === DOWN)
        {
            yN = Phaser.Math.Wrap(this.head.y + GRID, GRID * 1, SCREEN_HEIGHT - GRID * 2 );
        }
        
        // Bonk Wall
        if (scene.map.getTileAtWorldXY( xN, yN ) && !onPortal) {
            // Only count a wall hit ahead if not on a portal.
            //console.log("HIT", scene.map.getTileAtWorldXY( xN, yN ).layer.name);
            this.direction = STOP;
            this.bonked = true;
            
            if(scene.recombinate) {
                this.death(scene);
            }
        }

        
    
        // #region Bonk Self
        if (scene.startMoving && !onPortal) {
        // Game Has started. Snake head has left Starting Square
            

            var tail = this.body.slice(1);


            // Remove the Tail because the Tail will always move out of the way
            // when the head moves forward.
            tail.pop();

            
            tail.some(part => {
                if (part.x === xN && part.y === yN) {
                    var portalSafe = false; // Assume not on portal
                    scene.portals.forEach(portal => { 
                        if(xN === portal.x && yN === portal.y && this.portal_buffer_on === true){
                            portalSafe = true; // Mark on portal
                        }
                    });
                    
                    
                    if (!portalSafe) {
                        this.direction = STOP;
                        this.bonked = true;
                        if(scene.recombinate) {
                            this.death(scene);
                        }
                        // Only colide if the snake has left the center square    
                    }  
                }
            })
            
        }
        // #endregion
        

    
    // Actually Move the Snake Head
    if (this.alive) {
        if (!this.bonked) {
            Phaser.Actions.ShiftPosition(this.body, xN, yN, this.tail);
        }
    }
    
    
    

    // Check if dead by map

    
    
    

    // Check collision for all atoms
    scene.atoms.forEach(_atom => {  
        if(this.head.x === _atom.x && this.head.y === _atom.y){
            const ourUI = scene.scene.get('UIScene');
            var timeSinceFruit = ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
            //console.log("time since last fruit:", timeSinceFruit);
            
            if(timeSinceFruit > COMBO_ADD_FLOOR){
                 
                //console.log("combo",this.lastPlayedCombo)
                
                scene.pointSounds[this.lastPlayedCombo].play();
                
                if (this.lastPlayedCombo < 7) {
                    this.lastPlayedCombo += 1;
                }
            }
            else {
                this.lastPlayedCombo = 0;
            }
            


            scene.events.emit('addScore', _atom); // Sends to UI Listener 
            this.grow(scene);
            // Avoid double _atom getting while in transition
            _atom.x = 0;
            _atom.y = 0;
            _atom.visible = false;
            //_atom.electrons.visible = false;
            _atom.electrons.play("electronIdle");
            //_atom.electrons.setPosition(0, 0);
            _atom.electrons.visible = false;
        
            // Play atom sound
            var _index = Phaser.Math.Between(0, scene.atomSounds.length - 1);
            scene.atomSounds[_index].play();//Use "index" here instead of "i" if we want randomness back
            
            // Moves the eaten atom after a delay including the electron.
            scene.time.delayedCall(500, function () {
                _atom.move(scene);
                _atom.play("atom01idle", true);
                _atom.visible = true;
                _atom.electrons.visible = true;
                _atom.electrons.anims.restart(); // This offsets the animation compared to the other atoms.

            }, [], this);

            //this.electrons.play("electronIdle");
             // Setting electron framerate here to reset it after slowing in delay 2
            
            // Refresh decay on all atoms.
            scene.atoms.forEach(__atom => {
                if (__atom.x === 0 && __atom.y === 0) {
                    // Start decay timer for the eaten Apple now. 
                    __atom.startDecay(scene);
                    // The rest is called after the delay.
                } 
                else {
                // For every other atom do everything now
                __atom.play("atom01idle", true);
                __atom.electrons.setVisible(true);
                //this.electrons.anims.restart();
                //__atom.absorbable = true;
                __atom.startDecay(scene);

                __atom.electrons.play("electronIdle", true);
                __atom.electrons.anims.msPerFrame = 66
                }

            });
            
            if (DEBUG) {console.log(                         
                "FRUITCOUNT=", scene.fruitCount,
                );
            }
            return 'valid';
        }
    });
    },
    death: function (gameScene) {
        this.alive = false;
        this.hold_move = true;
        gameScene.move_pause = true;

        this.direction = STOP;
        gameScene.started = false;
    }
});

export { Snake };