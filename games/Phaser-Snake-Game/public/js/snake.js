export default class Snake {
    constructor(scene){
        this.scene = scene;
        this.lastMoveTime = 0; // The last time we called move()
        this.moveInterval = 120;
        this.tileSize = 16;
        this.spawnZone = this.tileSize*4
        this.direction = Phaser.Math.Vector2.DOWN;
        this.body = []; // body will be a set of boxes

        //head of the snake
        this.body.push(this.scene.add.rectangle(
            this.scene.game.config.width -this.tileSize*4, 
            this.scene.game.config.height/2, 
            this.tileSize, 
            this.tileSize, 
            0xff0000
            ).setOrigin(0));
        // setOrigin will show the full square at 0,0

        this.apple = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0x00ff00).setOrigin(0) // apple asset
        this.wall = []; // define walls
        this.wall2 = [];
        this.portal = []; // define a array for portals

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
            this.map2 = mapArray();
        }
        // combine two random quadrant arrays for mappinng
        this.combinedMapping = this.map1.concat(this.map2);

        // call methods
        this.positionApple(); // drop first apple
        this.positionPortal(); // position portals
        this.positionWall(); // position walls
        
        // define keys
        scene.input.keyboard.on('keydown', e => {
            this.keydown(e);
        })
    }

    positionApple() {
        this.apple.x = Math.floor(
            (Math.random() * this.scene.game.config.width)/this.tileSize
            ) * this.tileSize;
        this.apple.y = Math.floor(
            (Math.random() * this.scene.game.config.height)/this.tileSize
            ) * this.tileSize;
        if (this.apple.x == this.scene.game.config.width/2 || this.apple.y == this.scene.game.config.width/2) {
            this.apple.x += this.tileSize;
        }
    }
    positionPortal(){
        console.log("*********************************");
        let c = 0;
        for (let i = 0; i < 8; i++) {
            if (this.combinedMapping[i] == 0) { // quadrant 0
                this.portal[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, this.color[c]).setOrigin(0)
                this.portal[i].x = Math.floor((Math.random() * ((this.scene.game.config.width/2 - this.spawnZone) - this.spawnZone) + this.spawnZone)/this.tileSize) * this.tileSize;
                this.portal[i].y = Math.floor((Math.random() * ((this.scene.game.config.height - this.spawnZone) - (this.scene.game.config.height/2+this.spawnZone)) + (this.scene.game.config.height/2+this.spawnZone))/this.tileSize) * this.tileSize;

            } else if (this.combinedMapping[i] == 1) { // quadrant 1
                this.portal[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, this.color[c]).setOrigin(0)
                this.portal[i].x = Math.floor((Math.random() * ((this.scene.game.config.width - this.spawnZone) - this.scene.game.config.width/2+this.spawnZone) + (this.scene.game.config.width/2+this.spawnZone))/this.tileSize) * this.tileSize;
                this.portal[i].y = Math.floor((Math.random() * ((this.scene.game.config.height - this.spawnZone) - this.scene.game.config.height/2+this.spawnZone) + (this.scene.game.config.height/2+this.spawnZone))/this.tileSize) * this.tileSize;

            } else if (this.combinedMapping[i] == 2) { // quadrant 2
                this.portal[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, this.color[c]).setOrigin(0)
                this.portal[i].x = Math.floor((Math.random() * ((this.scene.game.config.width/2 - this.spawnZone) - this.spawnZone) + this.spawnZone)/this.tileSize) * this.tileSize;
                this.portal[i].y = Math.floor((Math.random() * (this.scene.game.config.height/2 - this.spawnZone*2) + this.spawnZone)/this.tileSize) * this.tileSize;

            } else if (this.combinedMapping[i] == 3) { // quadrant 3
                this.portal[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, this.color[c]).setOrigin(0)
                this.portal[i].x = Math.floor((Math.random() * ((this.scene.game.config.width - this.spawnZone) - this.scene.game.config.width/2+this.spawnZone) + (this.scene.game.config.width/2+this.spawnZone))/this.tileSize) * this.tileSize;
                this.portal[i].y = Math.floor((Math.random() * ((this.scene.game.config.width/2 - this.spawnZone) - this.spawnZone) + this.spawnZone)/this.tileSize) * this.tileSize;

            }
            
            if (i % 2 > 0) {
                c++; // change color every even number
            }
            console.log(this.portal[i].x, this.portal[i].y);
        }
        console.log("*********************************");
        // let j = 0;
        // while ( j < this.portal.length) {

        // }
    }
  
    positionWall() {
       for (let i = 0; i < this.scene.game.config.height; i++) {
            this.wall[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0xffffff).setOrigin(0);
            this.wall[i].x = this.scene.game.config.height/2;
            this.wall[i].y = i;
            this.wall2[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0xffffff).setOrigin(0);
            this.wall2[i].x = i;
            this.wall2[i].y = this.scene.game.config.height/2;
        
        }
    }

    keydown(event) {
        // console.log(event);
        switch(event.keyCode){
            case 37:    //left
                if(this.direction !== Phaser.Math.Vector2.RIGHT)    
                    this.direction = Phaser.Math.Vector2.LEFT;
                break;
            case 38:    //up
                if(this.direction !== Phaser.Math.Vector2.DOWN)
                    this.direction = Phaser.Math.Vector2.UP;
                break;
            case 39:    //right
                if(this.direction !== Phaser.Math.Vector2.LEFT)
                    this.direction = Phaser.Math.Vector2.RIGHT;
                break;
            case 40:    //down
                if(this.direction !== Phaser.Math.Vector2.UP)
                    this.direction = Phaser.Math.Vector2.DOWN;
                break;
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
        }
    }

    move(){
        let x = this.body[0].x + this.direction.x * this.tileSize;
        let y = this.body[0].y + this.direction.y * this.tileSize;
       

        // if snakes eat the apple
        if(this.apple.x === x && this.apple.y === y){
            this.body.push(
                this.scene.add.
                rectangle(0, 0, this.tileSize, this.tileSize, 0xffffff)
                .setOrigin(0)
            );
            this.positionApple();

        }

        let j; // check even/odds
        for (let i = 0; i < 8; i++) {
            if (this.portal[i].x == x && this.portal[i].y == y) {
                let check = i % 2; // if portal # even = 0 | if portal # odd = 1
                if (check < 1) { // if even spawn to portal after it
                    j = i+1;
                } else {        // if odd spawn in portal behind it
                    j = i-1;
                }
                if (this.direction.x == 1 && this.direction.y == 0) {
                    x = this.portal[j].x+this.tileSize;
                    y = this.portal[j].y;
                } else if (this.direction.x == -1 && this.direction.y == 0) {
                    x = this.portal[j].x-this.tileSize;
                    y = this.portal[j].y;
                } else if (this.direction.x == 0 && this.direction.y == -1) {
                    x = this.portal[j].x;
                    y = this.portal[j].y-this.tileSize;
                } else if (this.direction.x == 0 && this.direction.y == 1) {
                    x = this.portal[j].x;
                    y = this.portal[j].y+this.tileSize;
                }
            }
        }

        for (let index = this.body.length-1; index>0; index--){
            this.body[index].x = this.body[index-1].x;
            this.body[index].y = this.body[index-1].y;
        }

        this.body[0].x = x;
        this.body[0].y = y;

        // Death by hitting the wall
        if(
            this.body[0].x < 0 || 
            this.body[0].x >= this.scene.game.config.width ||
            this.body[0].y < 0 || 
            this.body[0].y >= this.scene.game.config.height ||
            this.body[0].x == this.scene.game.config.width/2 ||
            this.body[0].y == this.scene.game.config.height/2 
        ){
            this.scene.scene.restart();
        }

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
