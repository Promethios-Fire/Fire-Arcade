
    /*cornerBonus() {
    //return Math.ceil(this.cornerTime / 100) * 10;
    */

/*gameanalytics.GameAnalytics.setCustomDimension01(dimensionSlug);

        var extraFields = {
            foodLog: this.stageData.foodLog.toString(),
            //foodHistory: this.stageData.foodHistory.toString(),
            //moveHistory: this.stageData.moveHistory.toString()
        }
        var designPrefix = `${this.stageData.uuid}:${this.stageData.stage}`;
        
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:BaseScore`, this.stageData.calcBase(), 
            { foodLog:this.stageData.foodLog.toString() }
        );
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:SpeedBonus`, this.stageData.calcBonus());
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:Bonks`, this.stageData.bonks);
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:BonkBonus`, this.stageData.bonkBonus());
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:BoostTime`, this.stageData.boostFrames); // BoostFrames should probably be called boostTime now but I need to check the code first.
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:BoostBonus`, this.stageData.boostBonus());
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:CornerTime`, this.stageData.cornerTime);
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:CornerBonus`, this.stageData.cornerBonus());
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:DiffBonus`, this.stageData.diffBonus); 
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:ScoreTotal`, this.stageData.calcTotal());
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:medianSpeedBonus`, this.stageData.medianSpeedBonus);
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:StageRank`, this.stageData.stageRank());
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:MoveCount`, this.stageData.moveCount, 
            { turnInputs:this.stageData.turnInputs.toString() }
        );
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:CoinsLeft`, ourPersist.coins);

        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:CurrentBestBase`, bestLog.calcBase());
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:CurrentBestSpeedBonus`, bestLog.calcBonus());
        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:CurrentBestTotal`, bestLog.calcTotal());

        gameanalytics.GameAnalytics.addDesignEvent(`${designPrefix}:ZedLevel`, this.stageData.zedLevel);
*/   



class TimeAttackScene extends Phaser.Scene{
    // #region TimeAttackScene
    constructor () {
        super({ key: 'TimeAttackScene', active: false });
    }

    init () {

        this.inTimeAttack = false;
        this.zeds = 0;
        this.sumOfBest = 0;
        this.stagesComplete = 0;

    }
    preload () {

    }
    create() {
        // Sets first time as an empty list. After this it will not be set again
        // Remember to reset manually on full game restart.
        const ourGame = this.scene.get('GameScene');
        const ourStartScene = this.scene.get('StartScene');


        

        // First Entry Y Coordinate
        var stageY = GRID *3;
        var allFoodLog = [];

        // Average Food
        var sumFood = allFoodLog.reduce((a,b) => a + b, 0);


        var playedStages = [];
        var index = 0;

        // Value passes by reference and so must pass the a value you don't want changed.
       

        this.input.keyboard.addCapture('UP,DOWN,SPACE');

        
        var _i = 0;
        var lowestScore = 9999999999;


        
    
        if (ourStartScene.stageHistory) {
            this.inTimeAttack = true;

            ourStartScene.stageHistory.forEach(_stageData => {

                var baseScore = _stageData.calcBase();
                var realScore = _stageData.calcTotal();
                var foodLogOrdered = _stageData.foodLog.slice().sort().reverse();

                

                allFoodLog.push(...foodLogOrdered);


                var logWrapLenth = 8;
                //var bestLog = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}-bestStageData`));
                //var bestScore;
                var bestChar;

                if (_stageData.newBest) {
                    bestChar = "+";
                }
                else {
                    bestChar = "-";
                }


                //////
                var stageUI = this.add.dom(GRID * 9, stageY, 'div', {
                    color: 'white',
                    'font-size': '28px',
                    'font-family': ["Sono", 'sans-serif'],
                });


                if (realScore < lowestScore) {
                    index = _i;
                    lowestScore = realScore;
                };
                    

                stageUI.setText(`${bestChar}${_stageData.stage}`).setOrigin(1,0);

                playedStages.push([stageUI, _stageData.stage]);
                
            

                // Run Stats
                var scoreUI = this.add.dom( GRID * 10, stageY + 4 , 'div', {
                    color: 'white',
                    'font-size': '14px',
                    'font-family': ["Sono", 'sans-serif'],
                });
                scoreUI.setText(`Score ${realScore} SpeedBonus: ${calcBonus(baseScore)}`).setOrigin(0,0);


                // food Log
                var foodLogUITop = this.add.dom( scoreUI.x + scoreUI.width +  14, stageY + 4 , 'div', {
                    color: 'darkslategrey',
                    'font-size': '12px',
                    'font-family': ["Sono", 'sans-serif'],
                });
                foodLogUITop.setText(foodLogOrdered.slice(0,logWrapLenth)).setOrigin(0,0);

                var foodLogUIBottom = this.add.dom( GRID * 10, stageY + GRID , 'div', {
                    color: 'darkslategrey',
                    'font-size': '12px',
                    'font-family': ["Sono", 'sans-serif'],
                });
                foodLogUIBottom.setText(foodLogOrdered.slice(logWrapLenth - foodLogOrdered.length)).setOrigin(0,0);

                _i += 1;
                stageY += GRID * 2;

            }); // End Level For Loop


            var selected = playedStages[index]

            selected[0].node.style.color = COLOR_FOCUS;

            // Snake Head Code

            var selector = this.add.sprite(GRID, selected[0].y + 6, 'snakeDefault', 5);
            //this.head = scene.add.image(x * GRID, y * GRID, 'snakeDefault', 0);
            selector.setOrigin(0.5,0);

            var upArrow = this.add.sprite(GRID, selected[0].y - 42).setDepth(15).setOrigin(0.5,0);
            var downArrow = this.add.sprite(GRID, selected[0].y + 32).setDepth(15).setOrigin(0.5,0);

            upArrow.play('startArrowIdle');
            downArrow.flipY = true;
            downArrow.play('startArrowIdle');



            // #region Stage Select Code
            // Default End Game
            var continue_text = '[SPACE TO END GAME]';
    
            if (ourUI.lives > 0) {
                continue_text = `[GOTO ${selected[1]}]`;
            }
            
            var continueTextUI = this.add.text(SCREEN_WIDTH/2, GRID*26,'', {"fontSize":'48px'}).setVisible(false);
            continueTextUI.setText(continue_text).setOrigin(0.5,0).setDepth(25);


            this.input.keyboard.on('keydown-DOWN', function() {
                selected[0].node.style.color = "white";
                index = Phaser.Math.Wrap(index + 1, 0, playedStages.length-1); // No idea why -1 works here. But it works so leave it until it doesn't/

                selected = playedStages[index];
                selected[0].node.style.color = COLOR_FOCUS;
                selector.y = selected[0].y + 6;
                
                upArrow.y = selected[0].y - 42;
                downArrow.y = selected[0].y + 32;

                continueTextUI.setText(`[GOTO ${selected[1]}]`);
                
            }, [], this);
    
            this.input.keyboard.on('keydown-UP', function() {
                selected[0].node.style.color = "white";
                index = Phaser.Math.Wrap(index - 1, 0, playedStages.length);
                
                selected = playedStages[index];
                selected[0].node.style.color = COLOR_FOCUS;
                selector.y = selected[0].y + 6;
                
                upArrow.y = selected[0].y - 42;
                downArrow.y = selected[0].y + 32;

                continueTextUI.setText(`[GOTO ${selected[1]}]`);
            }, [], this);

            ///////// Run Score

            var runScore = 0;
            var baseScore = 0;

            if (ourStartScene.stageHistory) {
                ourStartScene.stageHistory.forEach(_stageData => {
                
                    runScore += _stageData.calcTotal();
                    baseScore += _stageData.calcBase();

                });

            };
            

            stageY = stageY + 4

            var runScoreUI = this.add.dom(GRID * 10, stageY, 'div', {
                color: COLOR_SCORE,
                'font-size': '28px',
                'font-family': ["Sono", 'sans-serif'],
                'text-decoration': 'overline dashed',


            });

            runScoreUI.setText(`Current Run Score ${runScore}`).setOrigin(0,0);

            // #region Unlock New Level?

            if (this.scene.get('GameScene').stage != END_STAGE) {

                
                var unlockStage;
                var goalSum; // Use sum instead of average to keep from unlocking stages early.
                var foodToNow = ourStartScene.stageHistory.length * 28; // Calculated value of how many total fruit collect by this stage
                stageY = stageY + GRID * 2;
                

                var lastStage = ourStartScene.stageHistory.slice(-1);

                // Allows levels with no stage afterwards.
                if (STAGES_NEXT[lastStage[0].stage]) {

                    // Unlock Difficulty needs to be in order
                    STAGES_NEXT[lastStage[0].stage].some( _stage => {

                        var _goalSum = _stage[1] * foodToNow;
                        unlockStage = _stage;
                        goalSum = unlockStage[1] * foodToNow;
                        if (this.histSum <= _goalSum && baseScore > _goalSum) {
                            return true;
                        }
                    });

        
                    // #region Unlock UI

                    var nextStageUI = this.add.dom(GRID * 9, stageY, 'div', {
                        color: 'grey',
                        'font-size': '20px',
                        'font-family': ["Sono", 'sans-serif'],
                        'text-decoration': 'underline',
                    });

                    nextStageUI.setText("Unlock Next Stage").setOrigin(1,0);

                    stageY += GRID;

                    var unlockStageUI = this.add.dom(GRID * 9, stageY, 'div', {
                        color: 'white',
                        'font-size': '28px',
                        'font-family': ["Sono", 'sans-serif'],
                    });
    
                    unlockStageUI.setText(unlockStage[0]).setOrigin(1,0);
                    

                    // Run Stats
                    var requiredAveUI = this.add.dom( GRID * 10, stageY + 4 , 'div', {
                        color: 'white',
                        'font-size': '14px',
                        'font-family': ["Sono", 'sans-serif'],
                    });
                    
                    var currentAveUI = this.add.dom( GRID * 10, stageY + GRID + 4, 'div', {
                        color: 'white',
                        'font-size': '14px',
                        'font-family': ["Sono", 'sans-serif'],
                    });

                    var currentAve = baseScore / foodToNow; 
                    var requiredAve = goalSum / foodToNow;


                    requiredAveUI.setText(`${requiredAve.toFixed(1)}: Required Food Score Average to Unlock  `).setOrigin(0,0);
                    currentAveUI.setText(`${currentAve.toFixed(1)}: Current Food Score Average`).setOrigin(0,0.5);

                    var unlockMessageUI = this.add.dom( GRID * 10, stageY - 18 , 'div', {
                        color: 'white',
                        'font-size': '14px',
                        'font-family': ["Sono", 'sans-serif'],
                        'font-style': 'italic',
                    });
                    
                    if (goalSum && baseScore > goalSum && this.histSum < goalSum) {
                        unlockMessageUI.setText("YOU UNLOCKED A NEW LEVEL!! Try now it out now!").setOrigin(0,0);
                        unlockMessageUI.node.style.color = "limegreen";
                        currentAveUI.node.style.color = "limegreen";

                        playedStages.push([unlockStageUI, unlockStage[0]]);
                        
                        //console.log(unlockStage[0], "FoodAve:", baseScore / foodToNow, "FoodAveREQ:", goalSum / foodToNow);

                        //lowestStage = unlockStage[0]; ////// BROKE
                        
                    }
                    else {
                        unlockMessageUI.setText("Redo a previous stage to increase your average.").setOrigin(0,0);
                        unlockMessageUI.node.style.color = COLOR_FOCUS;
                        currentAveUI.node.style.color = COLOR_SCORE;

                        //console.log(
                        //    "BETTER LUCK NEXT TIME!! You need", goalSum / foodToNow, 
                        //    "to unlock", unlockStage[0], 
                        //    "and you got", baseScore / foodToNow);
                    }
                }
                
                // Calc score required up to this point
                // Add Stage History Sum Here

                if (this.newUnlocked) {
                    console.log("New Unlocked this Run", this.newUnlocked); // Display mid run unlocks
                }
    
            }
            // #endregion
            


            ////////// Run Average

            var sumFood = allFoodLog.reduce((a,b) => a + b, 0);

            var sumAveFood = sumFood / allFoodLog.length;

            //console.log ("sum:", sumFood, "Ave:", sumAveFood);
             
            this.time.delayedCall(900, function() {

                // #region Continue Text 
                //continueTextUI.setVisible(true);
    
    
                this.tweens.add({
                    targets: continueTextUI,
                    alpha: { from: 0, to: 1 },
                    ease: 'Sine.InOut',
                    duration: 1000,
                    repeat: -1,
                    yoyo: true
                  });

                  /*
                  this.tweens.add({
                    targets: lowestStageUI,
                    alpha: { from: 0, to: 1 },
                    ease: 'Sine.InOut',
                    duration: 1000,
                    repeat: -1,
                    yoyo: true
                  });*/

                var bestRun = Number(JSON.parse(localStorage.getItem(`BestFinalScore`)));
                if (bestRun < runScore) {
                    localStorage.setItem('BestFinalScore', runScore);
                }
                
    
                this.input.keyboard.on('keydown-SPACE', function() {

                if (ourUI.lives > 0) {

                    ourUI.lives -= 1; 

                    ourUI.scene.restart( { score: 0, lives: ourUI.lives } );
                    ourGame.scene.restart( { stage: playedStages[index][1] } );

                    ourTimeAttack.scene.stop();

                    //ourTimeAttack.scene.switch('GameScene');
                    
                }
                else {
                    // end run
                    // go to Time Attack
                    console.log("That's All Folks!" , runScore);
                    ourTimeAttack.scene.stop();
                    //ourScoreScene.scene.switch('TimeAttackScene');
                }
                        
                });
                /// END STUFF
                // Reset the unlocked stages after you load the scene.
                // So they only show up once per Time Attack Scene.
                this.newUnlocked = [];

            }, [], this);
   

        }


    }
    update() {

    }
}






// in Game Scene
                // @holden do we need to hold onto these?
                /*this.starEmitter = this.add.particles(X_OFFSET, Y_OFFSET, "starIdle", { 
                    x:{min: 0, max: SCREEN_WIDTH},
                    y:{min: 0, max: SCREEN_HEIGHT},
                    alpha: { start: 1, end: 0 },
                    gravityX: -50,
                    gravityY: 50,
                    anim: 'starIdle',
                    lifespan: 3000,
                }).setFrequency(300,[1]).setDepth(1);
            
                // check if stage next is empty -- means it's the final extraction point

                this.starEmitterFinal = this.add.particles(6,6,"starIdle", { 
                    speed: { min: -20, max: 20 },
                    angle: { min: 0, max: 360 },
                    alpha: { start: 1, end: 0 },
                    anim: 'starIdle',
                    lifespan: 1000,
                    follow:this.snake.head,
                }).setFrequency(150,[1]).setDepth(1);*/