import MainScene from "./mainscene.js";

const config = {
    width: 768,
    height: 768,
    type: Phaser.AUTO,
    parent: 'phaser-game',
    scene: [MainScene]
};

new Phaser.Game(config);
