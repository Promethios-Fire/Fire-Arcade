import { GRID,  SCREEN_WIDTH, SCREEN_HEIGHT,
    LEFT, RIGHT, UP, DOWN, STOP, DEBUG,
    LENGTHGOAL, REVERSE_ON,
} from "../SnakeHole.js";

var Snake = new Phaser.Class({
    initialize:

    function Snake (scene, x, y)
    {
        this.alive = true;
        this.body = []

        this.head = scene.add.image(x * GRID, y * GRID, 'blocks', 0);
        this.head.setOrigin(0,0).setDepth(99); // Head on Top
        
        this.body.push(this.head);


        this.tail = new Phaser.Geom.Point(x, y); // Start the tail as the same place as the head.
        this.regrouping = false;
        
    },
    
    grow: function (scene) {
        
        // Current Tail of the snake
        this.tail = this.body.slice(-1);
        
        // Add a new part at the current tail position
        // The head moves away from the snake 
        // The Tail position stays where it is and then every thing moves in series
        var newPart = scene.add.image(this.tail.x*GRID, this.tail.y*GRID, 'blocks', 1);
        newPart.setOrigin(0,0);

        this.body.push(newPart);
    },
    
    reverseMove: function(scene, direction, endPart) {
        console.log("REVERSING NOW", this.body);
        this.body.reverse();
        this.move();
        //Phaser.Actions.ShiftPosition(this.body, endPart.x - GRID*2, endPart.y, 1, endPart.y);
        //Phaser.Actions.ShiftPosition(this.body, endPart.x - GRID*2, endPart.y, 1, endPart.y);
        //Phaser.Actions.ShiftPosition(this.body, endPart.x - GRID*3, endPart.y, 1, endPart.y);

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
        tail.some(pos => pos.x === this.body[0].x && pos.y === this.body[0].y) 
    ){
        this.alive = false;
    };

    
    scene.portals.forEach(portal => { 
        if(this.head.x === portal.x && this.head.y === portal.y){
            if (DEBUG) { console.log("PORTAL"); }

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
    
    // Move all Snake Segments
    Phaser.Actions.ShiftPosition(this.body, x, y, this.tail);

    // Check if dead by map
    if (scene.map.getTileAtWorldXY(this.head.x, this.head.y )) {
        if (!REVERSE_ON) {
            this.alive = false;
        }
        else {
            
            /*
            // Reverse a Copy of the Snake
            var reverseBody = this.body.slice().reverse();
            
            // Get the Tail
            var end = Phaser.Utils.Array.GetFirst(reverseBody);

            let restOfSnake = reverseBody.slice(1);

            let reverseDir = STOP;
            
            restOfSnake.every(part => {
                if (part.y === end.y) {
                    let dif = part.x - end.x;
                    if (dif > 0) {
                        console.log("LEFT-body");
                        reverseDir = LEFT;
                    }
                    else {
                        console.log("RIGHT-body");
                        reverseDir = RIGHT;
                    }
                    return false;
                }
                
                reverseDir = STOP; // reset to default
                console.log("No collision")
                return true;
            });

            // No collisions with body.
            if (reverseDir === STOP) {
                
                // Check if to the left or right of the Head location and go opposite.
                if ((end.x/GRID - this.head.x/GRID) > 0) {
                    console.log("RIGHT-head");
                    reverseDir = RIGHT;
                } else {
                    console.log("LEFT-head");
                    reverseDir = LEFT;
                }
            }
            console.log(reverseDir);
            */     

        }
        
        this.alive = false;
        
    }

    // Check collision for all Fruits
    scene.apples.forEach(fruit => {  
        if(this.head.x === fruit.x && this.head.y === fruit.y){
            scene.events.emit('addScore', fruit); // Sends to UI Listener 
            
            this.grow(scene);
            
            // Avoid double fruit getting while in transition
            fruit.x = 0;
            fruit.y = 0;
            fruit.visible = false;
            
            scene.time.delayedCall(500, function () {
                fruit.move(scene);
                fruit.visible = true;
            }, [], this);
            
            // Play crunch sound
            var index = Math.round(Math.random() * scene.crunchSounds.length); 
            if (index == 8){ //this is to ensure index isn't called outside of array length
                index = 7;
            }
            //console.log(index);
            var soundRandom = scene.crunchSounds[index];
            
            soundRandom.play();

            //  Scene.crunch01.play();
            //  Dispatch a Scene event

            //debugger
            scene.apples.forEach(fruit => {
                fruit.startDecay(scene);
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