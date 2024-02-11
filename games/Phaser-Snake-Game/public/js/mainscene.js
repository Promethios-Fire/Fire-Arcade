
import Snake from './snake.js'

export default class MainScene extends Phaser.Scene{
    constructor() {
        super('MainScene')

        this.player
    }
    preload(){
        this.load.image("snakeHead","/assets/snakeHead.png")
        this.load.image("snakeBody","/assets/snakeBody.png")
    }
    create(){
        this.snake = new Snake(this);
    }

    update(time){
        this.snake.update(time);
    }
}