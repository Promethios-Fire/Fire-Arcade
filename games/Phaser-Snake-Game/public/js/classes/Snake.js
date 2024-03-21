import { GRID,  SCREEN_WIDTH, SCREEN_HEIGHT,
    LEFT, RIGHT, UP, DOWN, DEBUG,
    LENGTH_GOAL, SPEEDWALK
} from "../SnakeHole.js";
import { Food } from "./Food.js";

var Snake = new Phaser.Class({
    initialize:

    function Snake (scene, x, y)
    {
        this.alive = true;
        this.body = [];
        this.pause_movement = false;
        this.portal_buffer_on = true;  // To avoid taking a portal right after.

        this.head = scene.add.image(x * GRID, y * GRID, 'blocks', 0);
        this.head.setOrigin(0,0).setDepth(10);
        
        this.body.push(this.head);


        this.tail = new Phaser.Geom.Point(x, y); // Start the tail as the same place as the head.
        
    },
    
    grow: function (scene)
    {
        // Current Tail of the snake
        this.tail = this.body.slice(-1);
        
        // Add a new part at the current tail position
        // The head moves away from the snake 
        // The Tail position stays where it is and then every thing moves in series
        var newPart = scene.add.image(this.tail.x*GRID, this.tail.y*GRID, 'blocks', 1);
        newPart.setOrigin(0,0).setDepth(9);

        this.body.push(newPart);

        
        
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
        if (scene.started) {
            this.alive = false;
        }
    }

    
    scene.portals.forEach(portal => { 
        if(this.head.x === portal.x && this.head.y === portal.y && this.portal_buffer_on === true){
            this.portal_buffer_on = false;
            if (DEBUG) { console.log("PORTAL"); }

            var _x = portal.target.x*GRID;
            var _y = portal.target.y*GRID;

            var portalSound = scene.portalSounds[0]
            portalSound.play();

            this.pause_movement = false;
            scene.lastMoveTime += SPEEDWALK * 2 + 1;
            var _tween = scene.tweens.add({
                targets: this.head, 
                x: _x,
                y: _y,
                yoyo: false,
                duration: SPEEDWALK * 2,
                ease: 'linear',
                repeat: 0,
                //delay: 500
            });
            
            scene.time.delayedCall(SPEEDWALK * 4, event => {
                
                console.log("YOU CAN PORTAL AGAIN.");
                this.portal_buffer_on = true;
                
            }, [], scene);
                                
            return ;  //Don't know why this is here but I left it -James
        }
    });

    //if () {
        
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
    //}
    
    // Move all Snake Segments
    Phaser.Actions.ShiftPosition(this.body, x, y, this.tail);

    // Check if dead by map
    if (scene.map.getTileAtWorldXY( this.head.x, this.head.y )) {
        this.alive = false;
    }

    // Check collision for all atoms
    scene.atoms.forEach(_atom => {  
        if(this.head.x === _atom.x && this.head.y === _atom.y){

            scene.events.emit('addScore', _atom); // Sends to UI Listener 
            this.grow(scene);
            // Avoid double _atom getting while in transition
            _atom.x = 0;
            _atom.y = 0;
            _atom.visible = false;
            //_atom.electrons.visible = false;
            //_atom.electrons.stop();
            _atom.electrons.setPosition(0, 0);
            _atom.electrons.visible = false;
        

            
            // Play crunch sound
            var index = Math.round(Math.random() * scene.crunchSounds.length); 
            if (index == 8){ //this is to ensure index isn't called outside of array length
                index = 7;
            }
            //console.log(index);
            var soundRandom = scene.crunchSounds[index];
            
            soundRandom.play();
            
            // Moves the eaten atom after a delay including the electron.
            scene.time.delayedCall(500, function () {
                _atom.move(scene);
                _atom.play("atom01idle", true);
                _atom.visible = true;
                _atom.electrons.visible = true;
                _atom.electrons.anims.restart(); // This offsets the animation compared to the other atoms.
            }, [], this);


            // Refresh decay on all atoms.
            scene.atoms.forEach(__atom => {
                if (__atom.x === 0 && __atom.y === 0) {
                    // Start decay timer for the eaten Apple now. 
                    _atom.startDecay(scene);
                    // The rest is called after the delay.
                    
                } 
                else {
                // For every other atom do everything now
                __atom.play("atom01idle", true);
                __atom.electrons.setVisible(true);
                //this.electrons.anims.restart();
                __atom.absorable = true;
                __atom.startDecay(scene);
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
});

export { Snake };