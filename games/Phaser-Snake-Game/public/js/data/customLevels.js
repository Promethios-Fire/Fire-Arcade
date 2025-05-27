import { X_OFFSET, Y_OFFSET, GRID, SPEED_WALK, SPEED_SPRINT, MODES, commaInt } from "../SnakeHole.js";

export var STAGE_OVERRIDES = new Map([
    ["Tutorial_1", {
        preFix: function (scene) {
            
            scene.mode = MODES.TUTORIAL;
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99

        },
        postFix: function (scene) {
            
            // Override checkWinCon()
            scene.checkWinCon = function(){
                if (scene.length >= 7) {
                    debugger
                    var howToCard = "move";
                    
                    scene.scene.start('TutorialScene', {
                        cards: [howToCard],
                        toStage: "Tutorial_2",
                    });
    
                } else {
                    return false;
                }
            }
        }

    }],
    ["Tutorial_2", {
        preFix: function (scene) {

            debugger
            scene.mode = MODES.TUTORIAL;
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;

            scene.time.delayedCall(5000, () => {
                scene.tutorialPrompt(X_OFFSET + scene.helpPanel.width/2 + GRID,
                     Y_OFFSET + scene.helpPanel.height/2 + GRID,2,)
            })

        },
        postFix: function (scene) {
            scene.checkWinCon = function(){
                if (scene.length >= 7) { //14
                    debugger
                    var howToCard = "move";
                    
                    scene.scene.start('TutorialScene', {
                        cards: [howToCard],
                        toStage: "Tutorial_3",
                    });
    
                } else {
                    return false;
                }
            }

        }
    }],
    ["Tutorial_3", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;

        },
        postFix: function (scene) {
            scene.checkWinCon = function(){
                if (scene.length >= 7) { //21

                    var howToCard = "move";
                    
                    scene.scene.start('TutorialScene', {
                        cards: [howToCard],
                        toStage: "Tutorial_4",
                    });
    
                } else {
                    return false;
                }
            }

        }
    }],
    ["Tutorial_4", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.scene.get('PersistScene').coins = 20

        },
        postFix: function (scene) {
            scene.checkWinCon = function(){
                if (scene.length >= 7) { //28

                    //var howToCard = "move";
                    
                    //scene.scene.start('TutorialScene', {
                    //    cards: [howToCard],
                    //    toStage: "Tutorial_3",
                    //});
    
                } else {
                    return false;
                }
            }

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
]);