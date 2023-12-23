import MainScene from "./mainscene.js";

const config = {
    width: 720,
    height: 720,
    type: Phaser.AUTO,
    parent: 'phaser-game',
    scene: [MainScene]
};

new Phaser.Game(config);
