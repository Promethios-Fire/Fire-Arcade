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

        this.head = scene.add.image(x * GRID, y * GRID, 'snakeDefault', 0).setPipeline('Light2D');
        this.head.setOrigin(0,0).setDepth(10);
        
        this.body.unshift(this.head);

        this.bonked = false;
        this.lastPlayedCombo = 0;

        this.traveling = false;


        this.tail = new Phaser.Geom.Point(x, y); // Start the tail as the same place as the head.

        this.snakeLight = scene.lights.addLight(this.head.x, this.head.y, 96, 0xAF67FF).setIntensity(1);
    },
    
    grow: function (scene)
    {
        if (scene.boostOutlinesBody.length > 0) {
            //newPart.setTint(0xFF00FF);
            // Make the new one
            var boostOutline = scene.add.sprite(
                this.body[this.body.length - 2].x, 
                this.body[this.body.length - 2].y
            ).setOrigin(.083333,.083333).setDepth(15);
             
            boostOutline.play("snakeOutlineAnim");
            scene.boostOutlinesBody.unshift(boostOutline);
        }
        
        this.tail = this.body.slice(-1);

        
        // Add a new part at  the current tail position
        // The head moves away from the snake 
        // The Tail position stays where it is and then every thing moves in series
        var newPart = scene.add.image(this.tail.x*GRID, this.tail.y*GRID, 'snakeDefault', 8);
        newPart.setOrigin(0,0).setDepth(9).setPipeline('Light2D');
        

        if (this.body.length > 1){
            this.body[this.body.length -1].setTexture('snakeDefault',[1])
            
        }
        this.body.push(newPart);



        
        
    },
    
    
    move: function (scene) {
    
    // Alias x and y to the current head position
    let x = this.head.x;
    let y = this.head.y;

    this.snakeLight.x = x + GRID/2;
    this.snakeLight.y = y + GRID/2;

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
            this.traveling = true;
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
            _tween.on('complete',()=>{
                this.traveling = false;
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
        scene.map.setLayer("Wall");
        if (scene.map.getTileAtWorldXY( xN, yN ) && !onPortal && !this.traveling) {
            
            // Only count a wall hit ahead if not on a portal.
            //console.log("HIT", scene.map.getTileAtWorldXY( xN, yN ).layer.name);
            
            this.direction = STOP;
            if (scene.bonkable) {
                this.bonked = true;
            
                if(scene.recombinate) {
                    this.death(scene);
                }   
            }
        }

        
    
        // #region intesect self
        if (scene.startMoving && !onPortal && !scene.ghosting && !this.traveling) {
        // Game Has started. Snake head has left Starting Square
            

            var body = this.body.slice(1);


            // Remove the Tail because the Tail will always move out of the way
            // when the head moves forward.
            body.pop();

            
            body.some(part => {
                if (part.x === xN && part.y === yN) {
                    var portalSafe = false; // Assume not on portal
                    scene.portals.forEach(portal => { 
                        if(xN === portal.x && yN === portal.y && this.portal_buffer_on === true){
                            portalSafe = true; // Mark on portal
                        }
                    });
                    
                    if (!portalSafe) {
                        this.direction = STOP;
                        if (scene.bonkable) {
                            this.bonked = true;
                            if(scene.recombinate) {
                                this.death(scene);
                            }
                        }
                        // Only colide if the snake has left the center square    
                    }  
                }
            }) 
        }
        // #endregion
        const ourUI = scene.scene.get('UIScene'); // needs to move to somewhere more efficent
    
    // Actually Move the Snake Head
    if (this.alive && this.direction != STOP) {
        if (!this.bonked) {
            Phaser.Actions.ShiftPosition(this.body, xN, yN, this.tail);
        }
    }

    // Check collision for all atoms
    scene.atoms.forEach(_atom => {  
        if(this.head.x === _atom.x && this.head.y === _atom.y && !this.traveling){
            const ourUI = scene.scene.get('UIScene');
            var timeSinceFruit = ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10;

            if(timeSinceFruit > COMBO_ADD_FLOOR){
                if (this.lastPlayedCombo > 0) {
                    ourUI.comboCounter += 1;
                    ourUI.comboBounce();
                    };
                scene.pointSounds[this.lastPlayedCombo].play();       
                if (this.lastPlayedCombo < 7) {
                    this.lastPlayedCombo += 1;
                }
            }
            else {
                this.lastPlayedCombo = 0;
                ourUI.comboCounter = 0;
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
    },
});

export { Snake };