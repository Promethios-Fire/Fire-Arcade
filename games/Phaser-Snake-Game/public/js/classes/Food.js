import {DEBUG, END_X, END_Y, SCREEN_WIDTH, GRID, SCREEN_HEIGHT, X_OFFSET, Y_OFFSET, 
    COMBO_ADD_FLOOR, SPEED_WALK, SPEED_SPRINT, GState, PLAYER_STATS} from "../SnakeHole.js";
import { STAGE_OVERRIDES } from '../data/customLevels.js';

var Food = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Food (scene, pos) {
        Phaser.GameObjects.Sprite.call(this, scene);
        const ourInputScene = scene.scene.get("InputScene");

        this.setOrigin(0,0);
        this.setDepth(47);
        this.postFX.addShadow(-2, 6, 0.007, 1.2, 0x111111, 6, 1.5);

        this.play("atom05spawn");
        this.chain(['atom01idle']);
        

        this.electrons = scene.add.sprite().setOrigin(.22,.175).setDepth(48);
        this.electrons.playAfterDelay("electronIdle", Phaser.Math.RND.integerInRange(0,30) * 10);
        this.electrons.anims.msPerFrame = 66;
        this.electrons.visible = false;

        this.setPosition(pos.x, pos.y ); 
        scene.foodHistory.push([(pos.x - X_OFFSET) / GRID, (pos.y - Y_OFFSET) / GRID, ourInputScene.moveCount]);
        
        this.electrons.setPosition(pos.x, pos.y);
        scene.interactLayer[(this.x - X_OFFSET) / GRID][(this.y - Y_OFFSET) / GRID] = this;

        scene.atoms.add(this);

        scene.children.add(this); // Shows on screen
    },

    onOver: function(scene) {
        console.log('OVER AN ATOM')
        
        scene.snakeEating();
        
        var timeSinceFruit = scene.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
        
        if (scene.length === scene.lengthGoal -1) { //Check for final atom pickup

            scene.snake.head.x = scene.snake.previous[0];
            scene.snake.head.y = scene.snake.previous[1];
            
            //scene.gState = GState.TRANSITION;
            var _x = this.x;
            var _y = this.y;

            // start slowmo here
            scene.tweens.add({
                targets: scene.snake.head,
                x: _x,
                y: _y,
                duration: 1000,
                onComplete: () =>{
                    scene.victoryFanfare();
                    console.log('tween finished, start electrons')
                    scene.vortexIn(scene.snake.body, scene.snake.head.x, scene.snake.head.y);
                }
            })
        }

        if(timeSinceFruit > COMBO_ADD_FLOOR){
            if (scene.snake.lastPlayedCombo > 0) {
                scene.comboCounter += 1;
                scene.comboBounce();
                };
            scene.pointSounds[scene.snake.lastPlayedCombo].play();       
            if (scene.snake.lastPlayedCombo < 7) {
                scene.snake.lastPlayedCombo += 1;
            }
        }
        else {
            scene.snake.lastPlayedCombo = 0;
            scene.comboCounter = 0;
        }

        scene.events.emit('addScore', this); 
        scene.snake.grow(scene);

        // Avoid double _atom getting while in transition
        this.visible = false;

        this.move(scene);
        // Moves the eaten atom after a delay including the electron.
        this.delayTimer = scene.time.delayedCall(200, function () { // Amount of time in ms to delay next atom appearing
            if (scene.gState != GState.TRANSITION) {
                
                scene.interactLayer[(this.x - X_OFFSET) / GRID][(this.y - Y_OFFSET) / GRID] = this;
                this.anims.play("atom05spawn");  // Start the spawn animation
                this.chain(['atom01idle']);
                this.visible = true; //set newly spawned atom to visible once it's moved into position
            }

        }, [], this);


        if (scene.snake.body.length > 29) {
            PLAYER_STATS.atomsOverEaten += 1;
            if (scene.snake.body.length - 1 > PLAYER_STATS.longestBody) {
                PLAYER_STATS.longestBody = scene.snake.body.length - 1;
            }
        }

        if (scene.moveInterval = SPEED_WALK) {
            // Play atom sound
            var _index = Phaser.Math.Between(0, scene.atomSounds.length - 1);
            scene.atomSounds[_index].play();//Use "index" here instead of "i" if we want randomness back
        } else if (scene.moveInterval = SPEED_SPRINT) {
            
            // Play sniper sound here.
            // There are some moveInterval shenanigans happening here. 
            // Need to debug when exactly the move call happens compared to setting the movesInterval.
        }

        if (STAGE_OVERRIDES.has(scene.stage) && "afterEat" in STAGE_OVERRIDES.get(scene.stage)) {
                    STAGE_OVERRIDES.get(scene.stage).afterEat(scene, this);
        }
        
        return 'valid';
    },
    
    
    move: function (scene) {
        const ourInputScene = scene.scene.get("InputScene");

        this.prevX = this.x;
        this.prevY = this.y;

        scene.interactLayer[(this.x - X_OFFSET) / GRID][(this.y - Y_OFFSET) / GRID] = "empty";
        
        
        var validLocations = scene.validSpawnLocations();
        
        var pos = Phaser.Math.RND.pick(validLocations);

        this.setPosition(pos.x, pos.y );
        scene.foodHistory.push([(pos.x - X_OFFSET) / GRID, (pos.y - Y_OFFSET) / GRID, ourInputScene.moveCount]);
        //console.log(this.x,this.y)
        this.electrons.setPosition(pos.x, pos.y);
        //console.log(this.electrons.x,this.electrons.y)
       

        if (DEBUG) { // Reset Fruit Timer Text
            this.fruitTimerText.setPosition(this.x + GRID + 3 , this.y - 1); // Little Padding to like nice
        }

        if (STAGE_OVERRIDES.has(scene.stage) && "afterMoveFood" in STAGE_OVERRIDES.get(scene.stage)) {
            STAGE_OVERRIDES.get(scene.stage).afterMoveFood(scene, this);
}
    },

    startDecay: function(scene) {
        //this.electrons.play("electronIdle");
        //this.electrons.anims.msPerFrame = 66; // Setting electron framerate here to reset it after slowing in delay 2

        //this.chain(['atom05spawn', 'atom']);

            
        
        //this.decayStage01.destroy(); // Destory Old Timers
        //this.decayStage02.destroy();

        //this.decayStage01 = scene.time.addEvent({ delay: 1000, callback: fruit => {
            //this.electrons.setVisible(false);
            //this.play("atom02idle");
            //this.electrons.anims.msPerFrame = 112;
        //}, callbackScope: scene });

        //this.decayStage02 = scene.time.addEvent({ delay:2000, callback: fruit => {
            //this.play("atom03idle");
            //this.electrons.play("electronDispersion01");
        //this.decayStage03 = scene.time.addEvent({ delay: 7600, callback: fruit => {
            //this.play("atom04idle");
        //}, callbackScope: scene });
        //}, callbackScope: scene });

    },

});

export { Food };