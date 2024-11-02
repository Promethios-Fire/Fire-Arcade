import { PLAYER_STATS, RANKS } from "../SnakeHole.js";


export var QUICK_MENUS = new Map([
    /*
    ["adventure-mode", new Map([
        ["Normal", function () {
        }],
    ])]
    */
    ["adventure-mode", new Map([
        ["Adventure", function () {
            // Do Stuff
        }],
    ])],
    ["tab-menu", new Map([
        ['BACK TO MAIN MENU', function () {
            // hide the extract prompt
            ourGameScene.menuElements.forEach(textElement =>{
                textElement.setAlpha(0);
            });
            ourGameScene.promptText.setAlpha(0);
            ourGameScene.qPanel.setVisible(false);
            console.log("BACK TO MAIN MENU");

            // Clear for reseting game
            ourGame.events.off('addScore');
            ourGame.events.off('spawnBlackholes');
            
            ourGameScene.scene.start("MainMenuScene");
            return true;
        }],
        [`RETURN TO STAGE`, function () {  
            // hide the extract prompt
            ourGameScene.menuElements.forEach(textElement =>{
                textElement.setAlpha(0);
            });
            ourGameScene.promptText.setAlpha(0);
            ourGameScene.qPanel.setVisible(false);
            // show the level labels again 
            console.log("RETURN TO STAGE");
        }],
        ['REDO STAGE (- 1 Coin)', function () {
            ourGameScene.menuElements.forEach(textElement =>{
                textElement.setAlpha(0);
            });
            ourGameScene.promptText.setAlpha(0);
            ourGameScene.qPanel.setVisible(false);

            if (ourGameScene.scene.get("PersistScene").coins > 0) {

                ourGameScene.scene.get("PersistScene").coins -= 1;
                ourGameScene.scene.get("PersistScene").loseCoin();
                
                // Clear for reseting game
                ourGame.events.off('addScore');
                ourGame.events.off('spawnBlackholes');

                ourGameScene.scene.restart( {
                    stage: ourGameScene.stage, 
                    score: ourGameScene.stageStartScore, 
                    //lives: this.lives 
            });
            }

            

        }],
        ['RESTART ADVENTURE', function () {
            // TODO: send to origin
            ourGameScene.menuElements.forEach(textElement =>{
                textElement.setAlpha(0);
            });
            ourGameScene.promptText.setAlpha(0);
            ourGameScene.qPanel.setVisible(false);

            // Clear for reseting game
            ourGame.events.off('addScore');
            ourGame.events.off('spawnBlackholes');
            
            // Restart  
            ourGameScene.scene.start("GameScene", {
                stage: START_STAGE,
                score: 0,
                startupAnim: true,
            });
            return true;
        }],
    ])],
]);