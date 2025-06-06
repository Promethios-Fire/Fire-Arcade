import { X_OFFSET, Y_OFFSET, GRID, SPEED_WALK, SPEED_SPRINT, MODES, GState, DIRS, commaInt, PLAYER_STATS, INVENTORY } from "../SnakeHole.js";
import { PORTAL_COLORS, ITEMS } from '../const.js';




export var STAGE_OVERRIDES = new Map([
    ["World_4-4", {
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
                



                scene.gearbox.onOver = function() {
                    INVENTORY.set("gearbox", true);
                    localStorage.setItem("inventory", JSON.stringify(Object.fromEntries(INVENTORY)));

                    scene.interactLayer[(scene.gearbox.x - X_OFFSET)/GRID][(scene.gearbox.y - Y_OFFSET)/GRID] = "empty";
                    
                    scene.gearbox.destroy();

                    var spaceboy = scene.scene.get("SpaceBoyScene");
                    ITEMS.get("gearbox").addToInventory(spaceboy);
                }
            }
        }

    }],
    ["World_2-4", {
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
    ["Tutorial_T-1", {
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

    ["Bonus-Stage-x1", {
        preFix: function (scene) {
            scene.lengthGoal = 0;
            scene.stopOnBonk = true;

            

        },
        postFix: function (scene) {

            // Override
            scene.onBonk = this.onBonk

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
            
        }
    }],
    ["Bonus-Stage-x2", {
        preFix: function (scene) {
            scene.lengthGoal = 0;
            scene.stopOnBonk = true;
            scene.maxScore = 60;
            scene.boostCost = 0;
        },
        postFix: function (scene) {
    
        },
        
    }],
    ["Bonus-Stage-x3", {
        preFix: function (scene) {
            scene.lengthGoal = 0;
            scene.maxScore = 60;
            scene.boostCost = 0;
        },
        postFix: function (scene) {

            scene.onEat = this.onEat;
    
        },
        onEat: function (food) {
            this.atoms.delete(food);
            food.delayTimer.destroy();
            food.electrons.destroy();
            food.destroy();
        }
        
    }],
    ["Bonus-Stage-x4", {
        preFix: function (scene) {
            scene.lengthGoal = 0;
            scene.stopOnBonk = true;
            scene.maxScore = 60;
            scene.speedWalk = SPEED_SPRINT;
            scene.speedSprint = SPEED_WALK;
            scene.boostCost = 3;
        },
        postFix: function (scene) {
    
        },
        
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
        onMove: function (scene) {
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