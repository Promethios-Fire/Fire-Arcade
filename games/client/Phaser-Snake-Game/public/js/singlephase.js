import MainScene from "./mainscene.js";

const config = {
    width: 768,
    height: 768,
    type: Phaser.AUTO,
    parent: 'phaser-game',
    physics: {
        default: 'arcade',
        matter: {
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    scene: [MainScene]
};

new Phaser.Game(config);
