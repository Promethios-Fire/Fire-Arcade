import {GRID, PLAYER_STATS, X_OFFSET, Y_OFFSET, commaInt} from "../SnakeHole.js";

var Coin = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Coin(scene, coinArray, x, y) {
        Phaser.GameObjects.Sprite.call(this, scene);

        
        this.setPosition(x, y);
        this.setOrigin(-.08333,0.1875);
        this.setDepth(21);
        this.setTexture('coinPickup01Anim.png');
        this.play('coin01idle');

        if (scene.scene.get("SpaceBoyScene").invSettings.get("skullMult") === 5) {
            this.setTint(0xBB0808);
        }


        scene.tweens.add( {
            targets: this,
            originY: [0.1875 - .0466,0.1875 + .0466],
            ease: 'sine.inout',
            duration: 500,
            yoyo: true,
            repeat: -1,
           })

        coinArray.add(this);
        
        scene.children.add(this);
        
    },
    onOver: function(scene) {
        const ourPersistScene = scene.scene.get('PersistScene');
        //var _coin = scene.coins[index];
        //console.log("Hit Coin");
        scene.coinSound.play();
        //this.snakeCritical = false;

        if (ourPersistScene.coins === 0) {
            scene.scene.get("MusicPlayerScene").music.stop();
            scene.scene.get("MusicPlayerScene").nextSong();
            scene.snake.criticalStateTween.pause();
            scene.snake.body.forEach((part) => {
                part.clearTint();
            });
        }

        var skullMult = scene.scene.get("SpaceBoyScene").invSettings.get("skullMult");

        ourPersistScene.coins += 1 * skullMult;
        PLAYER_STATS.totalCoinsCollected += 1 * skullMult;
        if (ourPersistScene.coins > 0) {
            scene.coinsUIIcon.setVisible(true);
        }

        scene.coinUIText.setHTML(
            `${commaInt(ourPersistScene.coins).padStart(2, '0')}`
        )

        scene.interactLayer[(this.x - X_OFFSET)/GRID][(this.y - Y_OFFSET)/GRID] = "empty";

        scene.coinsArray.delete(this);

        this.destroy();
        
        //scene.coins.splice(index,1);

    },
});


export { Coin };

        