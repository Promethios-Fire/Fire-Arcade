

var STAGES = [ // Stage IDs and number of varients.
// These need to match the name of the json filed created by Tiled.
    {'id':'Stage-01', 'varients':[], },
    {'id':'Stage-02', 'varients':[], },
    {'id':'Stage-03', 'varients':[], }, 
]

// TODOL: Need to truncate this list based on number of portals areas.
// DO this dynamically later based on the number of portal areas.


class StartScene extends Phaser.Scene {
    constructor () {
        super({key: 'StartScene', active: true});
    }

    preload() {
        this.load.image('howToCard', 'assets/howToCardNew.png');
    }

    create() {
        
        this.add.text(SCREEN_WIDTH/2, GRID*3, 'SNAKEHOLE',{"fontSize":'48px'}).setOrigin(0.5,0); // Sets the origin to the middle top.
        
        var card = this.add.image(SCREEN_WIDTH/2, 5.5*GRID, 'howToCard').setDepth(10).setOrigin(0.5,0);
        //card.setOrigin(0,0);

        //card.setScale(1);

        
        var continueText = this.add.text(SCREEN_WIDTH/2, GRID*25, '[PRESS TO CONTINUE]',{"fontSize":'48px'}).setOrigin(0.5,0);
        
        this.tweens.add({
            targets: continueText,
            alpha: { from: 0, to: 1 },
            ease: 'Sine.InOut',
            duration: 1000,
            repeat: -1,
            yoyo: true
          });

        this.input.keyboard.on('keydown', e => {
            //var ourStageManager = this.scene.get("StageManagerScene");

            //ourStageManager.currentStage = STAGES[0] // Start with stage 1.
            
            //this.scene.start('StageManagerScene');
            this.scene.launch('GameScene');
            this.scene.start('UIScene');
            //console.log(e)
            this.scene.stop()
        })
    }

    end() {

    }


}

class StageManagerScene extends Phaser.Scene {
    constructor () {
        super({key: 'StageManagerScene', active: true});
    }

    init() {

        // These are set during the Start Scene
        this.previousStage = '';
        this.currentStage = STAGES[0]; // Start with first stage in the list.

    }

    preload() {
        //this.load.tilemapTiledJSON('map', 'assets/Tiled/Stage2.json');

    }

    create() {
        this.stage = this.currentStage['id'];
        
        //this.stageVarient = '-a';
    

    }

    update(time) {
        
    }

    end() {

    }
}

var Stage = new Phaser.Class({
    initialize:

    function Stage(scene, stageID) {


    },
    
});



class GameScene extends Phaser.Scene {

    constructor () {
        super({key: 'GameScene', active: false});
    }
    
    
    init(props) {

        const { stage = 'Stage-01' } = props
        this.stage = stage;
        console.log("FIRST INIT", this.stage);

    }
    
    
    preload () {
 
        this.load.spritesheet('blocks', 'assets/Tiled/tileSheetx24.png', { frameWidth: GRID, frameHeight: GRID });

        // Tilemap
        this.load.image('tileSheetx24', 'assets/Tiled/tileSheetx24.png');
        //console.log(ourStageManager.stage);
        this.load.tilemapTiledJSON('map', `assets/Tiled/${this.stage}.json`);
        //this.load.tilemapTiledJSON('map', 'assets/Tiled/Stage1.json');
    }

    create () {
        
        // Tilemap
        this.map = this.make.tilemap({ key: 'map', tileWidth: GRID, tileHeight: GRID });
        this.tileset = this.map.addTilesetImage('tileSheetx24');

        this.layer = this.map.createLayer('Wall', this.tileset);
    
        // add background
        this.add.image(0, GRID*2, 'bg01').setDepth(-1).setOrigin(0,0);


        this.time.addEvent({
            delay: 2500,
            callback: () => this.scene.restart({ stage: 'Stage-03' })
          });


        //


    }

    update (time) {

    }
}

class WinScene extends Phaser.Scene
{
    constructor () {
        super({key: 'WinScene', active: false});
    }

    preload() {
    }

    create() {

        const ourGame = this.scene.get('GameScene');
        const ourWinScene = this.scene.get('WinScene');

        ///////
        
        this.add.text(SCREEN_WIDTH/2, GRID*3, 'SNAKEHOLE',{"fontSize":'48px'}).setOrigin(0.5,0);
        
        //var card = this.add.image(5*GRID, 5*GRID, 'howToCard').setDepth(10);
        //card.setOrigin(0,0);
        
        const highScore = this.add.dom(SCREEN_WIDTH/2 - GRID, GRID * 6.5, 'div', {
            "fontSize":'32px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            color: 'white',
            'text-align': 'right',

        });
        highScore.setText(
            `${ourStageManager.stage}
            Score: 1200
            HighScore: 3000
            ---------------
            `
        
        ).setOrigin(1, 0);

        
        const scoreScreenStyle = {
            width: '270px',
            //height: '22px',
            color: 'white',
            'font-size': '12px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            'padding': '12px 0px 12px 12px',
            //'font-weight': 'bold',
            'word-wrap': 'break-word',
            //'border-radius': '24px',
            outline: 'solid',
        }
        
        const scoreScreen = this.add.dom(SCREEN_WIDTH/2 + GRID, GRID * 7, 'div', scoreScreenStyle);
        scoreScreen.setOrigin(0,0);
        
        scoreScreen.setText(
        `STAGE STATS - ${ourGame.stage}
        ----------------------
        SCORE: xxx
        FRUIT SCORE AVERAGE: 64
        
        TURNS: 15
        CORNER TIME: 32  FRAMES
        
        BONUS Boost Time: 4 FRAMES
        BOOST TIME: 0 FRAMES
        
        BETA: TEST

        BONK RESETS: 1
        TOTAL TIME ELAPSED: 69 Seconds
        `);



        //card.setScale(0.7);

        // Give a few seconds before a player can hit continue
        this.time.delayedCall(900, function() {
            var continueText = this.add.text(SCREEN_WIDTH/2, GRID*25,'', {"fontSize":'48px'});
            continueText.setText('[SPACE TO CONTINUE]').setOrigin(0.5,0);


            this.tweens.add({
                targets: continueText,
                alpha: { from: 0, to: 1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: -1,
                yoyo: true
              });
            

                this.input.keyboard.on('keydown-SPACE', function() {


                
                //console.log("LAST", ourStageManager.currentStage);
                //ourStageManager.currentStage = STAGES[2];
                //ourStageManager.stage = STAGES[2]["id"];
                //console.log("NEXT", ourStageManager.currentStage);

                //ourGame.scene.stop();
                //ourGame.preload(); this.scene.restart({ level: this.currentLevel + 1 })
                ourGame.scene.restart( {stage: 'Stage-03'} );
                console.log("AFTER RESET", ourGame.stage);

                ourWinScene.scene.switch('GameScene');

            });
        }, [], this);
    }

    end() {

    }

}



class UIScene extends Phaser.Scene {
    constructor () {
        super({ key: 'UIScene', active: false });
    }
    
    init() {
        const ourStageManager = this.scene.get('StageManagerScene');
        var bestLocal = JSON.parse(localStorage.getItem(`${ourStageManager.stage}-best`))
        if (bestLocal) {
            this.bestScore = Number(bestLocal);
        }
        else {
            this.bestScore = 0;
        }

        this.score = 0;

        this.length = 0;

        this.scoreMulti = 0;
        this.globalFruitCount = 0;
        this.lives = 1;

        this.scoreHistory = [];
    }

    preload () {
        //this.load.spritesheet('ui', 'assets/Tiled/tileSheetx24.png', { frameWidth: GRID, frameHeight: GRID });
    }
    
    create() {
        const ourGame = this.scene.get('GameScene');
        const ourStageManager = this.scene.get('StageManagerScene');


        var bestLocal = JSON.parse(localStorage.getItem(`${ourStageManager.stage}-best`))
        if (bestLocal) {
            this.bestScore = Number(bestLocal);
        }
        else {
            this.bestScore = 0;
        }

        const UIStyle = {
            //width: '220px',
            //height: '22px',
            color: 'lightyellow',
            'font-size': '16px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            'padding': '0px 0px 0px 12px',
            //'font-weight': 'bold',
            //'border-radius': '24px',
            //outline: 'solid',
            //'text-align': 'right',
        };
   
        const gameVersionUI = this.add.dom(SCREEN_WIDTH - GRID * 2, SCREEN_HEIGHT, 'div', {
            color: 'white',
            'font-size': '10px',
            'font-family': ["Sono", 'sans-serif'],
        }).setOrigin(1,1);
      
        gameVersionUI.setText(`snakehole.${GAME_VERSION}`).setOrigin(1,1);

        // Store the Current Version in Cookies
        localStorage.setItem('version', GAME_VERSION); // Can compare against this later to reset things.

        var bestLocal = JSON.parse(localStorage.getItem(`${ourStageManager.stage}-best`))
        if (bestLocal) {
            this.bestScore = Number(bestLocal);
        }
        
        // Score Text
        this.scoreUI = this.add.dom(0 , GRID*2 + 2, 'div', UIStyle);
        this.scoreUI.setText(`Score: 0`).setOrigin(0,1);
        //this.scoreUI.setText(`Score: ${this.score}`).setOrigin(0,0);
        
        // Best Score
        this.bestScoreUI = this.add.dom(0, 12 - 2 , 'div', UIStyle);
        this.bestScoreUI.setOrigin(0,0);
        this.bestScoreUI.setText(`Best : ${this.bestScore}`);
        //this.bestScoreUI.setText(""); // Hide until you get a score to put here.
        
        // Lives
        // this.add.image(GRID * 21.5, GRID * 1, 'ui', 0).setOrigin(0,0);
        this.livesUI = this.add.dom(GRID * 22.5, GRID * 2 + 2, 'div', UIStyle);
        this.livesUI.setText(`x ${this.lives}`).setOrigin(0,1);

        // Goal UI
        //this.add.image(GRID * 26.5, GRID * 1, 'ui', 1).setOrigin(0,0);
        this.lengthGoalUI = this.add.dom(GRID * 26.5, GRID * 2 + 2, 'div', UIStyle);
        
        
        var length = `${this.length}`;
        this.lengthGoalUI.setText(`${length.padStart(2, "0")}/${LENGTH_GOAL}`).setOrigin(0,1);
        //this.add.image(SCREEN_WIDTH - 12, GRID * 1, 'ui', 3).setOrigin(1,0);

        // Start Fruit Score Timer
        if (DEBUG) { console.log("STARTING SCORE TIMER"); }

        this.scoreTimer = this.time.addEvent({
            delay: 10000,
            paused: false
         });


         // Countdown Text
        this.countDown = this.add.dom(GRID*9 + 9, 16, 'div', {
            color: 'white',
            'font-size': '22px',
            'font-family': ["Sono", 'sans-serif'],
            padding: '1px 5px',
            'border-radius': '4px',
            outline: 'solid'
        }).setOrigin(1,0);
        this.countDown.setText(this.scoreTimer.getRemainingSeconds().toFixed(1) * 10);

        
        if (DEBUG) {
            this.timerText = this.add.text(SCREEN_WIDTH/2 - 1*GRID , 27*GRID , 
            this.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
            { font: '30px Arial', 
              fill: '#FFFFFF',
              fontSize: "32px"
            });
        }
        
        //  Event: addScore
        ourGame.events.on('addScore', function (fruit) {

            const scoreStyle = {
                //width: '220px',
                //height: '22px',
                color: 'lightyellow',
                'font-size': '13px',
                'font-family': ["Sono", 'sans-serif'],
                'font-weight': '400',
                'padding': '2px 9px 2px 9px',
                'font-weight': 'bold',
                //'border-radius': '24px',
                //outline: 'solid',
                'text-align': 'right',
            };

            var scoreText = this.add.dom(fruit.x -10, fruit.y - GRID, 'div', scoreStyle);
            scoreText.setOrigin(0,0);
            
            // Remove score text after a time period.
            this.time.delayedCall(1000, event => {
                scoreText.removeElement();
            }, [], this);

            this.tweens.add({
                targets: scoreText,
                alpha: { from: 1, to: 0.1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
              });
            //debugger
            
            
            
            var timeLeft = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
            
            if (timeLeft > BOOST_ADD_FLOOR) {
                ourGame.energyAmount += 10;
            }
            
            if (timeLeft > SCORE_FLOOR) {
                this.score += timeLeft;
                scoreText.setText(`+${timeLeft}`);

                // Record Score for Stats
                this.scoreHistory.push(timeLeft);
            } else {
                this.score += SCORE_FLOOR;
                scoreText.setText(`+${SCORE_FLOOR}`);

                // Record Score for Stats
                this.scoreHistory.push(SCORE_FLOOR);
            }


            // Update UI

            this.scoreUI.setText(`Score: ${this.score}`);
            
            this.length += 1;
            this.globalFruitCount += 1; // Run Wide Counter

            var length = `${this.length}`;
            
            this.lengthGoalUI.setText(`${length.padStart(2, "0")}/${LENGTH_GOAL}`);
            

             // Restart Score Timer
            if (this.length < LENGTH_GOAL) {
                this.scoreTimer = this.time.addEvent({  // This should probably be somewhere else, but works here for now.
                    delay: 10000,
                    paused: false
                 });   
            }
            
        }, this);

        //  Event: saveScore
        ourGame.events.on('saveScore', function () {
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.bestScoreUI.setText(`Best : ${this.bestScore}`);

                var bestScoreHistory = `[${this.scoreHistory.sort().reverse()}]`
                localStorage.setItem(`${ourStageManager.stage}-bestFruitLog`, bestScoreHistory);

                localStorage.setItem(`${ourStageManager.stage}-bestScoreAve`, Math.round(this.score / LENGTH_GOAL));
            }

            localStorage.setItem(`${ourStageManager.stage}-best`, this.bestScore);
            
            // Reset Score for new game
            //this.score = 0;
            //this.scoreMulti = 0;
            //this.fruitCount = 0;
            //this.scoreHistory = [];

            //this.scoreUI.setText(`Score: ${this.score}`);

            
            

        }, this);
        
    }
    update() {
        var timeTick = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
        
        
        if (this.length < LENGTH_GOAL) {
        
            if (timeTick < SCORE_FLOOR ) {
                this.countDown.setText(this.score + SCORE_FLOOR);
            } else {
                this.countDown.setText(this.score + (this.scoreTimer.getRemainingSeconds().toFixed(1) * 10));
            }
        }
        else {
            this.countDown.setText(this.score);
        } 
        
        if (DEBUG) {
            if (timeTick < SCORE_FLOOR ) {
            
            } else {
                this.timerText.setText(timeTick);
            }  
        }
    }
    

end() {

    }
    
}

class InputScene extends Phaser.Scene {
    constructor () {
        super({key: 'InputScene', active: true});
    }

    init() {
        this.inputSet = [];
        this.turns = 0; // Total turns per live.
        this.boostTime = 0; // Sum of all boost pressed
        this.boostBonusTime = 0; // Sum of boost during boost bonuse time.
        this.cornerTime = 0; // Frames saved when cornering before the next Move Time.
    }

    preload() {

    }
    create() {
    }
    update() {
    }
    updateDirection(gameScene, event) {
        // console.log(event.keyCode, this.time.now); // all keys
        //console.profile("UpdateDirection");
        //console.time("UpdateDirection");
        //console.log(this.turns);
        
        switch (event.keyCode) {
            case 87: // w

            if (gameScene.snake.heading === LEFT  || gameScene.snake.heading  === RIGHT || // Prevents backtracking to death
                gameScene.snake.heading  === STOP || gameScene.snake.body.length < 2) { 
                
                // At anytime you can update the direction of the snake.
                gameScene.snake.head.setTexture('blocks', 6);
                gameScene.snake.heading = UP;
                
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                this.turns += 1; 
                    
                if (!gameScene.snake.hold_move) {
                    this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)   
                    gameScene.snake.move(gameScene);
                    gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                }
            }
            break;

            case 65: // a

            if (gameScene.snake.heading  === UP   || gameScene.snake.heading  === DOWN || 
                gameScene.snake.heading  === STOP || gameScene.snake.body.length < 2) {
                
                gameScene.snake.head.setTexture('blocks', 4);
                gameScene.snake.heading = LEFT;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);

                if (!gameScene.snake.hold_move) {
                    this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)   
                    gameScene.snake.move(gameScene);
                    gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                }
            }
            break;

            case 83: // s

            if (gameScene.snake.heading  === LEFT  || gameScene.snake.heading  === RIGHT || 
                 gameScene.snake.heading  === STOP || gameScene.snake.body.length < 2) { 
                

                gameScene.snake.head.setTexture('blocks', 7);
                gameScene.snake.heading = DOWN;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);

                if (!gameScene.snake.hold_move) {  
                    this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666) 
                    gameScene.snake.move(gameScene);
                    gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                }
            }
            break;

            case 68: // d

            if (gameScene.snake.heading  === UP   || gameScene.snake.heading  === DOWN || 
                gameScene.snake.heading  === STOP || gameScene.snake.body.length < 2) { 
                
                gameScene.snake.head.setTexture('blocks', 5);
                gameScene.snake.heading = RIGHT;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
 
                if (!gameScene.snake.hold_move) {
                    this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)   
                    gameScene.snake.move(gameScene);
                    gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                    }
            }
            break;

            case 38: // UP

            if (gameScene.snake.heading  === LEFT || gameScene.snake.heading  === RIGHT || 
                gameScene.snake.heading  === STOP || gameScene.snake.body.length < 2) {

                gameScene.snake.head.setTexture('blocks', 6);
                gameScene.snake.heading = UP;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);

                if (!gameScene.snake.hold_move) {
                    this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)   
                    gameScene.snake.move(gameScene);
                    gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                    }
            }
            break;

            case 37: // LEFT

            if (gameScene.snake.heading  === UP   || gameScene.snake.heading  === DOWN || 
                gameScene.snake.heading  === STOP || gameScene.snake.body.length < 2) { 
                
                gameScene.snake.head.setTexture('blocks', 4);
                gameScene.snake.heading = LEFT;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);

                if (!gameScene.snake.hold_move) {
                    this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)   
                    gameScene.snake.move(gameScene);
                    gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                    }
            }
            break;

            case 40: // DOWN

            if (gameScene.snake.heading  === LEFT || gameScene.snake.heading  === RIGHT || 
                gameScene.snake.heading  === STOP || gameScene.snake.body.length < 2) { 

                gameScene.snake.head.setTexture('blocks', 7);
                gameScene.snake.heading = DOWN;
                
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                
                if (!gameScene.snake.hold_move) {
                    this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)   
                    gameScene.snake.move(gameScene);
                    gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                    }
            }
            break;

            case 39: // RIGHT

            if (gameScene.snake.heading  === UP   || gameScene.snake.heading  === DOWN || 
                gameScene.snake.heading  === STOP || gameScene.snake.body.length < 2) { 

                gameScene.snake.head.setTexture('blocks', 5);
                gameScene.snake.heading = RIGHT;
                
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                
                if (!gameScene.snake.hold_move) {
                    this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)   
                    gameScene.snake.move(gameScene);
                    gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                    }
            }
            break;

            case 32: // SPACE
              if (DEBUG) { console.log(event.code, gameScene.time.now); }
              this.inputSet.push([START_SPRINT, gameScene.time.now]);
              break;
        } 
    }
}

var config = {
    type: Phaser.AUTO,  //Phaser.WEBGL breaks CSS TEXT in THE UI
    width: 744,
    height: 744,
    //seed: 1,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0}
        }
    },
    fx: {
        glow: {
            distance: 32,
            quality: 0.1
        }
    },
    dom: {
        createContainer: true
    },
    //scene: [ StartScene, InputScene]
    scene: [ StartScene, StageManagerScene, UIScene, GameScene, InputScene, WinScene]

};

// Screen Settings
export const SCREEN_WIDTH = config.width;
export const SCREEN_HEIGHT = config.height; 

// Edge locations for X and Y
export const END_X = SCREEN_WIDTH/GRID - 1;
export const END_Y = SCREEN_HEIGHT/GRID - 1;

// Collision only works if GRID is whole divisor of HEIGHT and WIDTH
if (SCREEN_HEIGHT % GRID != 0 || SCREEN_WIDTH % GRID != 0 ) {
    throw "SCREEN DOESN'T DIVIDE INTO GRID EVENLY SILLY";
}

export const game = new Phaser.Game(config);




