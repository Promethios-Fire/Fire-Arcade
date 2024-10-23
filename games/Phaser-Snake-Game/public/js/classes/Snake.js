import { GRID,  SCREEN_WIDTH, SCREEN_HEIGHT, GState,
    DIRS, DEBUG, commaInt,
    LENGTH_GOAL, SPEED_WALK, SPEED_SPRINT, COMBO_ADD_FLOOR,
    X_OFFSET,
    Y_OFFSET
} from "../SnakeHole.js";
import { Food } from "./Food.js";
import { Portal } from './Portal.js';

var Snake = new Phaser.Class({
    initialize:

    // #region Init
    function Snake (scene, x, y)
    {
        this.body = [];

        this.head = scene.add.image(x, y, 'snakeDefault', 0).setPipeline('Light2D');
        this.head.setOrigin(0,0).setDepth(48);

        
        this.body.unshift(this.head);

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
        
        scene.length += 1;
        scene.globalFruitCount += 1; // Run Wide Counter

        var length = `${scene.length}`;
        
        // Exception for Bonus Levels when the Length Goal = 0
        if (LENGTH_GOAL != 0) {
            scene.lengthGoalUI.setText(
                `${length.padStart(2, "0")}\n${LENGTH_GOAL.toString().padStart(2, "0")}`
            )
        }
        else {
            scene.lengthGoalUI.setText(`${length.padStart(2, "0")}`);
        }

        //scene.scale.gameSize.height += 24;
        //scene.scale.refresh()
        //debugger
        if (scene.boostOutlinesBody.length > 0) {
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
        

        var xN = this.head.x;
        var yN = this.head.y;

        
    if (this.direction === DIRS.LEFT)
        {
            xN = Phaser.Math.Wrap(this.head.x  - GRID, X_OFFSET, X_OFFSET + 29 * GRID);
            ourPersistScene.bgCoords.x -= .25;
        }
        else if (this.direction === DIRS.RIGHT)
        {
            xN = Phaser.Math.Wrap(this.head.x + GRID, X_OFFSET, X_OFFSET + 29 * GRID);
            ourPersistScene.bgCoords.x += .25;
        }
        else if (this.direction === DIRS.UP)
        {
            yN = Phaser.Math.Wrap(this.head.y - GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);
            ourPersistScene.bgCoords.y -= .25;
        }
        else if (this.direction === DIRS.DOWN)
        {
            yN = Phaser.Math.Wrap(this.head.y + GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);
            ourPersistScene.bgCoords.y += .25;
        }

        
        // #region Bonk Walls
        scene.map.setLayer(scene.wallVarient);
        var nextTile = scene.map.getTileAtWorldXY( xN, yN);
        //debugger
        
        if (nextTile != null && nextTile.properties.hasCollision && !scene.winned) {
            
            this.direction = DIRS.STOP;
            if (scene.bonkable) {
                this.bonk(scene);  
            }
        }


        // #region Bonk Ghost Walls
        if (scene.map.getLayer('Ghost-1')) {
            scene.map.setLayer("Ghost-1"); // When there are multiple version. Get the current one here.
            if (scene.map.getTileAtWorldXY( xN, yN )) {
            
        
                this.direction = DIRS.STOP;
                if (scene.bonkable) {
                    this.bonk(scene);   
                }
            }
        }

        // #region Intersect Self
        if (GState.PLAY === scene.gState) { //GState.PLAY
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
                    if (!portalSafe && scene.bonkable) {
                        this.bonk(scene);    
                    }  
                }
            }) 
        }
        // #endregion

        // Make Portal Snake body piece invisible. 
        // TODO redo this to check every move for if there is a portal using the interact layer.
        
        
        if (GState.PLAY === scene.gState && this.body.length > 2) { 
            var lastBodyNotTailGridX = (this.body[this.body.length -2].x - X_OFFSET) / GRID;
            var lastBodyNotTailGridY = (this.body[this.body.length -2].y - Y_OFFSET) / GRID;

            if (scene.interactLayer[lastBodyNotTailGridX][lastBodyNotTailGridY] instanceof Portal) {
                var portal = scene.interactLayer[lastBodyNotTailGridX][lastBodyNotTailGridY];
                portal.snakePortalingSprite.visible = false;
                portal.targetObject.snakePortalingSprite.visible = false;
            }

        }
    
        // Actually Move the Snake Head
        if (scene.gState != GState.BONK && this.direction != DIRS.STOP) {
                Phaser.Actions.ShiftPosition(this.body, xN, yN, this.tail);
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

        if (scene.gState === GState.PLAY && scene.interactLayer[onGridX][onGridY] != "empty") {
            scene.interactLayer[onGridX][onGridY].onOver(scene);
        }


        
        // Check for Blackholes
        if (scene.winned) {
            /**
             * Okay to not be part of the interact layer because there is only ever 8?
             */
            for (let index = 0; index < scene.nextStagePortals.length; index++) {
                
                if (scene.nextStagePortals[index] != undefined && (scene.nextStagePortals[index].x === this.head.x && scene.nextStagePortals[index].y === this.head.y)) {
                    debugger
                    console.log("ITS WARPING TIME to WORLD", "Index", index, scene.nextStagePortals[index]);
                    scene.warpToNext(index);
                }

                
            }
            if (scene.extractHole[0]) { //check that there is an extract hole
                if (scene.extractHole[0].x === this.head.x && scene.extractHole[0].y === this.head.y) {
                    console.log('WOO')
                    scene.finalScore();
                }
            }

        }

        // Update closet portal. I think it techinally is lagging behind because it follows the lights which are one step behind.
        // Not sure if it should stay that way or not.
        var checkPortals = [...scene.portals, ...scene.wallPortals]

        if (checkPortals.length > 1) {
            var testPortal = Phaser.Math.RND.pick(checkPortals);
            var dist = Phaser.Math.Distance.Between(this.snakeLight.x, this.snakeLight.y, 
                testPortal.x, testPortal.y);

            if (this.closestPortal === undefined) {
                this.closestPortal = testPortal;
                this.closestPortal.flipX = true;

                scene.tweens.add({
                    targets: this.closestPortal.targetObject.portalHighlight,
                    alpha: {from: 1, to: 0},
                    duration: 98,
                    ease: 'Sine.Out',
                    });
            }

            checkPortals.forEach( portal => {

                this.snakeLights.forEach( light => {

                    var distN = Phaser.Math.Distance.Between(light.x, light.y, portal.x, portal.y);

                    if (dist > distN) {
                        dist = distN;
                        testPortal = portal;
                    }

                });

            });

            if (this.closestPortal != testPortal) {
                //console.log("New Closest Portal:", testPortal.x, testPortal.y);
                var oldPortal = this.closestPortal;
                oldPortal.flipX = false;

                testPortal.flipX = true;

                scene.tweens.add({
                    targets: testPortal.targetObject.portalHighlight,
                    alpha: {from: 0, to: 1},
                    duration: 98,
                    ease: 'Sine.Out',
                    onStart: () =>{
                        scene.tweens.add({
                            targets: oldPortal.targetObject.portalHighlight,
                            alpha: {from: 1, to: 0},
                            duration: 300,
                            ease: 'Sine.Out',
                            });
                    }
                    });
                this.closestPortal = testPortal;

            }
            
        }

        // #region Coin Collision
        //for (let index = 0; index < scene.coins.length; index++) {
        //    
        //}

        // #region Food Collision
        //scene.atoms.forEach(_atom => {  
        //    if(this.head.x === _atom.x && this.head.y === _atom.y && GState.PLAY === scene.gState && _atom.visible === true){
        //        
        //});
    },

    // #region Bonk()
    bonk: function (scene) {
        const ourPersistScene = scene.scene.get('PersistScene');
        
        scene.gState = GState.BONK;
        this.direction = DIRS.STOP;
        console.log(scene.gState, "BONK" , this.direction);

        scene.screenShake();
        

        if (!scene.winned) {
            // @Overridable
            scene.onBonk(); 
        }

        scene.snakeCrash.play();    
        // game.scene.scene.restart(); // This doesn't work correctly
        if (DEBUG) { console.log("DEAD"); }
        
        scene.bonks += 1;
        
        // Do this when you want to really end the game.
        //game.destroy();
        //this.scene.restart();

        // If portalling interupted make sure all portal segments are invisible.
        scene.portals.forEach ( portal => {
            portal.snakePortalingSprite.visible = false;
        });

        scene.wallPortals.forEach ( portalWallSegment => {
            portalWallSegment.snakePortalingSprite.visible = false;

        });

        if (ourPersistScene.coins > -1) {
            scene.tweenRespawn = scene.vortexIn(this.body, scene.startCoords.x, scene.startCoords.y);
        }
    }
});

export { Snake };