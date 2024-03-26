

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
        
        this.add.text(SCREEN_WIDTH/2, 24*3, 'SNAKEHOLE',{"fontSize":'48px'}).setOrigin(0.5,0); // Sets the origin to the middle top.
        
        var card = this.add.image(SCREEN_WIDTH/2, 5.5*24, 'howToCard').setDepth(10).setOrigin(0.5,0);
        //card.setOrigin(0,0);

        //card.setScale(1);

        
        var continueText = this.add.text(SCREEN_WIDTH/2, 24*25, '[PRESS TO CONTINUE]',{"fontSize":'48px'}).setOrigin(0.5,0);
        
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
 
        this.load.spritesheet('blocks', 'assets/Tiled/tileSheetx24.png', { frameWidth: 24, frameHeight: 24 });

        // Tilemap
        this.load.image('tileSheetx24', 'assets/Tiled/tileSheetx24.png');
        //console.log(ourStageManager.stage);
        this.load.tilemapTiledJSON('map', `assets/Tiled/${this.stage}.json`);
        //this.load.tilemapTiledJSON('map', 'assets/Tiled/Stage1.json');
    }

    create () {
        
        // Tilemap
        this.map = this.make.tilemap({ key: 'map', tileWidth: 24, tileHeight: 24 });
        this.tileset = this.map.addTilesetImage('tileSheetx24');

        this.layer = this.map.createLayer('Wall', this.tileset);
    
        // add background
        this.add.image(0, 24*2, 'bg01').setDepth(-1).setOrigin(0,0);


        this.time.addEvent({
            delay: 500,
            callback: () => this.scene.switch('WinScene')
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
        
        this.add.text(SCREEN_WIDTH/2, 24*3, 'SNAKEHOLE',{"fontSize":'48px'}).setOrigin(0.5,0);
        
        //var card = this.add.image(5*24, 5*24, 'howToCard').setDepth(10);
        //card.setOrigin(0,0);
        
        const highScore = this.add.dom(SCREEN_WIDTH/2 - 24, 24 * 6.5, 'div', {
            "fontSize":'32px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            color: 'white',
            'text-align': 'right',

        });
        highScore.setText(
            `${ourGame.stage}
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
        
        const scoreScreen = this.add.dom(SCREEN_WIDTH/2 + 24, 24 * 7, 'div', scoreScreenStyle);
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
            var continueText = this.add.text(SCREEN_WIDTH/2, 24*25,'', {"fontSize":'48px'});
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
    scene: [ StartScene, StageManagerScene, GameScene, WinScene]

};

// Screen Settings
export const SCREEN_WIDTH = config.width;
export const SCREEN_HEIGHT = config.height; 


export const game = new Phaser.Game(config);




