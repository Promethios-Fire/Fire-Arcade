import {DEBUG, END_X, END_Y, SCREEN_WIDTH, GRID, SCREEN_HEIGHT, X_OFFSET, Y_OFFSET, 
    COMBO_ADD_FLOOR, SPEED_WALK, SPEED_SPRINT, GState, PLAYER_STATS, MODES,
    PERSISTS, SPACE_BOY, INPUT,
    SOUND_RANK} from "../SnakeHole.js";
import { STAGE_OVERRIDES } from '../data/customLevels.js';

var Food = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Food (scene, pos) {
        Phaser.GameObjects.Sprite.call(this, scene);

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
        scene.foodHistory.push([(pos.x - X_OFFSET) / GRID, (pos.y - Y_OFFSET) / GRID, INPUT.moveCount]);
        
        this.electrons.setPosition(pos.x, pos.y);
        scene.interactLayer[(this.x - X_OFFSET) / GRID][(this.y - Y_OFFSET) / GRID] = this;

        scene.atoms.add(this);

        scene.children.add(this); // Shows on screen
    },

    onOver: function(scene) {
        //console.log('OVER AN ATOM')
        
        scene.snakeEating();
        
        var timeSinceFruit = scene.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
        
        scene.scoreTimer.paused = true

        if(timeSinceFruit > COMBO_ADD_FLOOR && scene.scoreHistory.length > 0){

            scene.snake.comboCounter++;
            scene.scene.get("PinballDisplayScene").comboCountText.setText(scene.snake.comboCounter);
            
            if (scene.snake.lastPlayedCombo > 0) {
                scene.scene.get("PinballDisplayScene").comboBounce();
            };

            scene.pointSounds[scene.snake.lastPlayedCombo].play();
            
            if (scene.snake.lastPlayedCombo < 7) {
                scene.snake.lastPlayedCombo += 1;
            }  
        }
        
        if (scene.length === scene.lengthGoal -1 && scene.mode != MODES.TUTORIAL) { //Check for final atom pickup

            scene.winned = true;

            var tempSounds = [];

            // Placeholder winning sounds. Should be its own sound. and music?

            SOUND_RANK.forEach(soundID => {
            tempSounds.push(scene.sound.add(soundID[0]));
            });
            tempSounds[4].play();

            scene.gState = GState.TRANSITION;
            

            //scene.snake.head.x = scene.snake.previous[0];
            //scene.snake.head.y = scene.snake.previous[1];
            
            //scene.gState = GState.TRANSITION;
            var _x = this.x;
            var _y = this.y;

            // start slowmo here
            
            scene.tweens.add({
                targets: scene.snake.head,
                x: {from: scene.snake.previous[0], to:_x },
                y: { from: scene.snake.previous[1], to:_y },
                duration: 800,
                onComplete: () =>{
                    
                    const ourStartScene = scene.scene.get('StartScene');
                    
                    scene.events.emit('addScore', this, timeSinceFruit);
                    scene.playAtomSound();
                    this.electrons.visible = false;

                    var finalAtom = SPACE_BOY.add.sprite(this.x, this.y).setOrigin(0,0);
                    finalAtom.play("atom02idle", this.frame.name)
                    finalAtom.setDepth(100);                    

                    var finalAtomTween = SPACE_BOY.tweens.add( {
                        targets: finalAtom,
                        x: SPACE_BOY.scoreFrame.getCenter().x,
                        y: SPACE_BOY.scoreFrame.getCenter().y,
                        duration: 750,
                        delay: 0,
                        ease: 'Expo.easeIn',
                        onComplete: () => {
                            scene.snake.grow(scene);
                            finalAtom.destroy();
                            scene.events.emit('win');
                        
                            // Store speed values
                            let _walkSpeed = scene.speedWalk;
                            let _sprintSpeed = scene.speedSprint;
                    
                            // Store initial camera position
                            let initialCameraX = scene.cameras.main.scrollX;
                            let initialCameraY = scene.cameras.main.scrollY
                    
                            // Start slowMoValCopy at 1 (default time scale). It's copied to preserve its value outside the tween
                            var slowMoValCopy = 1;
                    
                            var finalFanfare = false;
                    
                            switch (true) {
                                case scene.mode === MODES.CLASSIC || scene.mode === MODES.EXPERT || scene.mode === MODES.TUTORIAL:
                                    if (scene.nextStagePortalLayer.findByIndex(616)){
                                        finalFanfare = true;
                                    }
                                    break;
                                case scene.mode === MODES.GAUNTLET:
                                    if (PERSISTS.gauntlet.length === 0) {
                                        finalFanfare = true;
                                    }
                                    break;
                                case scene.mode === MODES.PRACTICE:
                                    finalFanfare = false;
                                    break;
                            
                                default:
                                    debugger // Saftey Break. Don't remove.
                                    break;
                            }
                    
                    
                            if (!finalFanfare){
                                // #region Fanfare 
                                // normal ending
                                // Slow Motion Tween -- slows down all tweens and anim timeScales withing scene
                                scene.slowMoTween = scene.tweens.add({
                                    targets: { value: 1 },
                                    value: 0.2,
                                    duration: 500,
                                    yoyo: true,
                                    ease: 'Sine.easeInOut',
                                    repeat: 0,
                                        onUpdate: (tween) => {
                                            let slowMoValue = tween.getValue();
                                            slowMoValCopy = slowMoValue;
                    
                                            // Apply the interpolated slowMoValue to all the timeScales
                                            scene.tweens.timeScale = slowMoValue;
                                            scene.anims.globalTimeScale = slowMoValue;
                                            scene.speedWalk = _walkSpeed  / slowMoValue;
                                            scene.speedSprint = _sprintSpeed / slowMoValue;
                                            if (scene.starEmitterFinal) {
                                                scene.starEmitterFinal.timeScale = slowMoValue;
                                            }
                                        },
                                        onComplete: () => {
                                            console.log('Slow motion effect completed');
                                            scene.tweens.timeScale = 1;
                                            scene.anims.globalTimeScale = 1;
                                            scene.speedWalk = _walkSpeed;
                                            scene.speedSprint = _sprintSpeed;
                                            if (scene.starEmitterFinal) {
                                                scene.starEmitterFinal.timeScale = 1;
                                            }
                                        }
                                        
                                    });
                                    //scene.gState = GState.PLAY;
                    
                                }
                            else {
                                // #region Final Fare
                                // Slow Motion Tween -- slows down all tweens and anim timeScales withing scene
                                scene.snake.criticalStateTween.pause(); // stop flashing red if it exists
                                console.log('should rainbow right now fr')
                                scene.slowMoTween = scene.tweens.add({
                                    targets: { value: 1 },
                                    value: 0.2,
                                    duration: 500,
                                    yoyo: true,
                                    ease: 'Sine.easeInOut',
                                    repeat: 0,
                                        onUpdate: (tween) => {
                                            // Camera Restraints/Bounds -- isn't needed if not zooming
                                            //scene.cameras.main.setBounds(0, 0, 240, 320);
                                            //SPACE_BOY.cameras.main.setBounds(0, 0, 240, 320);
                                            //PERSISTS.cameras.main.setBounds(0, 0, 240, 320);
                    
                                            let slowMoValue = tween.getValue();
                                            slowMoValCopy = slowMoValue;
                    
                                            // Apply the interpolated slowMoValue to all the timeScales
                                            scene.tweens.timeScale = slowMoValue;
                                            scene.anims.globalTimeScale = slowMoValue;
                                            scene.speedWalk = _walkSpeed  / slowMoValue;
                                            scene.speedSprint = _sprintSpeed / slowMoValue;
                                            if (scene.starEmitterFinal) {
                                                scene.starEmitterFinal.timeScale = slowMoValue;
                                            }
                                            // Camera Zoom
                                            //scene.cameras.main.zoom = 1 + (1 / slowMoValue - 1) * 0.05
                                            //SPACE_BOY.cameras.main.zoom = 1 + (1 / slowMoValue - 1) * 0.05
                                            //PERSISTS.cameras.main.zoom = 1 + (1 / slowMoValue - 1) * 0.05
                                            
                                            // Continuously interpolate the camera's position to the snake's head -- not needed
                                            //let targetX = scene.snake.head.x - scene.cameras.main.width / 2;
                                            //let targetY = scene.snake.head.y - scene.cameras.main.height / 2;
                    
                                            /*if (slowMoValue <= 0.5) {
                                                scene.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, scene.electronFanfare.x - scene.cameras.main.width / 2, 1);
                                                scene.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, scene.electronFanfare.y - scene.cameras.main.height / 2, 1);
                    
                                                SPACE_BOY.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, scene.electronFanfare.x - scene.cameras.main.width / 2, 1);
                                                SPACE_BOY.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, scene.electronFanfare.y - scene.cameras.main.height / 2, 1);
                    
                                                PERSISTS.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, scene.electronFanfare.x - scene.cameras.main.width / 2, 1);
                                                PERSISTS.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, scene.electronFanfare.y - scene.cameras.main.height / 2, 1);
                                            } 
                                            else {
                                                scene.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, 0, 0.01);
                                                scene.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, 0, 0.01);
                    
                                                SPACE_BOY.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, 0, 0.01);
                                                SPACE_BOY.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, 0, 0.01);
                                                
                                                PERSISTS.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, 0, 0.01);
                                                PERSISTS.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, 0, 0.01);
                                            }*/
                                        // Set scrollFactor to 1 for all game objects if using zoom-in
                                            // Get all game objects in the scene
                                            /*scene.children.list.forEach((child) => {
                                                // Check if the child object has a scroll factor property set to 0
                                                if (child.scrollFactorX === 0 && child.scrollFactorY === 0) {
                                                    child.setScrollFactor(1);
                                                    scene.UIScoreContainer.setScrollFactor(1);
                                                    }
                                                });
                                                // Iterate over each child in the container and set the scroll factor to 1
                                                scene.UIScoreContainer.each((child) => {
                                                    child.setScrollFactor(1);
                                            });*/
                                        },
                                        onComplete: () => {
                                            console.log('Slow motion effect completed');
                                            
                                            scene.tweens.timeScale = 1;
                                            scene.anims.globalTimeScale = 1;
                                            scene.speedWalk = _walkSpeed;
                                            scene.speedSprint = _sprintSpeed;
                                            if (scene.starEmitterFinal) {
                                                scene.starEmitterFinal.timeScale = 1;
                                            }
                                            
                                            scene.hsv = Phaser.Display.Color.HSVColorWheel();
                                            const spectrum = Phaser.Display.Color.ColorSpectrum(360);
                                            var colorIndex = 0;
                                            var color = spectrum[colorIndex];
                    
                                            scene.fxBoost = scene.boostBar.preFX.addColorMatrix();
                    
                                            scene.tweens.addCounter({
                                                from: 0,
                                                to: 360,
                                                duration: 3000,
                                                loop: -1,
                                                onUpdate: (tween) => {
                                                    let hueValue = tween.getValue();
                                                    scene.fxBoost.hue(hueValue);
                                            
                                                    // Update each segment's tint with an offset and apply pastel effect
                                                    scene.snake.body.forEach((part, index) => {
                                                        // Add an offset to the hue for each segment
                                                        let partHueValue = (hueValue + index * 12.41) % 360;
                                            
                                                        // Reduce saturation and increase lightness
                                                        let color = Phaser.Display.Color.HSVToRGB(partHueValue / 360, 0.5, 1); // Adjusted to pastel
                                            
                                                        if (color) {// only update color when it's not null
                                                            part.setTint(color.color);
                                                        }
                                                    });
                                                }
                                            });
                                            
                                            /*scene.electronFanfare = SPACE_BOY.add.sprite(SPACE_BOY.scoreFrame.getCenter().x -3,SPACE_BOY.scoreFrame.getCenter().y)
                                                .setDepth(100);
                                            scene.electronFanfare.play('electronFanfareIdle');*/
                    
                                            /*scene.cameras.main.scrollX = 0;
                                            scene.cameras.main.scrollY = 0;
                    
                                            SPACE_BOY.cameras.main.scrollX = 0;
                                            SPACE_BOY.cameras.main.scrollY = 0;
                    
                                            PERSISTS.cameras.main.scrollX = 0;
                                            PERSISTS.cameras.main.scrollY = 0;*/
                                            SPACE_BOY.CapSparkFinale = SPACE_BOY.add.sprite(X_OFFSET + GRID * 9 -3, GRID * 1.5).play(`CapSparkFinale`).setOrigin(.5,.5)
                                            .setDepth(100);
                                            
                                            scene.gState = GState.PLAY;
                                    }
                                });
                    
                                // check for extractHole so it doesn't fanfare in gauntlet and other modes
                                if (scene.extractHole) {
                                    // atomic comet
                                    SPACE_BOY.atomComet = SPACE_BOY.add.sprite(scene.snake.head.x + 6,scene.snake.head.y + 6)
                                    .setDepth(100);
                                    SPACE_BOY.atomComet.play('atomCometSpawn');
                                    SPACE_BOY.atomComet.chain(['atomCometIdle']);
                    
                    
                                    // rainbow electronFanfare
                                    SPACE_BOY.electronFanfare = SPACE_BOY.add.sprite(scene.snake.head.x + 6,scene.snake.head.y + 6)
                                    .setDepth(100);
                                    SPACE_BOY.electronFanfare.play('electronFanfareForm');
                                    
                    
                                    // emit stars from electronFanfare
                                    scene.starEmitterFinal = scene.add.particles(6,6,"twinkle01", { 
                                        speed: { min: -20, max: 20 },
                                        angle: { min: 0, max: 360 },
                                        alpha: { start: 1, end: 0 },
                                        anim: 'starIdle',
                                        lifespan: 1000,
                                        follow: SPACE_BOY.electronFanfare,
                                    }).setFrequency(150,[1]).setDepth(1);
                    
                                    scene.countDown.setAlpha(0);
                                }
                    
                            scene.tweens.add({ //slower one-off snakeEating tween
                                targets: scene.snake.body, 
                                scale: [1.25,1],
                                yoyo: false,
                                duration: 128,
                                ease: 'Linear',
                                repeat: 0,
                                timeScale: slowMoValCopy,
                                delay: scene.tweens.stagger(scene.speedSprint),
                                onUpdate: (tween) => {
                                    scene.timeScale = slowMoValCopy /2;
                                }
                            });
                    
                            // Atomic Comet and Electron Fanfare Tween
                            if (SPACE_BOY.electronFanfare) {
                                SPACE_BOY.electronFanfare.on('animationcomplete', (animation, frame) => {
                                    if (animation.key === 'electronFanfareForm') {
                                        scene.tweens.add({
                                            targets: [SPACE_BOY.electronFanfare,SPACE_BOY.atomComet],
                                            x: SPACE_BOY.scoreFrame.getCenter().x -6,
                                            y: SPACE_BOY.scoreFrame.getCenter().y,
                                            ease: 'Sine.easeIn',
                                            duration: 1250,
                                            onComplete: () => {
                                                scene.countDown.setAlpha(1);
                                                scene.countDown.x = X_OFFSET + GRID * 4 - 6;
                                                scene.countDown.y = 3;
                                                SPACE_BOY.atomComet.destroy();
                                            }
                                        });
                                                scene.countDown.setHTML('W1N');
                                                scene.countDown.x += 3
                                        }
                                        
                                });
                    
                                SPACE_BOY.electronFanfare.chain(['electronFanfareIdle']);
                                }
                            }
                    
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
                            
                            console.log('tween finished, start electrons');
                            debugger
                            scene.vortexIn(scene.snake.body, _x, _y);
                        }
                    });
                }
            })
            
        } else {
            // Not the last Atom. > or < LENGTH GOAL
            if (!scene.winned) {
                scene.events.emit('addScore', this, timeSinceFruit); 
            }
        
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

            if (scene.snake.body.length > 28) {
                PLAYER_STATS.atomsOverEaten += 1;
                if (scene.snake.body.length - 1 > PLAYER_STATS.longestBody) {
                    PLAYER_STATS.longestBody = scene.snake.body.length - 1;
                }
            }
            scene.playAtomSound();

            
        }
        
        if (STAGE_OVERRIDES.has(scene.stage) && "afterEat" in STAGE_OVERRIDES.get(scene.stage).methods) {
                    STAGE_OVERRIDES.get(scene.stage).methods.afterEat(scene, this);
        }

        scene.checkWinCon();
        
        return 'valid';
    },
    
    
    move: function (scene) {

        this.prevX = this.x;
        this.prevY = this.y;

        scene.interactLayer[(this.x - X_OFFSET) / GRID][(this.y - Y_OFFSET) / GRID] = "empty";
        
        
        var validLocations = scene.validSpawnLocations();
        
        var pos = Phaser.Math.RND.pick(validLocations);

        this.setPosition(pos.x, pos.y );
        scene.foodHistory.push([(pos.x - X_OFFSET) / GRID, (pos.y - Y_OFFSET) / GRID, INPUT.moveCount]);
        //console.log(this.x,this.y)
        this.electrons.setPosition(pos.x, pos.y);
        //console.log(this.electrons.x,this.electrons.y)
       

        if (DEBUG) { // Reset Fruit Timer Text
            this.fruitTimerText.setPosition(this.x + GRID + 3 , this.y - 1); // Little Padding to like nice
        }

        if (STAGE_OVERRIDES.has(scene.stage) && "afterMoveFood" in STAGE_OVERRIDES.get(scene.stage).methods) {
            STAGE_OVERRIDES.get(scene.stage).methods.afterMoveFood(scene, this);
}
    },
});

export { Food };