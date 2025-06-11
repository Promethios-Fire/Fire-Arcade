import { X_OFFSET, Y_OFFSET, 
    GRID, SPEED_WALK, SPEED_SPRINT, MODES, 
    GState, DIRS, commaInt, PLAYER_STATS, 
    INVENTORY, BOOST_ADD_FLOOR, COMBO_ADD_FLOOR } from "../SnakeHole.js";
import { Food } from "../classes/Food.js";
import { Snake } from "../classes/Snake.js";
import { PORTAL_COLORS, ITEMS } from '../const.js';




export var STAGE_OVERRIDES = new Map([
    ["World_4-4", { 
        // #region 4-4
        preFix: function (scene) {

        },
        postFix: function (scene) {

            var transTile = scene.wallLayer.findByIndex(11);
            transTile.index = -1;

            if (!INVENTORY.get("gearbox")) {
                scene.gearbox = scene.add.sprite(transTile.pixelX + X_OFFSET, transTile.pixelY + Y_OFFSET, 'coinPickup01Anim.png')
                .setOrigin(0, 0).setDepth(100).setTint(0xFfc0cb);

                scene.gearbox.play('coin01idle');

                scene.tweens.add( {
                    targets: scene.gearbox,
                    originY: [0.1875 - .0466,0.1875 + .0466],
                    ease: 'sine.inout',
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                });


                if (scene.interactLayer[(scene.gearbox.x - X_OFFSET)/GRID][(scene.gearbox.y - Y_OFFSET)/GRID] === "empty") {

                    scene.interactLayer[(scene.gearbox.x - X_OFFSET)/GRID][(scene.gearbox.y - Y_OFFSET)/GRID] = scene.gearbox;

                } else {
                    // Sanity debugger.
                    debugger
                }

                scene.gearbox.onOver = this.onOver;
            }
        },
        onOver: function () {
            INVENTORY.set("gearbox", true);
            localStorage.setItem("inventory", JSON.stringify(Object.fromEntries(INVENTORY)));

            this.interactLayer[(this.gearbox.x - X_OFFSET)/GRID][(this.gearbox.y - Y_OFFSET)/GRID] = "empty";
            
            this.gearbox.destroy();

            var spaceboy = this.scene.get("SpaceBoyScene");
            ITEMS.get("gearbox").addToInventory(spaceboy);

        }

    
    }],
    ["World_2-4", {
        // #region 2-4
        preFix: function (scene) {

        },
        postFix: function (scene) {

            var piggyTile = scene.wallLayer.findByIndex(11);
            piggyTile.index = -1;

            if (!INVENTORY.get("piggybank")) {
                scene.piggy = scene.add.sprite(piggyTile.pixelX + X_OFFSET, piggyTile.pixelY + Y_OFFSET, 'coinPickup01Anim.png')
                .setOrigin(0, 0).setDepth(100).setTint(0x800080);

                scene.piggy.play('coin01idle');

                scene.tweens.add( {
                    targets: scene.piggy,
                    originY: [0.1875 - .0466,0.1875 + .0466],
                    ease: 'sine.inout',
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                });


                if (scene.interactLayer[(scene.piggy.x - X_OFFSET)/GRID][(scene.piggy.y - Y_OFFSET)/GRID] === "empty") {

                    scene.interactLayer[(scene.piggy.x - X_OFFSET)/GRID][(scene.piggy.y - Y_OFFSET)/GRID] = scene.piggy;

                } else {
                    // Sanity debugger.
                    debugger
                }
            


                scene.piggy.onOver = function() {
                    INVENTORY.set("piggybank", true);
                    localStorage.setItem("inventory", JSON.stringify(Object.fromEntries(INVENTORY)));

                    scene.interactLayer[(scene.piggy.x - X_OFFSET)/GRID][(scene.piggy.y - Y_OFFSET)/GRID] = "empty";
                    
                    scene.piggy.destroy();

                    var spaceboy = scene.scene.get("SpaceBoyScene");
                    ITEMS.get("piggybank").addToInventory(spaceboy);
                }
            }
        }

    }],
    
    ["Bonus_X-1", {
        // #region Bonus
        preFix: function (scene) {
            debugger
            scene.lengthGoal = Infinity;
            scene.stopOnBonk = true;
            scene.tickCounter = 0;
        },
        postFix: function (scene) {

            // Override
            scene.onBonk = this.onBonk;
            scene.checkWinCon = this.checkWinCon;


        },
        onBonk: function () { // .this = GameScene
            var ourPersist = this.scene.get("PersistScene");
            this.coinsUIIcon.setVisible(false);
            ourPersist.coins = Math.max(ourPersist.coins -1, 1);

            if (ourPersist.coins != 1) {
                ourPersist.loseCoin();
            }
            this.coinUIText.setHTML(
            `${commaInt(ourPersist.coins).padStart(2, '0')}`
            );

            this.maxScore = Math.max(this.maxScore - 10, 1);

            debugger;

            this.snake.head;

            // Add check for stuck on self.  
        },
        afterEat: function (scene, food) {

            //if (scene.tickCounter >= 15) {

                var valid = scene.validSpawnLocations();
                var times = 2

                while (times > 0) {

                    var chords = Phaser.Math.RND.pick(valid);
                    var _x = (chords.x - X_OFFSET) / GRID;
                    var _y = (chords.y - Y_OFFSET) / GRID;
                    

                    var wall = scene.wallLayer.getTileAt(0, 0, true, scene.wallVarient);
                    var tile = scene.wallLayer.getTileAt(_x, _y, true, scene.wallVarient);
                    
                    tile.index = 5;
                    tile.properties.hasCollision = true;

                    times--;
                    
                }
                
                


                //scene.tickCounter = 0
                
            //}
            //scene.tickCounter++;
        },
        checkWinCon: function () {

            let head = this.snake.head;

            var above = {x:head.x , y: head.y - GRID};
            var down = {x:head.x , y: head.y + GRID};
            var left = {x:head.x - GRID , y: head.y};
            var right = {x:head.x + GRID , y: head.y};

            return [above, down, left, right].every( pos => {
                return this.snake.body.some( part => {
                    return pos.x === part.x && pos.y === part.y
                })
            });
             

        }
    }],
    ["Bonus_X-2", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            scene.stopOnBonk = true;
            //scene.maxScore = 60;
            scene.boostCost = 8;
            //scene.boostCost = 8;
            scene.boostAdd = 0;
            
            scene.speedSprint = 99;
            scene.speedWalk = 33;
        },
        postFix: function (scene) {

            scene.atoms.forEach( atom => {
                atom.scale = 2;
                atom.electrons.scale = 2;

                atom.move(scene);

            });
    
        },
        afterEat: function(scene, food) {
            // Grow 3 more times.
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            
        },
        afterMoveFood: function (scene, food) {

            debugger

            var foodX = (food.prevX - X_OFFSET) / GRID;
            var foodY = (food.prevY - Y_OFFSET) / GRID;

            scene.interactLayer[foodX + 1][foodY] = "empty";
            scene.interactLayer[foodX][foodY + 1] = "empty";
            scene.interactLayer[foodX + 1][foodY + 1] = "empty";

            var foodX = (food.x - X_OFFSET) / GRID;
            var foodY = (food.y - Y_OFFSET) / GRID;

            scene.interactLayer[foodX + 1][foodY] = food;
            scene.interactLayer[foodX][foodY + 1] = food;
            scene.interactLayer[foodX + 1][foodY + 1] = food;

        }
        /*afterMove: function (scene) {

            var onGridX = (scene.snake.head.x - X_OFFSET) / GRID;
            var onGridY = (scene.snake.head.y - Y_OFFSET) / GRID;
            //remove decimals to prevent erroring
            onGridX = Math.round(onGridX);
            onGridY = Math.round(onGridY);

            if (scene.gState === GState.PLAY) {

                if (typeof scene.interactLayer[Math.min(onGridX + 1, 29)][onGridY].onOver === 'function') {
                    scene.interactLayer[Math.min(onGridX + 1, 29)][onGridY].onOver(scene);
                }
                if (typeof scene.interactLayer[Math.min(onGridX + 1, 29)][Math.min(onGridY + 1, 27)].onOver === 'function') {
                    scene.interactLayer[Math.min(onGridX + 1, 29)][Math.min(onGridY + 1, 27)].onOver(scene);
                }
                if (typeof scene.interactLayer[onGridX][Math.min(onGridY + 1, 27)].onOver === 'function') {
                    scene.interactLayer[onGridX][Math.min(onGridY + 1, 27)].onOver(scene);
                }
            }


        */
        
    }],
    ["Bonus_X-3", {
        preFix: function (scene) {
            scene.lengthGoal = 221;
            //scene.maxScore = 60;
            //scene.boostCost = 0;
        },
        postFix: function (scene) {
            scene.atoms.forEach( atom => {
                atom.electrons.alpha = 0;
            });
        },
        afterEat: function (stage, food) {
            stage.atoms.delete(food);
            food.delayTimer.destroy();
            food.electrons.destroy();
            food.destroy();
        }
        
    }],
    ["Bonus_X-4", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            //scene.stopOnBonk = true;
            //scene.maxScore = 60;
            //scene.speedWalk = SPEED_SPRINT;
            //scene.speedSprint = SPEED_WALK;
            //scene.boostCost = 3;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;

            scene.atoms.forEach( atom => {
                atom.setTint(0xFFD700);
            })
    
        },
        afterEat: function (scene, food) {
            debugger
            // dounble grow
            scene.snake.grow(scene);
            scene.events.emit('addScore', food); 
        },
        checkWinCon: function () {
            return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < BOOST_ADD_FLOOR;
        
        },
        
        
    }],
    ["Bonus_X-5", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            scene.highScore = INVENTORY.get("comboTrainerXHS");
            scene.firstFood = false;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;

    
        },
        afterMove: function (scene) {
            if (scene.comboCounter > scene.highScore) {
                scene.highScore = scene.comboCounter;
                scene.scene.get("SpaceBoyScene").comboTrainerX_PB.setText(scene.highScore);

                INVENTORY.set("comboTrainerXHS", scene.comboCounter);
                localStorage.setItem("inventory", JSON.stringify(Object.fromEntries(INVENTORY)));
            }

            if (scene.comboCounter === 0 && scene.firstFood) {
                scene.snake.bonk(scene);
                scene.firstFood = false;
            }
        },
        afterBonk: function (scene) {
            var toRemove = scene.snake.body.splice(1, scene.snake.body.length -1);
            toRemove.forEach( bodyPart => {
                bodyPart.destroy();
            });

        },
        afterEat: function(scene) {
            if (scene.comboCounter > 0) {
                // Something is off with the combo counter. It doesn't start after the first combo.
                // This if statment shouldn't need be.
                scene.firstFood = true;
            }
            

        },
        checkWinCon: function () {
            return false;
            return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        },   
    }],
    ["Bonus_X-6", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            scene.bombTime = 40;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;

            scene.bombAtom = new Food(scene, Phaser.Math.RND.pick(scene.validSpawnLocations()));

            var pos = scene.bombAtom.getBottomRight();

            scene.bombAtom.timerText = scene.mapProgressPanelText = scene.add.bitmapText(pos.x, pos.y, 'mainFont', 
                Math.trunc(scene.bombTime / 10), 
                8).setOrigin(1,1).setDepth(100).setAlpha(1).setTintFill(0xFFFFFF);
            
            
            scene.bombAtom.setTint(0x000000);
    
        },
        afterEat: function (scene, food) {
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            scene.snake.grow(scene);

            var pos = scene.bombAtom.getBottomRight()

            scene.bombAtom.timerText.x = pos.x;
            scene.bombAtom.timerText.y = pos.y;

        },
        afterTick: function (scene) {
            var diff = scene.maxScore - scene.bombTime;
            var time = scene.scoreTimer.getRemainingSeconds().toFixed(1) * 10 ;

            scene.bombAtom.timerText.setText(
                Math.max(Math.trunc((time - diff - 1) / 10) + 1
                , 0)
            );

        },
        checkWinCon: function () {
            return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < this.maxScore - this.bombTime;
        
        }, 
    }],
    ["Bonus_X-7", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            //scene.stopOnBonk = true;
            //scene.maxScore = 60;
            //scene.speedWalk = SPEED_SPRINT;
            //scene.speedSprint = SPEED_WALK;
            //scene.boostCost = 3;
        },
        postFix: function (scene) {

            var times = 28;
            while (times > 0) {
                scene.snake.grow(scene);
                times--;
            }
            
            scene.checkWinCon = this.checkWinCon;
            scene.snake.grow = this.grow;
    
        },
        checkWinCon: function () {
            return this.length < 1;
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < 1;
        
        },
        grow: function (scene)
        {
            const ourSpaceBoy = scene.scene.get("SpaceBoyScene");
            scene.length -= 1;
            scene.globalFruitCount += 1; // Run Wide Counter
    
            var length = `${scene.length}`;
            
            //ourSpaceBoy.lengthGoalUI.setAlpha(1);
            ourSpaceBoy.lengthGoalUI.setText(`${length.padStart(2, "0")}`);
    
    
            /*
            if (scene.boostOutlinesBody.length > 1) {
                //newPart.setTint(0xFF00FF);
                // Make the new one
                var boostOutline = scene.add.sprite(
                    this.body[this.body.length - 2].x, 
                    this.body[this.body.length - 2].y
                ).setOrigin(.083333,.083333).setDepth(15);
                 
                boostOutline.play("snakeOutlineAnim");
                scene.boostOutlinesBody.unshift(boostOutline);
            }
            */
            
            if (this.body.length > 1) {
                this.tail = this.body.slice(-1);
                Math.random()

                var oldPart = this.body.splice(1,1);

                oldPart[0].destroy();
                
            } else {
                scene.winned = true;
            }
    
    
            if (this.body.length > 1){
                this.body[this.body.length -1].setTexture('snakeDefault',[4])
                
            }
            //this.body.push(newPart);
            scene.applyMask();
    
    
        },
        
    }],
    ["Bonus_X-8", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            scene.attackTimer = 12;
            scene.tickCounter = 0;
            scene.countDownTicker = scene.attackTimer * 10;
            scene.length = -12;
        },
        postFix: function (scene) {

            var times = 12;
            while (times > 0) {
                scene.snake.grow(scene);
                times--;
            }

            //scene.length = scene.length - 12;

            scene.attackerText = scene.add.bitmapText(0, 0, 'mainFont', 
                scene.attackTimer, 
                8).setOrigin(1,1).setDepth(100).setAlpha(1).setTintFill(0xFFFFFF);

            scene.snake.body[scene.snake.body.length -1].setTint(0xCC0000);
            

            scene.checkWinCon = this.checkWinCon;
        },
        checkWinCon: function () {
            return this.snake.body.length < 2;
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < 1;
        
        },
        afterTick: function (scene) {
            
            scene.tickCounter++;
            scene.countDownTicker--;

            if (scene.countDownTicker < 1) {
                scene.attackTimer--;
                scene.countDownTicker = scene.attackTimer * 10;
                
            }
            if (scene.tickCounter >= scene.attackTimer){

                if (scene.snake.body.length > 1) {
                    scene.snake.tail = scene.snake.body.slice(-1);

                    var oldPart = scene.snake.body.splice(scene.snake.body.length - 2,1);

                    oldPart[0].destroy();  
                }

                scene.attackerText.setText(scene.attackTimer);

                scene.tickCounter = 0;
            }    
        },
        afterEat: function (scene) {
            if (scene.snake.body.length > 1){
                scene.snake.body[scene.snake.body.length -1].setTexture('snakeDefault',[4]);
                scene.snake.body[scene.snake.body.length -1].setTint(0xCC0000);
                scene.snake.body[scene.snake.body.length -2].clearTint();
            }
        },
        afterMove: function (scene) {
            var tail = scene.snake.body[scene.snake.body.length -1].getBottomRight();

            scene.attackerText.x = tail.x;
            scene.attackerText.y = tail.y;

        },
        

        
    }],
    ["Bonus_X-9", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            scene.deathTimer = 10;
            scene.tickCounter = 0;
            scene.length = -50;
        },
        postFix: function (scene) {

            var times = 50;
            while (times > 0) {
                scene.snake.grow(scene);
                times--;
            }

            scene.snake.body[scene.snake.body.length -1].setTint(0x000000);
            scene.snake.body[scene.snake.body.length -1].setDepth(45);

            scene.attackerText = scene.add.bitmapText(
                scene.startCoords.x + GRID - 1, 
                scene.startCoords.y + GRID - 1, 
                'mainFont', 
                scene.deathTimer, 
                8
            ).setOrigin(1,1).setDepth(50).setAlpha(1).setTintFill(0xFFFFFF);

            scene.checkWinCon = this.checkWinCon;
            scene.snake.grow = this.grow;
        },
        checkWinCon: function () {
            return this.snake.body.length < 2;
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < 1;
        
        },
        afterTick: function (scene) {
            
            scene.tickCounter++;
            if (scene.tickCounter >= scene.deathTimer){

                if (scene.snake.body.length > 1) {
                    scene.snake.tail = scene.snake.body.slice(-1);

                    var oldPart = scene.snake.body.splice(scene.snake.body.length - 2,1);

                    oldPart[0].destroy();  
                }
                scene.tickCounter = 0;
            }
            scene.attackerText.setText(scene.deathTimer - scene.tickCounter);    
        },
        afterEat: function (scene) {
            if (scene.snake.body.length > 1){
                scene.snake.body[scene.snake.body.length -1].setTexture('snakeDefault',[1]);
                scene.snake.body[scene.snake.body.length -1].setTint(0x000000);
                scene.snake.body[scene.snake.body.length -2].clearTint();

                scene.snake.body[scene.snake.body.length -1].setDepth(45);
                scene.snake.body[scene.snake.body.length -2].setDepth(40);
                
            }
        },
        afterMove: function (scene) {
            
            var tail = scene.snake.body[scene.snake.body.length -1].getBottomRight();

            if (isNaN(tail.x) || isNaN(tail.y)) {
                scene.attackerText.x = scene.startCoords.x + GRID;
                scene.attackerText.y = scene.startCoords.y + GRID;  
            } else {
                scene.attackerText.x = tail.x;
                scene.attackerText.y = tail.y;    
            }


        },
        grow: function (scene)
        {
            const ourSpaceBoy = scene.scene.get("SpaceBoyScene");
            scene.length += 1;
            scene.globalFruitCount += 1; // Run Wide Counter

            var length = `${scene.length}`;

            ourSpaceBoy.lengthGoalUI.setText(`${length.padStart(2, "0")}`);
            
            this.tail = this.body.slice(-1);
        
            scene.applyMask()
        },
        

        
    }],
    ["Bonus_X-10", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            scene.collideSelf = false;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;
    
        },
        afterEat: function (scene) {

        },
        checkWinCon: function () {
            return false;
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        },   
    }],
    ["Bonus_X-11", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            //scene.collideSelf = false;
            //scene.stopOnBonk = true;
            //scene.maxScore = 60;
            //scene.speedWalk = SPEED_SPRINT;
            //scene.speedSprint = SPEED_WALK;
            //scene.boostCost = 3;
        },
        postFix: function (scene) {
            debugger

            scene.evilSnake = new Snake(scene, scene.startCoords.x, scene.startCoords.y - GRID);
            scene.evilSnake.head.setTint(0x66666);
            scene.evilSnake.head.alpha = 1;
            scene.checkWinCon = this.checkWinCon;
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {
            debugger

            let xN;
            let yN;

            debugger
            
            switch (scene.snake.direction) {
                case DIRS.RIGHT:
                    yN = scene.evilSnake.head.y;
                    xN = Phaser.Math.Wrap(scene.evilSnake.head.x  - GRID, X_OFFSET, X_OFFSET + 29 * GRID);

                    break;
    
                case DIRS.LEFT:
                    yN = scene.evilSnake.head.y;
                    xN = Phaser.Math.Wrap(scene.evilSnake.head.x + GRID, X_OFFSET, X_OFFSET + 29 * GRID);

                    break;
    
                case DIRS.DOWN:
                    xN = scene.evilSnake.head.x;
                    yN = Phaser.Math.Wrap(scene.evilSnake.head.y - GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);

                    break;
    
                case DIRS.UP:
                    xN = scene.evilSnake.head.x;
                    yN = Phaser.Math.Wrap(scene.evilSnake.head.y + GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);
                    break;
                    
                default:
                    debugger;
                    break;
            }
            //scene.evilSnake.head.x = xN;
            //scene.evilSnake.head.y = yN;

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, xN, yN, scene.evilSnake.tail);
            
        },
        checkWinCon: function () {
            return false;
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        },
    }],
    ["Bonus_X-12", {
        preFix: function (scene) {
            scene.lengthGoal = Infinity;
            //scene.collideSelf = false;
            //scene.stopOnBonk = true;
            //scene.maxScore = 60;
            //scene.speedWalk = SPEED_SPRINT;
            //scene.speedSprint = SPEED_WALK;
            //scene.boostCost = 3;
            scene.laserWallX = -1;
            scene.tickCount = 1;
            scene.wallMovedCount = 0;
            scene.wallSpeed = 1;
            scene.deathWalls = [];
        },
        postFix: function (scene) {
            scene.snake.grow(scene);
        
            scene.moveWall = this.moveWall;
        },
        afterTick: function (scene) {
            scene.tickCount++;

            if (scene.tickCount > scene.wallSpeed) {
                scene.moveWall();

                scene.wallMovedCount++;
                console.log("Wall will move every", scene.wallSpeed,"Wall move count = ",  scene.wallMovedCount);
                scene.tickCount = 0;
            }

            if (scene.wallMovedCount > 10) {
                scene.wallSpeed = Math.min(scene.wallSpeed - 1, 1);
            }
        },
        afterMove: function(scene) {
            scene.deathWalls.forEach( wall => {
                if (wall.pixelX + X_OFFSET === scene.snake.head.x && wall.pixelY + Y_OFFSET === scene.snake.head.y) {
                    //var middle = Math.ceil(scene.snake.body.length / 2);
                    debugger
                    
                }
            });
            
        },
        checkWinCon: function () {
            return scene.snake.body.length < 2;
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        },
        moveWall: function () {

            this.laserWallX = Phaser.Math.Wrap(this.laserWallX + 1, 0, 28);
            var y = 0;
            this.deathWalls = [];

            while (y < 27) {

                var prevTile = this.wallLayer.getTileAt(Phaser.Math.Wrap(this.laserWallX - 1, 0, 28), y, true, this.wallVarient);
                
                prevTile.index = -1;
                prevTile.properties.hasCollision = false;
                
                var tile = this.wallLayer.getTileAt(this.laserWallX, y, true, this.wallVarient);
                
                tile.index = 577;
                tile.properties.hasCollision = false;

                this.deathWalls.push(tile);
            
                y++ ;
            }

        }      
    }],
    // #endregion Bonus
    ["Tutorial_T-1", {
        // #region T-1
        preFix: function (scene) {
            
            scene.mode = MODES.TUTORIAL;
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99

        },
        postFix: function (scene) {
            
            // Override checkWinCon()
            scene.checkWinCon = function(){
                if (scene.length >= 7 && !scene.winned) {
                    
                    scene.winned = true;
                    scene.gState = GState.TRANSITION;
                    scene.snake.direction = DIRS.STOP;

                    var vTween = scene.vortexIn(scene.snake.body, scene.snake.head.x, scene.snake.head.y);

                    var timeDelay = vTween.totalDuration;

                    scene.time.delayedCall(timeDelay + 75, () => {

                        scene.gameSceneFullCleanup();

                        scene.scene.start('TutorialScene', {
                            cards: ["walls","screenwrap"],
                            toStage: "Tutorial_T-2",
                        });
                    });

                    /* This also works
                    vTween.on("complete", () => {
                        scene.scene.start('TutorialScene', {
                            cards: ["move","atoms"],
                            toStage: "Tutorial_2",
                        });
                    });
                    */
                    
                    // Scene Clean Up needed?
    
                } else {
                    return false;
                }
            }
        }

    }],
    ["Tutorial_T-2", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;


        },
        postFix: function (scene) {


            let counter = 7;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }


            scene.checkWinCon = function(){
                if (scene.length >= 14) {
                    scene.gameSceneFullCleanup();
                    
                    scene.scene.start('TutorialScene', {
                        cards: ["portals"],
                        toStage: "Tutorial_T-3",
                    });
    
                } else {
                    return false;
                }
            }

        }
    }],
    ["Tutorial_T-3", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;

        },
        postFix: function (scene) {

            let counter = 14;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }

            scene.checkWinCon = function(){
                if (scene.length >= 21) {

                    scene.gameSceneFullCleanup();
                    
                    scene.scene.start('TutorialScene', {
                        cards: ["coins"],
                        toStage: "Tutorial_T-4",
                    });
    
                } else {
                    return false;
                }
            }

        }
    }],
    ["Tutorial_T-4", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.scene.get('PersistScene').coins = 20

        },
        postFix: function (scene) {

            let counter = 21;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }

            scene.checkWinCon = function(){
                if (scene.length >= 28) { //28

                    scene.winned = true;
                    scene.gState = GState.TRANSITION;
                    scene.snake.direction = DIRS.STOP;

                    scene.gameSceneFullCleanup();
                    
                    scene.scene.start('TutorialScene', {
                        cards: ["blackholes"],
                        toStage: "Tutorial_T-5",
                    });
    
                } else {
                    return false;
                }
            }

        }
    }],
    ["Tutorial_T-5", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            //scene.scene.get('PersistScene').coins = 20
            //scene.skipScoreScreen = true;

        },
        postFix: function (scene) {

            let counter = 28; //28
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }

            scene.winned = true;


            scene.events.emit('spawnBlackholes', scene.snake.direction);

            //this.events.emit('spawnBlackholes', ourGame.snake.direction);

            scene.checkWinCon = function() { // Returns Bool
                if (scene.lengthGoal > 0) { // Placeholder check for bonus level.
                    return scene.length >= scene.lengthGoal + 1; // Should never reach here.
                }
                
            }
        }
    }],

    ["Tutorial_T-6", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            //scene.scene.get('PersistScene').coins = 20
            //scene.skipScoreScreen = true;

            //window.location.reload();

            //temporary solution for resetting the game -- doesn't preserve object permanence
            window.location.reload();

        },
        postFix: function (scene) {
            scene.gameSceneFullCleanup();
            scene.scene.start('MainMenuScene');
        }
    }],

    ["World_0-1", {
        preFix: function (scene) {
            //scene.lengthGoal = 0;
            //scene.stopOnBonk = true;
            //scene.maxScore = 60;
            //scene.speedWalk = SPEED_SPRINT;
            
            //scene.boostCost = 3;


            // Slow Boost Number
            //scene.speedSprint = 147;
        },
        postFix: function (scene) {
    
        },
        
    }],
    ["World_4-1", {
        preFix: function (scene) {
            scene.startEWraps = PLAYER_STATS.eWraps;
            scene.startWWraps = PLAYER_STATS.wWraps;
            scene.delta = 0;
            scene.deltaCache = 0;

            scene.secretPortal = undefined;
            //scene.lengthGoal = 0;
            //scene.stopOnBonk = true;
            //scene.maxScore = 60;
            //scene.speedWalk = SPEED_SPRINT;
            //scene.speedSprint = 147;
            //scene.boostCost = 3;
        },
        postFix: function (scene) {

        },
        afterMove: function (scene) {
            var currentEWraps = PLAYER_STATS.eWraps - scene.startEWraps;
            var currentWWraps = PLAYER_STATS.wWraps - scene.startWWraps;

            scene.delta = currentWWraps - currentEWraps;
            if (scene.delta < 1) {
                scene.delta = 0;
            } 

            if (scene.wallVarient === "Wall_2" && scene.delta != scene.deltaCache) {

                var tile = scene.wallLayer.getTileAt(16, 12);


                if (scene.delta > 4 && scene.secretPortal === undefined) {
                    scene.secretPortal = scene.add.sprite(tile.pixelX + X_OFFSET + GRID * 3.5, tile.pixelY + Y_OFFSET + GRID * 0.5);
                    scene.secretPortal.play('blackholeForm');
                    console.log("SPAWNING SECRET BLACKHOLE", scene.delta);

                    scene.secretPortal.onOver = function() {
                        console.log("Something Secret!");
                    } 
                    scene.interactLayer[tile.x + 3][tile.y] = scene.secretPortal;
                }
                // add in code here to tint based on the delta size.
                tile.tint = 0xFF0000;
                scene.deltaCache = scene.delta;
            }

            
        }
        
    }],
]);

STAGE_OVERRIDES.set("Bonus_X-13", {
    X_13: null,
    preFix: function (scene) {
        scene.lengthGoal = Infinity;
        scene.stopOnBonk = true;
        scene.highScore = INVENTORY.get("comboTrainerHS");
    },
    postFix: function (scene) {
        scene.checkWinCon = this.checkWinCon;
        scene.snake.grow(scene);
        scene.snake.grow(scene);
        scene.snake.grow(scene);

        scene.comboText = scene.add.bitmapText(0, 0, 'mainFont', 
            scene.comboCounter, 
            8).setOrigin(0.5,0.5).setDepth(100).setAlpha(1).setTintFill(0xFFFFFF);

    },
    afterMove: function (scene) {
        if (scene.comboCounter === 0) {
                    if (scene.snake.body.length > 3) {
                scene.snake.tail = scene.snake.body.slice(-1);
                var oldPart = scene.snake.body.splice(scene.snake.body.length - 2,1);

                oldPart[0].destroy();  
            }
        }


        if (scene.comboCounter > scene.highScore) {
            scene.highScore = scene.comboCounter;
            scene.scene.get("SpaceBoyScene").comboTrainertPB.setText(scene.highScore);

            INVENTORY.set("comboTrainerHS", scene.comboCounter);
            localStorage.setItem("inventory", JSON.stringify(Object.fromEntries(INVENTORY)));
        }
        //debugger

        var head = scene.snake.body[1].getCenter();

        scene.comboText.x = head.x;
        scene.comboText.y = head.y;
        scene.comboText.setText(scene.comboCounter);

    },
    checkWinCon: function () {
        return false;
    }, 
});