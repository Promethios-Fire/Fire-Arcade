import { GRID,  SCREEN_WIDTH, SCREEN_HEIGHT, GState, updatePlayerStats,
    DIRS, DEBUG, commaInt,
    LENGTH_GOAL, PLAYER_STATS, SPEED_SPRINT, COMBO_ADD_FLOOR,
    X_OFFSET,
    Y_OFFSET,
} from "../SnakeHole.js";
import { STAGE_OVERRIDES } from '../data/customLevels.js';
import { Food } from "./Food.js";
import { Portal } from './Portal.js';

var Snake = new Phaser.Class({
    initialize:

    // #region Init
    function Snake (scene, x, y)
    {
        this.body = [];

        this.head = scene.add.image(x, y, 'snakeDefault', 0).setPipeline('Light2D');
        //set snake invisible so it can appear from blackhole
        this.head.setAlpha(0);
        this.head.setOrigin(0,0).setDepth(48);

        this.newHead = {};

        this.previous = [];

        this.body.unshift(this.head);
        this.criticalStateTween = scene.tweens.addCounter({
            from: 255,
            to: 0,
            yoyo: true,
            duration: 500,
            ease: 'Linear',
            repeat: -1,
            onUpdate: tween =>{
                const value = Math.floor(tween.getValue());
                const color1 = Phaser.Display.Color.RGBToString(200, value, value);
                //scene.coinUIText.node.style.color = color1;
                this.body.forEach((part) => {
                    part.setTint(Phaser.Display.Color.GetColor(200, value, value));
                });
            }
        });

        if (scene.scene.get("PersistScene").coins > 0) {
            this.criticalStateTween.pause();
        }
        
        //if (coins 0) {
        //    
        //}

        this.comboCounter = 0;

        this.lastPlayedCombo = 0;
        this.lastPortal = undefined; // Set
        this.closestPortal = undefined; // TYPE Portal.
        

        this.tail = new Phaser.Geom.Point(x, y); // Start the tail as the same place as the head.
        this.portalBodyParts = [];


        if (scene.DARK_MODE) {
            this.lightIntensity = 1.5
            this.lightDiameter = 192
        }
        else{
            this.lightIntensity = .75
            this.lightDiameter = 92
        }

        this.snakeLight = scene.lights.addLight(this.head.x, this.head.y, this.lightDiameter, 0xAF67FF).setIntensity(this.lightIntensity);
        this.snakeLightN = scene.lights.addLight(this.head.x, this.head.y + GRID * 27, this.lightDiameter, 0xAF67FF).setIntensity(this.lightIntensity);
        this.snakeLightE = scene.lights.addLight(this.head.x + GRID * 29, this.head.y, this.lightDiameter, 0xAF67FF).setIntensity(this.lightIntensity);
        this.snakeLightS = scene.lights.addLight(this.head.x, this.head.y - GRID * 27, this.lightDiameter, 0xAF67FF).setIntensity(this.lightIntensity);
        this.snakeLightW = scene.lights.addLight(this.head.x - GRID * 29, this.head.y, this.lightDiameter, 0xAF67FF).setIntensity(this.lightIntensity);

        this.snakeLights = [this.snakeLight, this.snakeLightN, this.snakeLightE, this.snakeLightS, this.snakeLightW];
    },
    
    // #region Grow
    grow: function (scene)
    {
        if (scene === undefined) {
            throw new Error("Error: No scene passed into Snake.grow()");
        }
        
        const ourSpaceBoy = scene.scene.get("SpaceBoyScene");
        scene.length += 1;
        scene.globalFruitCount += 1; // Run Wide Counter

        var length = `${scene.length}`;
        

        ourSpaceBoy.lengthGoalUI.setText(`${length.padStart(2, "0")}`);

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
        
        this.tail = this.body.slice(-1);

        
        // Add a new part at  the current tail position
        // The head moves away from the snake 
        // The Tail position stays where it is and then every thing moves in series
        var newPart = scene.add.sprite(this.tail.x*GRID, this.tail.y*GRID, 'snakeDefault', 8);
        newPart.setOrigin(0,0).setDepth(47).setPipeline('Light2D');
        //newPart.postFX.addShadow(-2, 6, 0.007, 1.2, 0x111111, 6, 1);

        
        

        if (this.body.length > 1){
            this.body[this.body.length -1].setTexture('snakeDefault',[1])
            
        }
        this.body.push(newPart);
        scene.applyMask();


    },
    
    // #region Move
    move: function (scene) {
        const ourPersistScene = scene.scene.get('PersistScene');
        this.previous = [this.head.x,this.head.y];
    
        // Alias x and y to the current head position
        let x = this.head.x;
        let y = this.head.y;

        // TODO: should be moved to after the movment? Also should follow the Head when Bonked.
        this.snakeLight.x = x + GRID/2;
        this.snakeLight.y = y + GRID/2;

        this.snakeLightN.x = x;
        this.snakeLightN.y = y + GRID * 27;

        this.snakeLightE.x = x + GRID * 29;
        this.snakeLightE.y = y;

        this.snakeLightS.x = x;
        this.snakeLightS.y = y - GRID * 27;

        this.snakeLightW.x = x - GRID * 29;
        this.snakeLightW.y = y;

        // wrapping tiles
        scene.map.setLayer(scene.wallVarient);
        

        // Look ahead for bonks
    
        let xN;
        let yN;

        
        switch (this.direction) {
            case DIRS.LEFT:
                yN = this.head.y;
                xN = Phaser.Math.Wrap(this.head.x  - GRID, X_OFFSET, X_OFFSET + 29 * GRID);
                ourPersistScene.bgCoords.x -= .25 * ourPersistScene.bgRatio;
                if (xN > this.head.x) {
                    //console.log("I AM WRAPPING LEFT");
                    PLAYER_STATS.eWraps += 1;
                }
                break;

            case DIRS.RIGHT:
                yN = this.head.y;
                xN = Phaser.Math.Wrap(this.head.x + GRID, X_OFFSET, X_OFFSET + 29 * GRID);
                ourPersistScene.bgCoords.x += .25 * ourPersistScene.bgRatio;
                if (xN < this.head.x) {
                    //console.log("I AM WRAPPING RIGHT");
                    PLAYER_STATS.wWraps += 1;
                }
                break;

            case DIRS.UP:
                xN = this.head.x;
                yN = Phaser.Math.Wrap(this.head.y - GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);
                ourPersistScene.bgCoords.y -= .25 * ourPersistScene.bgRatio;
                if (yN > this.head.y) {
                    //console.log("I AM WRAPPING UP");
                    PLAYER_STATS.nWraps += 1;
                }
                break;

            case DIRS.DOWN:
                xN = this.head.x;
                yN = Phaser.Math.Wrap(this.head.y + GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);
                ourPersistScene.bgCoords.y += .25 * ourPersistScene.bgRatio;
                if (yN < this.head.y) {
                    //console.log("I AM WRAPPING DOWN");
                    PLAYER_STATS.sWraps += 1;
                }
                break;
                
            default:
                //debugger; // UNCOMMENT THIS OUT BEFORE PUSH
                break;
        }

        
        // #region Bonk Walls
        scene.map.setLayer(scene.wallVarient);
        var nextTile = scene.map.getTileAtWorldXY( xN, yN);
        //debugger
        
        if (nextTile != null && nextTile.properties.hasCollision && !scene.winned) {
            
            this.direction = DIRS.STOP;
            if (scene.gameSettings.bonkable) {
                this.bonk(scene);  
            }
        }


        // #region Bonk Ghost Walls
        if (this.ghostWallLayer) {
            scene.map.setLayer("Ghost-1"); // When there are multiple version. Get the current one here.
            if (scene.map.getTileAtWorldXY( xN, yN )) {
            
        
                this.direction = DIRS.STOP;
                if (scene.gameSettings.bonkable) {
                    this.bonk(scene);   
                }
            }
        }

        // #region Intersect Self
        if (GState.PLAY === scene.gState && scene.gameSettings.collideSelf) { //GState.PLAY
            /***
             * Don't check the Tail because the Tail will always move out of the way
             * when the head moves forward.
             */
            var checkBody = this.body.slice(1);
            checkBody.pop();

            var nextHeadGridX = (xN - X_OFFSET) / GRID;
            var nextHeadGridY = (yN - Y_OFFSET) / GRID;

            var portalSafe = false; // Assume not on portal
            checkBody.some(part => {
                if (part.x === xN && part.y === yN) {
                    if(scene.interactLayer[nextHeadGridX][nextHeadGridY] instanceof Portal){
                        portalSafe = true; // Mark on portal
                    }
                    if (!portalSafe && scene.gameSettings.bonkable) {
                        this.bonk(scene);    
                    }
                    
                    return true;
                } else {
                    return false;
                }
            }) 
        }
        // #endregion

        /**
         * Interface requirement that all objects in the interative layer 
         * need an onOver method to work properly or be "empty".
         */ 
    
        // Actually Move the Snake Head
        if (scene.gState != GState.BONK && this.direction != DIRS.STOP && scene.gState != GState.TRANSITION) {
                 Phaser.Actions.ShiftPosition(this.body, xN, yN, this.tail);      
        }

    

        if (GState.PLAY === scene.gState && this.body.length > 2) { 
            
            var lastBodyNotTailGridX = (this.body[this.body.length -2].x - X_OFFSET) / GRID;
            var lastBodyNotTailGridY = (this.body[this.body.length -2].y - Y_OFFSET) / GRID;

            if (lastBodyNotTailGridX % 1 === 0 && lastBodyNotTailGridY % 1 === 0) {
                if (scene.interactLayer[lastBodyNotTailGridX][lastBodyNotTailGridY] instanceof Portal) {
                    var portal = scene.interactLayer[lastBodyNotTailGridX][lastBodyNotTailGridY];
                    portal.snakePortalingSprite.visible = false;
                    portal.targetObject.snakePortalingSprite.visible = false;
                } else {
                    
                }
            } else {
                // If this debugger triggers we know there is a problem somewhere.
                debugger
            }
        }
        /**
         * Interface requirement that all objects in the interative layer 
         * need an onOver function to work properly.
         */

        var onGridX = (this.head.x - X_OFFSET) / GRID;
        var onGridY = (this.head.y - Y_OFFSET) / GRID;
        //remove decimals to prevent erroring
        onGridX = Math.round(onGridX);
        onGridY = Math.round(onGridY);
        

        if (scene.gState === GState.PLAY && typeof scene.interactLayer[onGridX][onGridY].onOver === 'function') {
            // Only call if whatever is there has an onOver
            scene.interactLayer[onGridX][onGridY].onOver(scene);
        }


        
        // Check for Blackholes
        if (scene.winned) {
            debugger
            
            /**
             * Okay to not be part of the interact layer because there is only ever 8?
             */
            
            for (let index = 0; index < scene.nextStagePortals.length; index++) {

                
                if (scene.nextStagePortals[index] != undefined && (scene.nextStagePortals[index].x === this.head.x && scene.nextStagePortals[index].y === this.head.y)) {
                    
                    console.log("ITS WARPING TIME to WORLD", "Index", index, scene.nextStagePortals[index]);
                    scene.portals.forEach(portal => {
                        portal.portalHighlight.visible = false;
                    });

                    //portal.snakePortalingSprite.visible = false;
                    //portal.targetObject.snakePortalingSprite.visible = false;
                    scene.scene.get("PersistScene").stageHistory.push(scene.scene.get("ScoreScene").stageData);
                    updatePlayerStats()
                    scene.warpToNext(index);
                }

                
            }
            if (scene.extractHole) { //check that there is an extract hole
                if (scene.extractHole.x === this.head.x && scene.extractHole.y === this.head.y) {
                    console.log('WOO')
                    //scene.finalScore();
                    scene.scene.get("PersistScene").stageHistory.push(scene.scene.get("ScoreScene").stageData);
                    debugger // TODO Extract Prompt needs to handle Gauntlet Mode.
                    scene.extractPrompt(); // Maybe higher function that determines which to call.
                }
            }

        }

        // Update closest portal. I think it techinally is lagging behind because it follows the lights which are one step behind.
        // Not sure if it should stay that way or not.
        var checkPortals = [...scene.portals, ...scene.wallPortals]
        
        
       
        if (checkPortals.length > 1 && scene.gState === GState.PLAY) {
            var testPortal = Phaser.Math.RND.pick(checkPortals);
            var dist = Phaser.Math.Distance.Between(this.snakeLight.x, this.snakeLight.y, 
                testPortal.x, testPortal.y);

            if (this.closestPortal === undefined) {
                this.closestPortal = testPortal;
                
                /*scene.tweens.add({
                    targets: this.closestPortal.targetObject.portalHighlight,
                    alpha: {from: this.closestPortal.targetObject.portalHighlight.alpha,
                         to: 0},
                    duration: 98,
                    ease: 'Sine.Out',
                    });*/
            }

            checkPortals.forEach( portal => {
                //console.log(portal.targetObject.anims)

                this.snakeLights.forEach( light => {

                    var distN = Phaser.Math.Distance.Between(light.x, light.y, portal.x, portal.y);
                    
                    if (dist > distN) {
                        dist = distN;
                        testPortal = portal;
                        this.newHead = light;
                    }
                });

            });

            scene.portals.forEach(portal => {

                let _dist = Phaser.Math.Distance.Between(this.newHead.x, this.newHead.y,
                    portal.x, portal.y);
                    // normalized code to be used at a later point
                    /*const distNormalized = Phaser.Math.Clamp(
                    (_dist - 0) / (600 - 0), 
                    0, 1
                    );*/
                if (scene.gState != GState.PORTAL) {
                    switch (true) {
                        case _dist > GRID * 5:
                            
                            portal.anims.msPerFrame = 125; // 125
                            break;
                        case _dist > GRID * 3:
                            portal.anims.msPerFrame = 32;
                            break;
                        case _dist > GRID * 0:
                            portal.anims.msPerFrame = 16;
                            break;
                    
                        default:
                            break;
                    }   
                }
                

                if (portal.targetObject.portalTimerRunning === false) { // && portal.canHighlight === true) {

                    var minFrameRate = 32; 
                    var maxFrameRate = 64;
                    
                    //removing portal speed up until it's bug-free
                    /*portal.targetObject.anims.msPerFrame = Phaser.Math.Clamp(
                        _dist, minFrameRate, maxFrameRate);
                    portal.targetObject.portalHighlight.anims.msPerFrame = 
                        portal.targetObject.anims.msPerFrame;*/
                    
                    portal.targetObject.portalHighlight.alpha = 
                        1 - Phaser.Math.Clamp(_dist / maxFrameRate / 2 , -0.5, 1.5);
                    
                    //console.log(portal.targetObject.portalHighlight.alpha);
                }  
                else {
                    //portal.anims.msPerFrame = 128;
                    //portal.portalHighlight.anims.msPerFrame =  128;

                    //portal.portalHighlight.alpha = 0;
                }
            });
            

            /*scene.tweens.add({
                targets: testPortal.targetObject.portalHighlight,
                //alpha: {from: testPortal.targetObject.portalHighlight.alpha,
                //  to: 1},
                duration: 98,
                ease: 'Sine.Out',
                onStart: () =>{
                    scene.tweens.add({
                        targets: oldPortal.targetObject.portalHighlight,
                        alpha: {from: oldPortal.targetObject.portalHighlight.alpha,
                                to: 0},
                        duration: 200,
                        ease: 'Sine.Out',
                    });
                }
            })*/
            if (this.closestPortal != testPortal) {
                //console.log("New Closest Portal:", testPortal.x, testPortal.y);
                var oldPortal = this.closestPortal;
                this.closestPortal = testPortal;

                /*if (dist < 72) {
                    scene.tweens.add({
                        targets: testPortal.targetObject.portalHighlight,
                        alpha: {from: testPortal.targetObject.portalHighlight.alpha,
                        to: 1},
                        duration: 98,
                        ease: 'Sine.Out',
                        onStart: () =>{
                            testPortal.targetObject.portalTimerRunning = true;
                            testPortal.targetObject.portalHighlight.alpha = 1;
                            scene.time.delayedCall(240, () => { 
                                testPortal.targetObject.portalTimerRunning = false; }, scene);
                        }  
                    });
                }*/
                }
            }

        if (STAGE_OVERRIDES.has(scene.stage) && "afterMove" in STAGE_OVERRIDES.get(scene.stage).methods) {
            STAGE_OVERRIDES.get(scene.stage).methods.afterMove(scene);
        }
    },

    // #region Bonk()
    bonk: function (scene) {
        const ourPersistScene = scene.scene.get('PersistScene');
        const musicPlayer = scene.scene.get('MusicPlayerScene');
        
        this.direction = DIRS.STOP;
        scene.screenShake();

        if (ourPersistScene.coins === 1) {
            debugger
            musicPlayer.nextSong(`track_175`);
            this.criticalStateTween.resume();
        }

        if (!scene.stopOnBonk) {

            scene.gState = GState.BONK;
            scene.scene.get("InputScene").moveHistory.push(["BONK"]);

            //reset portal visuals on bonk
            debugger
            scene.portals.forEach(portal => {
                portal.portalHighlight.alpha = 0;
                console.log(portal.portalHighlight.alpha);

                portal.anims.msPerFrame = 128;

                // If portalling interupted make sure all portal segments are invisible.
                portal.snakePortalingSprite.visible = false;
            });
            //console.log(scene.gState, "BONK" , this.direction);

            if (!scene.winned) {
                // @Overridable
                scene.onBonk();
                console.log('BONK')
            }
    
            scene.snakeCrash.play();    
            // game.scene.scene.restart(); // This doesn't work correctly
            if (DEBUG) { console.log("DEAD"); }
            
            
            scene.portals.forEach ( portal => {
                
            });
    
            scene.wallPortals.forEach ( portalWallSegment => {
                portalWallSegment.snakePortalingSprite.visible = false;
            });
    
            if (ourPersistScene.coins > -1) {
                scene.tweenRespawn = scene.vortexIn(this.body, scene.startCoords.x, scene.startCoords.y, 500);
            
                scene.tweenRespawn.on("complete", () => {

                    var ourGame = this.head.scene;
                    
                    if (ourGame.scene.get("PersistScene").coins > 0) {
                        ourGame.coinsUIIcon.setVisible(true)
                    }
                    
                    // Turn back on arrows
                    ourGame.events.emit("spawnArrows", ourGame.snake.head);
    
                    ourGame.gState = GState.WAIT_FOR_INPUT;
                    ourGame.scoreTimer.paused = true;
                    //console.log(this.gState, "WAIT FOR INPUT");

                    if (STAGE_OVERRIDES.has(scene.stage) && "afterBonk" in STAGE_OVERRIDES.get(scene.stage).methods) {
                        STAGE_OVERRIDES.get(scene.stage).methods.afterBonk(scene);
                    }

                });
            }

        } else {
            this.gState = GState.WAIT_FOR_INPUT;
        }

        scene.bonks += 1;
        
    }
});

export { Snake };