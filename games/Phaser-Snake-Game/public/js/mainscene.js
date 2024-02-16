
import Snake from './snake.js'

export default class MainScene extends Phaser.Scene{
    constructor() {
        super('MainScene')
        
        this.player
    }
    preload(){
        this.load.image("snakeHead","/assets/snakeHead.png")
        this.load.image("snakeHead32","/assets/snakeHead32.png")
        this.load.image("snakeBody","/assets/snakeBody.png")
        this.load.image("snakeBody32","/assets/snakeBody32.png")
        this.load.image("apple","/assets/apple.png")
        this.load.image("portalBlue","/assets/portalBlue.png")
        this.load.image("wallSing01","/assets/wallSingle01.png")
        this.load.image("wallSing01x32","/assets/wallSingle01x32.png")
    }
    create(){
        this.snake = new Snake(this);
    }

    update(time){
        this.snake.update(time);
    }
}