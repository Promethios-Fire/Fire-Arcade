import { X_OFFSET, Y_OFFSET, 
    GRID, MODES, 
    GState, DIRS, commaInt, PLAYER_STATS, 
    INVENTORY_ITEMS,INVENTORY_DATA,
    BOOST_ADD_FLOOR, COMBO_ADD_FLOOR, 
    SPACE_BOY, PERSISTS } from "../SnakeHole.js";
import { Food } from "../classes/Food.js";
import { Snake } from "../classes/Snake.js";
import { PORTAL_COLORS} from '../const.js';

import { ITEMS } from "./items.js";

export const STAGE_OVERRIDES = new Map();

/*
STAGE_OVERRIDES.set("tmp", {
    tmp: null,
    methods: {
        preFix: function (scene) {
        },
        postFix: function (scene) {
        },
    }
});
*/

STAGE_OVERRIDES.set("World_4-4", {
    4_4: null,
    methods: {
        preFix: function (scene) {
        },
        postFix: function (scene) {

            var transTile = scene.wallLayer.findByIndex(11);
            transTile.index = -1;

            if (!INVENTORY_ITEMS.get("gearbox")) {
                scene.gearbox = scene.add.sprite(transTile.pixelX + X_OFFSET, transTile.pixelY + Y_OFFSET, 'inventoryIcons',26)
                .setOrigin(0, 0).setDepth(100);

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
            INVENTORY_ITEMS.set("gearbox", true);
            localStorage.setItem("inventory-items", JSON.stringify(Object.fromEntries(INVENTORY_ITEMS)));

            this.interactLayer[(this.gearbox.x - X_OFFSET)/GRID][(this.gearbox.y - Y_OFFSET)/GRID] = "empty";
            
            this.gearbox.destroy();

            var spaceboy = this.scene.get("SpaceBoyScene");
            ITEMS.get("gearbox").addToInventory(spaceboy);

        }
    }
});

STAGE_OVERRIDES.set("World_2-4", {
    2_4: null,
    methods: {
        preFix: function (scene) {

        },
        postFix: function (scene) {

            var piggyTile = scene.wallLayer.findByIndex(11);
            piggyTile.index = -1;

            if (!INVENTORY_ITEMS.get("piggybank")) {
                scene.piggy = scene.add.sprite(piggyTile.pixelX + X_OFFSET, piggyTile.pixelY + Y_OFFSET, 'inventoryIcons',3)
                    .setOrigin(0, 0).setDepth(100);

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
                    INVENTORY_ITEMS.set("piggybank", true);
                    localStorage.setItem("inventor-items", JSON.stringify(Object.fromEntries(INVENTORY_ITEMS)));

                    scene.interactLayer[(scene.piggy.x - X_OFFSET)/GRID][(scene.piggy.y - Y_OFFSET)/GRID] = "empty";
                    
                    scene.piggy.destroy();

                    var spaceboy = scene.scene.get("SpaceBoyScene");
                    ITEMS.get("piggybank").addToInventory(spaceboy);
                }
            }
        }
    }
});

STAGE_OVERRIDES.set("Bonus_X-1", {
    X_1: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
            scene.gameSettings.stopOnBonk = true;
            scene.gameSettings.tickCounter = 0;
        },
        postFix: function (scene) {
            // Override

            scene.oldBonk = scene.onBonk;
            scene.onBonk = this.onBonk;
            scene.checkWinCon = this.checkWinCon;

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

            this.gameSettings.maxScore = Math.max(this.gameSettings.maxScore - 10, 1);

            debugger;

            this.snake.head;

            // Add check for stuck on self.  
        },
        checkWinCon: function () {

            let head = this.snake.head;

            var above = {x:head.x , y: head.y - GRID};
            var down = {x:head.x , y: head.y + GRID};
            var left = {x:head.x - GRID , y: head.y};
            var right = {x:head.x + GRID , y: head.y};

            var check = [above, down, left, right].every( pos => {
                return this.snake.body.some( part => {
                    return pos.x === part.x && pos.y === part.y
                })
            });

            if (check) {
                this.bonk = this.oldBonk; // This needs to be verified it works.
                this.events.emit('win');
            }
             

        }
    }
});

STAGE_OVERRIDES.set("Bonus_X-2", {
    X_2: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
            scene.gameSettings.stopOnBonk = true;
        
            scene.gameSettings.boostCost = 8;
            scene.gameSettings.boostAdd = 0;
            
            scene.gameSettings.speedSprint = 99;
            scene.gameSettings.speedWalk = 33;
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
    }
});

STAGE_OVERRIDES.set("Bonus_X-3", {
    X_3: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = 221;
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
    }
});

STAGE_OVERRIDES.set("Bonus_X-4", {
    X_4: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;

            scene.atoms.forEach( atom => {
                atom.setTint(0xFFD700);
            })
        },
        afterEat: function (scene, food) {
            scene.snake.grow(scene);
            scene.events.emit('addScore', food); 
        },
        checkWinCon: function () {
            if (this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < BOOST_ADD_FLOOR) {
                this.events.emit('win');
            }
        
        },
    }
});

STAGE_OVERRIDES.set("Bonus_X-5", {
    X_5: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
            scene.gameSettings.highScore = INVENTORY_DATA.get("comboTrainerXPB");
            scene.gameSettings.firstFood = false;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;
        },
        afterMove: function (scene) {
            if (scene.snake.comboCounter > scene.gameSettings.highScore) {
                scene.gameSettings.highScore = scene.snake.comboCounter;
                scene.scene.get("SpaceBoyScene").comboTrainerX_PB.setText(scene.gameSettings.highScore);

                INVENTORY_DATA.set("comboTrainerXPB", scene.snake.comboCounter);
                localStorage.setItem("inventory-data", JSON.stringify(Object.fromEntries(INVENTORY_DATA)));
            }

            if (scene.snake.comboCounter === 0 && scene.gameSettings.firstFood) {
                scene.snake.bonk(scene);
                scene.gameSettings.firstFood = false;
            }
        },
        afterBonk: function (scene) {
            var toRemove = scene.snake.body.splice(1, scene.snake.body.length -1);
            toRemove.forEach( bodyPart => {
                bodyPart.destroy();
            });
        },
        afterEat: function(scene) {
            if (scene.snake.comboCounter > 0) {
                // Something is off with the combo counter. It doesn't start after the first combo.
                // This if statment shouldn't need be.
                scene.gameSettings.firstFood = true;
            }
        },
        checkWinCon: function () {
            return false;
            return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        },   
    }
});

STAGE_OVERRIDES.set("Bonus_X-6", {
    X_6: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
            scene.gameSettings.bombTime = 40;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;

            scene.bombAtom = new Food(scene, Phaser.Math.RND.pick(scene.validSpawnLocations())); //CODESMELL

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
            var diff = scene.gameSettings.maxScore - scene.gameSettings.bombTime;
            var time = scene.scoreTimer.getRemainingSeconds().toFixed(1) * 10 ;

            scene.bombAtom.timerText.setText(
                Math.max(Math.trunc((time - diff - 1) / 10) + 1
                , 0)
            );
        },
        checkWinCon: function () {
            if (this.currentScoreTimer() < this.gameSettings.maxScore - this.gameSettings.bombTime) {
                this.events.emit('win');  
            }
            return ;
        }, 
    }
});

STAGE_OVERRIDES.set("Bonus_X-7", {
    X_7: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
        },
        postFix: function (scene) {

            var times = 28;
            while (times > 0) {
                scene.snake.grow(scene);
                times--;
            }
            
            scene.checkWinCon = this.checkWinCon;

            scene.oldGrow = this.snake.grow;
            scene.snake.grow = this.grow;
            scene.snake.grow = this.oldGrow;
    
        },
        checkWinCon: function () {
            if (this.length < 1) {
                this.events.emit('win');
            }
            return ;
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
                scene.snake.grow = this.oldGrow;
                scene.winned = true;
            }
    
    
            if (this.body.length > 1){
                this.body[this.body.length -1].setTexture('snakeDefault',[4])
                
            }
            //this.body.push(newPart);
            scene.applyMask();
    
    
        },
    }
});

STAGE_OVERRIDES.set("Bonus_X-8", {
    X_8: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
            scene.gameSettings.attackTimer = 12;
            scene.gameSettings.tickCounter = 0;
            scene.gameSettings.countDownTicker = scene.gameSettings.attackTimer * 10;
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
                scene.gameSettings.attackTimer, 
                8).setOrigin(1,1).setDepth(100).setAlpha(1).setTintFill(0xFFFFFF);

            scene.snake.body[scene.snake.body.length -1].setTint(0xCC0000);
            

            scene.checkWinCon = this.checkWinCon;
        },
        checkWinCon: function () {
            if (this.snake.body.length < 2) {
                this.events.emit('win');
            }
            return
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < 1;
        
        },
        afterTick: function (scene) {
            
            scene.gameSettings.tickCounter++;
            scene.gameSettings.countDownTicker--;

            if (scene.gameSettings.countDownTicker < 1) {
                scene.gameSettings.attackTimer--;
                scene.gameSettings.countDownTicker = scene.gameSettings.attackTimer * 10;
                
            }
            if (scene.gameSettings.tickCounter >= scene.gameSettings.attackTimer){

                if (scene.snake.body.length > 1) {
                    scene.snake.tail = scene.snake.body.slice(-1);

                    var oldPart = scene.snake.body.splice(scene.snake.body.length - 2,1);

                    oldPart[0].destroy();  
                }

                scene.attackerText.setText(scene.gameSettings.attackTimer);

                scene.gameSettings.tickCounter = 0;
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
    }
});

STAGE_OVERRIDES.set("Bonus_X-9", {
    X_9: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
            scene.gameSettings.deathTimer = 10;
            scene.gameSettings.tickCounter = 0;
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
                scene.gameSettings.deathTimer, 
                8
            ).setOrigin(1,1).setDepth(50).setAlpha(1).setTintFill(0xFFFFFF);

            scene.checkWinCon = this.checkWinCon;
            scene.oldGrow = this.snake.grow;
            scene.snake.grow = this.grow;
        },
        checkWinCon: function () {
            if (this.snake.body.length < 2) {
                scene.snake.grow = this.oldGrow;
                this.events.emit('win');
            }
            return 
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < 1;
        
        },
        afterTick: function (scene) {
            
            scene.gameSettings.tickCounter++;
            if (scene.gameSettings.tickCounter >= scene.gameSettings.deathTimer){

                if (scene.snake.body.length > 1) {
                    scene.snake.tail = scene.snake.body.slice(-1);

                    var oldPart = scene.snake.body.splice(scene.snake.body.length - 2,1);

                    oldPart[0].destroy();  
                }
                scene.gameSettings.tickCounter = 0;
            }
            scene.attackerText.setText(scene.gameSettings.deathTimer - scene.gameSettings.tickCounter);    
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
    }
});

STAGE_OVERRIDES.set("Bonus_X-10", {
    X_10: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
            scene.gameSettings.collideSelf = false;
            return true
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;
        },
        checkWinCon: function () {
            return false;
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        }, 
    }
});

STAGE_OVERRIDES.set("Bonus_X-11", {
    X_11: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
        },
        postFix: function (scene) {

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

            let xN;
            let yN;

            
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
    }
});

STAGE_OVERRIDES.set("Bonus_X-12", {
    X_12: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
            scene.gameSettings.laserWallX = -1;
            scene.gameSettings.tickCount = 1;
            scene.gameSettings.wallMovedCount = 0;
            scene.gameSettings.wallSpeed = 1;
            scene.gameSettings.deathWalls = [];
        },
        postFix: function (scene) {
            scene.snake.grow(scene);
        
            scene.moveWall = this.moveWall;
        },
        afterTick: function (scene) {
            scene.gameSettings.tickCount++;

            if (scene.gameSettings.tickCount > scene.gameSettings.wallSpeed) {
                scene.moveWall();

                scene.gameSettings.wallMovedCount++;
                console.log("Wall will move every", scene.gameSettings.wallSpeed,"Wall move count = ",  scene.gameSettings.wallMovedCount);
                scene.gameSettings.tickCount = 0;
            }

            if (scene.gameSettings.wallMovedCount > 10) {
                scene.gameSettings.wallSpeed = Math.min(scene.gameSettings.wallSpeed - 1, 1);
            }
        },
        afterMove: function(scene) {
            scene.gameSettings.deathWalls.forEach( wall => {
                if (wall.pixelX + X_OFFSET === scene.snake.head.x && wall.pixelY + Y_OFFSET === scene.snake.head.y) {
                    //var middle = Math.ceil(scene.snake.body.length / 2);
                    debugger
                    
                }
            });
            
        },
        checkWinCon: function () {
            if (scene.snake.body.length < 2) {
                this.moveWall = undefined;
                this.events.emit("win");
            }
            return
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        },
        moveWall: function () {

            this.gameSettings.laserWallX = Phaser.Math.Wrap(this.gameSettings.laserWallX + 1, 0, 28);
            var y = 0;
            this.gameSettings.deathWalls = [];

            while (y < 27) {

                var prevTile = this.wallLayer.getTileAt(Phaser.Math.Wrap(this.gameSettings.laserWallX - 1, 0, 28), y, true, this.wallVarient);
                
                prevTile.index = -1;
                prevTile.properties.hasCollision = false;
                
                var tile = this.wallLayer.getTileAt(this.gameSettings.laserWallX, y, true, this.wallVarient);
                
                tile.index = 577;
                tile.properties.hasCollision = false;

                this.gameSettings.deathWalls.push(tile);
            
                y++ ;
            }

        } 
    }
});

STAGE_OVERRIDES.set("Tutorial_T-1", {
    T_1: null,
    methods: {
        preFix: function (scene) {
            
            scene.mode = MODES.TUTORIAL;
            scene.gameSettings.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99

        },
        postFix: function (scene) {
            
            // Override checkWinCon()
            scene.checkWinCon = this.checkWinCon;        
        },
        checkWinCon: function () {
            if (this.length >= 7) {
                    
                this.winned = true;
                this.gState = GState.TRANSITION;
                this.snake.direction = DIRS.STOP;

                var vTween = this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y);

                vTween.on("complete", () => {
                    this.time.delayedCall(200, () => {
                        debugger

                        this.gameSceneFullCleanup();

                        this.scene.start('TutorialScene', {
                            cards: ["walls","screenwrap"],
                            toStage: "Tutorial_T-2",
                        });
                    });

                });
            }
        }  
    }
});

STAGE_OVERRIDES.set("Tutorial_T-2", {
    T_2: null,
    methods: {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.gameSettings.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;

        },
        postFix: function (scene) {
            
            let counter = 7;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }

            scene.checkWinCon = this.checkWinCon;        
        },
        checkWinCon: function () {
            if (this.length >= 14) {
                    
                this.winned = true;
                this.gState = GState.TRANSITION;
                this.snake.direction = DIRS.STOP;

                var vTween = this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y);

                vTween.on("complete", () => {
                    this.time.delayedCall(200, () => {

                        this.gameSceneFullCleanup();

                        this.scene.start('TutorialScene', {
                            cards: ["portals"],
                            toStage: "Tutorial_T-3",
                        });
                    });

                });
            }
        } 
    }
});

STAGE_OVERRIDES.set("Tutorial_T-3", {
    T_3: null,
    methods: {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.gameSettings.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;

        },
        postFix: function (scene) {

            let counter = 14;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }
        
            scene.checkWinCon = this.checkWinCon;        
        },
        checkWinCon: function () {
            if (this.length >= 21) {
                    
                this.winned = true;
                this.gState = GState.TRANSITION;
                this.snake.direction = DIRS.STOP;

                var vTween = this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y);

                vTween.on("complete", () => {
                    this.time.delayedCall(200, () => {

                        this.gameSceneFullCleanup();

                        this.scene.start('TutorialScene', {
                            cards: ["coins"],
                            toStage: "Tutorial_T-4",
                        });
                    });

                });
            }
        } 
    }
});

STAGE_OVERRIDES.set("Tutorial_T-4", {
    T_4: null,
    methods: {
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
            
            // Override checkWinCon()
            scene.checkWinCon = this.checkWinCon;        
        },
        checkWinCon: function () {
            if (this.length >= 28) {
                    
                this.winned = true;
                this.gState = GState.TRANSITION;
                this.snake.direction = DIRS.STOP;

                var vTween = this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y);

                vTween.on("complete", () => {
                    this.time.delayedCall(200, () => {

                        debugger
                        this.gameSceneFullCleanup();

                        this.scene.start('TutorialScene', {
                            cards: ["blackholes"],
                            toStage: "Tutorial_T-5",
                        });
                    }, this);

                });
            }
        } 
    }
});

STAGE_OVERRIDES.set("Tutorial_T-5", {
    T_5: null,
    methods: {
        preFix: function (scene) {
            scene.mode = MODES.TUTORIAL;
        },
        postFix: function (scene) {

            scene.winned = true;
            scene.events.emit('spawnBlackholes', scene.snake.direction);

            let counter = 28; //28
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }
 
        },
    }
});

STAGE_OVERRIDES.set("Tutorial_T-6", {
    T_6: null,
    methods: {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            //scene.scene.get('PersistScene').coins = 20

            //window.location.reload();

            //temporary solution for resetting the game -- doesn't preserve object permanence
            //window.location.reload();

        },
        postFix: function (scene) {
            scene.gameSceneFullCleanup();
            scene.scene.start('MainMenuScene');
        }
    }
});

STAGE_OVERRIDES.set("World_4-1", {
    4_1: null,
    methods: {
        preFix: function (scene) {
            scene.startEWraps = PLAYER_STATS.eWraps;
            scene.startWWraps = PLAYER_STATS.wWraps;
            scene.gameSettings.delta = 0;
            scene.gameSettings.deltaCache = 0;

            scene.secretPortal = undefined;

        },
        postFix: function (scene) {
        },
        afterMove: function (scene) {
            var currentEWraps = PLAYER_STATS.eWraps - scene.startEWraps;
            var currentWWraps = PLAYER_STATS.wWraps - scene.startWWraps;

            scene.gameSettings.delta = currentWWraps - currentEWraps;
            if (scene.gameSettings.delta < 1) {
                scene.gameSettings.delta = 0;
            } 

            if (scene.wallVarient === "Wall_2" && scene.gameSettings.delta != scene.gameSettings.deltaCache) {

                var tile = scene.wallLayer.getTileAt(16, 12);


                if (scene.gameSettings.delta > 4 && scene.secretPortal === undefined) {
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
                scene.gameSettings.deltaCache = scene.gameSettings.delta;
            }
  
        }
    }
});

STAGE_OVERRIDES.set("World_0-1", {
    zero_1: null,
    methods: {
        preFix: function (scene) {
        },
        postFix: function (scene) {
            if (scene.mode === MODES.CLASSIC && INVENTORY_DATA.get("classicCardBank") > 0) {
                var coinTime = 250;

                scene.time.delayedCall(1250, () => {
                    for (let index = 1; index <= INVENTORY_DATA.get("classicCardBank"); index++) {
                        scene.time.delayedCall(coinTime * index, () => {
                            PERSISTS.coins += 1;
                            console.log('adding classicCardCoin +1');
                            scene.coinSound.play();
                            scene.coinUIText.setHTML(`${commaInt(PERSISTS.coins).padStart(2, '0')}`);

                            INVENTORY_DATA.set("classicCardBank", INVENTORY_DATA.get("classicCardBank") - 1);
                            localStorage.setItem("inventory-data", JSON.stringify(Object.fromEntries(INVENTORY_DATA)));

                            SPACE_BOY.invItems.get("classicCard").invText.setText(INVENTORY_DATA.get("classicCardBank"));

                            if (INVENTORY_DATA.get("classicCardBank") === 0) {
                                SPACE_BOY.invItems.get("classicCard").invText.setText("");
                            }

                        }, scene);
                    }
                }, scene);  
            } 
        },
    }
});

STAGE_OVERRIDES.set("World_1-3", {
    1_3: null,
    methods: {
        preFix: function (scene) {
        },
        postFix: function (scene) {
        },
        afterScore: function (scene) {
            debugger
        }
    }
});

STAGE_OVERRIDES.set("Bonus_X-13", {
    X_13: null,
    methods: {
        preFix: function (scene) {
            scene.gameSettings.lengthGoal = Infinity;
            scene.gameSettings.stopOnBonk = true;
            scene.gameSettings.highScore = INVENTORY_DATA.get("comboTrainerPB");
        },
        postFix: function (scene) {
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            scene.snake.grow(scene);

            scene.comboText = scene.add.bitmapText(0, 0, 'mainFont', 
                scene.snake.comboCounter, 
                8).setOrigin(0.5,0.5).setDepth(100).setAlpha(1).setTintFill(0xFFFFFF);

        },
        afterMove: function (scene) {
            if (scene.snake.comboCounter === 0) {
                if (scene.snake.body.length > 3) {
                    scene.snake.tail = scene.snake.body.slice(-1);
                    var oldPart = scene.snake.body.splice(scene.snake.body.length - 1,1);

                    oldPart[0].destroy();  

                    scene.snake.body[scene.snake.body.length - 1].setFrame(8);
                }
            }


            if (scene.snake.comboCounter > scene.gameSettings.highScore) {
                debugger
                scene.gameSettings.highScore = scene.snake.comboCounter;
                scene.scene.get("SpaceBoyScene").comboTrainertPB.setText(scene.gameSettings.highScore);

                INVENTORY_DATA.set("comboTrainerPB", scene.snake.comboCounter);
                localStorage.setItem("inventory-data", JSON.stringify(Object.fromEntries(INVENTORY_DATA)));
            }
            //debugger

            var head = scene.snake.body[1].getCenter();

            scene.comboText.x = head.x;
            scene.comboText.y = head.y;
            scene.comboText.setText(scene.snake.comboCounter);

        },
    }
});