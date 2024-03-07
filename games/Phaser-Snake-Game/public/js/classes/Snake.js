import { GRID,  SCREEN_WIDTH, SCREEN_HEIGHT,
    LEFT, RIGHT, UP, DOWN, DEBUG,
    FRUITGOAL
} from "../SnakeHole.js";

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
        
        this.heading = LEFT;
    },
    
    grow: function (scene)
    {
        // Add a new part at the current tail position
        // The head moves away from the snake 
        // The Tail position stays where it is and then every thing moves in series
        var newPart = scene.add.image(this.tail.x, this.tail.y, 'blocks', 1);
        this.body.push(newPart);

        newPart.setOrigin(0,0);
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
    Phaser.Actions.ShiftPosition(this.body, x, y, this.tail);

    // Check if dead by map
    if (scene.map.getTileAtWorldXY(this.head.x, this.head.y )) {
        this.alive = false;
    }

    scene.apples.forEach(fruit => {  // Check collision for all Fruits
        if(this.head.x === fruit.x && this.head.y === fruit.y){
            console.log(fruit.x, fruit.y);
            scene.events.emit('addScore', fruit); // Sends to UI Listener 
            
            this.grow(scene);
            fruit.move(scene);
            
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