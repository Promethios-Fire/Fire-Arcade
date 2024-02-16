export default class Snake {

    constructor(scene){
        this.scene = scene;
        this.lastMoveTime = 0; // The last time we called move()
        // this.moveInterval = 80;
        this.tileSize = 32;
        this.spawnZone = this.tileSize*4
        this.direction = Phaser.Math.Vector2.DOWN;
        this.previousDirection = Phaser.Math.Vector2.DOWN;
        this.body = []; // body will be a set of boxes
        this.moveCount = 0;
        this.q = 3;
        this.qSize = 256;
        this.portalCount = 0;
        this.newQuadrant(this.q, this.qSize);

        //head of the snake
        this.body.push(this.scene.add.sprite(
            this.scene.game.config.width/2, // In the middle
            this.scene.game.config.height/300, 
            "snakeHead32"
            ).setOrigin(0,0));

        // setOrigin will show the full square at 0,0
        // setOrigin with .0625 moves it over one pixel which is needed because apple is over 16x16 pixels(1 tile)
        this.apples = []
        this.apples[0] = this.scene.add.sprite(
            this.scene.game.config.width -this.tileSize*4,
            this.scene.game.config.height/2, 
            "apple"
            ).setOrigin(.0625,.0625);
        this.apples[1] = this.scene.add.sprite(
            this.scene.game.config.width -this.tileSize*4,
            this.scene.game.config.height/2, 
            "apple"
            ).setOrigin(.0625,.0625);
        this.apples[2] = this.scene.add.sprite(
            this.scene.game.config.width -this.tileSize*4,
            this.scene.game.config.height/2, 
            "apple"
            ).setOrigin(.0625,.0625);
        
        this.portal = []; // define a array for portals
        //this.wall = [];


        // colors
        this.color = [];
        this.color[0] = "0x0000ff";
        this.color[1] = "0xffff00"
        this.color[2] = "0xFFA500"
        this.color[3] = "0x8300ff"

        // map out portal spawns
        this.map1 = [];
        this.map2 = [];
        this.map1 = this.mapArray();
        this.map2 = this.mapArray();

        // redo second sequence until it is nothing like the first one
        while (JSON.stringify(this.map1) === JSON.stringify(this.map2)) {
            this.map2 = this.mapArray();
        }
        // combine two random quadrant arrays for mappinng
        this.combinedMapping = this.map1.concat(this.map2);

        // call methods
        this.positionApple(0); // drop first apple
        this.positionApple(1); // drop first apple
        this.positionApple(2); // drop first apple
        this.positionPortal(); // position portals
        // this.positionWall(); // position walls
        
        // define keys
        scene.input.keyboard.on('keydown', e => {
            this.keydown(e);
        })
        this.spaceBar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    positionApple(i) {
        this.apples[i].x = Math.floor(

            (Math.random() * this.scene.game.config.width)/this.tileSize
            ) * this.tileSize;
        this.apples[i].y = Math.floor(
            (Math.random() * this.scene.game.config.height)/this.tileSize
            ) * this.tileSize;
        if (this.apples[i].x == this.scene.game.config.width/2 || this.apples[i].y == this.scene.game.config.width/2) {
            this.apples[i].x += this.tileSize;
        }
        this.moveCount++;
        if (this.moveCount % 3 == 0) {
            this.positionPortal();
        }
    }

    newQuadrant(q, qSize) {
        if (this.tileSize % qSize ==  0) {
            throw console.error("bad board size");
        }

        this.scene.game.config.width = (q * qSize);
        this.scene.game.config.height = (q * qSize);
        //q is quadrant
        for (let j = 1; j < q; j++) {
            this.positionWall(q, j);
            console.log("J =",j)
        }
        console.log(this.scene.game.config.width);

    }




    positionPortal() {
        console.log("*********************************");
        let c = 0;
        let z = 0;
        let index = (this.q * this.q)*2

        let evenMin = 32;
        let evenMax = this.qSize/2;

        let oddMin = this.qSize/2;
        let oddMax = this.qSize-32;

        let yMin = 32;
        let yMax = this.qSize-32;

        for (let i = 0; i < index+1; i++) {
            this.portal[i] = this.scene.add.sprite(this.tileSize, this.tileSize, "portalBlue").setOrigin(.0625,.0625);
            if (i < (this.q*2)) {
                if (i % 2 == 0) {
                    this.portal[i].x = Math.floor((Math.random() * (evenMin - evenMax) + evenMax)/this.tileSize) * this.tileSize;
                    this.portal[i].y = Math.floor((Math.random() * (yMin - yMax) + yMax)/this.tileSize) * this.tileSize;
                    evenMin += this.qSize;
                    evenMax += this.qSize;
                } else {
                    this.portal[i].x = Math.floor((Math.random() * (oddMin - oddMax) + oddMax)/this.tileSize) * this.tileSize;
                    this.portal[i].y = Math.floor((Math.random() * (yMin - yMax) + yMax)/this.tileSize) * this.tileSize;
                    oddMin += this.qSize;
                    oddMax += this.qSize;
                }
            } else if (i >= this.q*2 && z < this.q*2) {
                if (i == this.q*2) {
                    yMin += this.qSize;
                    yMax += this.qSize;
                    evenMin = 32;
                    evenMax = this.qSize/2;
                    oddMin = this.qSize/2;
                    oddMax = this.qSize-32;
                    console.log("check1");
                }
                if (i % 2 == 0) {
                    this.portal[i].x = Math.floor((Math.random() * (evenMin - evenMax) + evenMax)/this.tileSize) * this.tileSize;
                    this.portal[i].y = Math.floor((Math.random() * (yMin - yMax) + yMax)/this.tileSize) * this.tileSize;
                    evenMin += this.qSize;
                    evenMax += this.qSize;
                } else {
                    this.portal[i].x = Math.floor((Math.random() * (oddMin - oddMax) + oddMax)/this.tileSize) * this.tileSize;
                    this.portal[i].y = Math.floor((Math.random() * (yMin - yMax) + yMax)/this.tileSize) * this.tileSize;
                    oddMin += this.qSize;
                    oddMax += this.qSize;
                }
                z++;
            } else if (i > this.q*2 && z >= this.q*2) {
                if (z == this.q*2) {
                    yMin += this.qSize;
                    yMax += this.qSize;
                    evenMin = 32;
                    evenMax = this.qSize/2;
                    oddMin = this.qSize/2;
                    oddMax = this.qSize-32;
                    z++;
                    console.log("check2");
                }
                if (i % 2 == 0) {
                    this.portal[i].x = Math.floor((Math.random() * (evenMin - evenMax) + evenMax)/this.tileSize) * this.tileSize;
                    this.portal[i].y = Math.floor((Math.random() * (yMin - yMax) + yMax)/this.tileSize) * this.tileSize;
                    evenMin += this.qSize;
                    evenMax += this.qSize;
                } else {
                    this.portal[i].x = Math.floor((Math.random() * (oddMin - oddMax) + oddMax)/this.tileSize) * this.tileSize;
                    this.portal[i].y = Math.floor((Math.random() * (yMin - yMax) + yMax)/this.tileSize) * this.tileSize;
                    oddMin += this.qSize;
                    oddMax += this.qSize;
                }
            }
            // if (i % 2 < 0.5) {
            //     c++; // change color every even number
            //     console.log("color");
            // }
            //console.log(this.portal[i].x, this.portal[i].y);
        }
        console.log("*********************************");
    }

    positionWall(walls, factor) {
       for (let i = -31; i < this.scene.game.config.height; i++) {
            if (i <256 || i > 496){
                i += 31 // use 15 here because counting in steps of 32 means it's only printing a tile every 32 pixels
                let wall = [];
                let wallY = [];
                wall[i] = this.scene.add.sprite(this.tileSize, this.tileSize, "wallSing01x32").setOrigin(0);
                wall[i].x = (this.scene.game.config.height/walls)*factor;
                wall[i].y = i;


                wallY[i] = this.scene.add.sprite(this.tileSize, this.tileSize, "wallSing01x32").setOrigin(0);
                wallY[i].x = i;
                wallY[i].y = (this.scene.game.config.height/walls)*factor;
            }
        }
    }

    keydown(event) {
        // console.log(event);
        switch(event.keyCode){
            case 37:    //left
                if(this.direction !== Phaser.Math.Vector2.RIGHT && this.direction == this.previousDirection)    
                    this.direction = Phaser.Math.Vector2.LEFT;
                    this.moveCount = 0;
                break;
            case 38:    //up
                if(this.direction !== Phaser.Math.Vector2.DOWN && this.direction == this.previousDirection)
                    this.direction = Phaser.Math.Vector2.UP;
                    this.moveCount = 0;
                break;
            case 39:    //right
                if(this.direction !== Phaser.Math.Vector2.LEFT && this.direction == this.previousDirection)
                    this.direction = Phaser.Math.Vector2.RIGHT;
                    this.moveCount = 0;
                break;
            case 40:    //down
                if(this.direction !== Phaser.Math.Vector2.UP && this.direction == this.previousDirection)
                    this.direction = Phaser.Math.Vector2.DOWN;
                    this.moveCount = 0;
                break;
            /*case 32:    //space
            if (this.moveInterval>60) {
                this.moveInterval = 60;
            } else {
                this.moveInterval = 120;
            }
                break;*/
        }
    }
        // need to call at the start of every loop 
    counter() {
        if (portalCount = 4) {
            this.positionPortal()
        }
        
    }

    // Randomly generates a sequence of 0-3 for choosing a portals quadrant
    // 0 | 1
    // __|__
    //   | 
    // 2 | 3
    mapArray() {
        let numbers = [0, 1, 2, 3, 0, 1, 2, 3];
        let mapping = [];

        while (numbers.length > 0) {
            // Exclude numbers that are the same as the last number added
            let options = numbers.filter(n => n !== mapping[mapping.length - 1]);

            // Select a random number from the options
            let randomIndex = Math.floor(Math.random() * options.length);
            let number = options[randomIndex];

            // Add the number to the mapping
            mapping.push(number);

            // Remove the number from the numbers array
            numbers = numbers.filter(n => n !== number);
        }

        return mapping;
    }
    
    
    // Game Loop
    update(time){
        if(time >= this.lastMoveTime + this.moveInterval){
            this.lastMoveTime = time;
            this.move();
            console.log(this.previousDirection)
        }
        if (!this.spaceBar.isDown){
            this.moveInterval = 64;} // Less is Faster
        else{
            this.moveInterval = 32;
        }
        
    }

    move(){
        let x = this.body[0].x + this.direction.x * this.tileSize;
        let y = this.body[0].y + this.direction.y * this.tileSize;
        
        this.previousDirection = this.direction;

        // if snakes eat the apple
        if(this.apples[0].x === x && this.apples[0].y === y){
            this.body.push(
                this.scene.add.
                sprite(0,0,"snakeBody32")
                .setOrigin(0,0)
            );
            this.positionApple(0);

        }
        if(this.apples[1].x === x && this.apples[1].y === y){
            this.body.push(
                this.scene.add.
                sprite(0,0,"snakeBody32")
                .setOrigin(0,0)
            );
            this.positionApple(1);

        }
        if(this.apples[2].x === x && this.apples[2].y === y){
            this.body.push(
                this.scene.add.
                sprite(0,0,"snakeBody32")
                .setOrigin(0,0)
            );
            this.positionApple(2);

        }
        /** TODO
         * Neeed to create a solution for portal travel
         * conditions:
         * - Needs to not get stuck in previous loop
         * - Requires to have a way to reset where travel goes.
         * - Counters? How is it going to factor in.
         */

        let j;// check even/odds
        // for (let i = 0; i < 8; i++) {
        //     if (this.portal[i].x == x && this.portal[i].y == y) {
        //         let check = i % 2; // if portal # even = 0 | if portal # odd = 1
        //         if (check < 1) { // if even spawn to portal after it
        //             j = i+1;
        //         } else {        // if odd spawn in portal behind it
        //             j = i-1;
        //         }
        //         if (this.direction.x == 1 && this.direction.y == 0) {
        //             x = this.portal[j].x+this.tileSize;
        //             y = this.portal[j].y;
        //         } else if (this.direction.x == -1 && this.direction.y == 0) {
        //             x = this.portal[j].x-this.tileSize;
        //             y = this.portal[j].y;
        //         } else if (this.direction.x == 0 && this.direction.y == -1) {
        //             x = this.portal[j].x;
        //             y = this.portal[j].y-this.tileSize;
        //         } else if (this.direction.x == 0 && this.direction.y == 1) {
        //             x = this.portal[j].x;
        //             y = this.portal[j].y+this.tileSize;
        //         }
        //     }
        // }

        for (let index = this.body.length-1; index>0; index--){
            this.body[index].x = this.body[index-1].x;
            this.body[index].y = this.body[index-1].y;
        }

        this.body[0].x = x;
        this.body[0].y = y;

        // Death by hitting the wall
        /*if(
            this.body[0].x < 0 || 
            this.body[0].x >= this.scene.game.config.width ||
            this.body[0].y < 0 || 
            this.body[0].y >= this.scene.game.config.height
        ){
            
            this.scene.scene.restart();
        }
        for (let j = 1; j < this.q; j++ ) {
            if(
                this.body[0].x == (this.scene.game.config.height/this.q)*j ||
                this.body[0].y == (this.scene.game.config.height/this.q)*j
            ){
                this.scene.scene.restart();
            }
        }*/

        // Death by eating itself
        let tail = this.body.slice(1);  // tail - headpos === any of tail positions

        // if any tailpos == headpos
        if(
            tail.some(
                quadrant => quadrant.x === this.body[0].x && 
                quadrant.y === this.body[0].y
                ) 
                // arr.some() method checks whether 
                // at least one of the elements of the array 
                // satisfies the condition checked by the argument method 
        ){
            this.scene.scene.restart();
        }
        
    }
}
