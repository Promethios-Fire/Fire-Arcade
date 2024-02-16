import Phaser from "phaser";
import { Room, Client } from "colyseus.js";
import { BACKEND_URL } from "../backend";
import HealthBar from "../components/Healthbar";
import Snake from './snake.js'

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });

    this.room = {};
    
  }
  preload(){
      this.load.image("snakeHead","/assets/snakeHead.png")
      this.load.image("snakeHead32","/assets/snakeHead32.png")
      this.load.image("snakeBody","/assets/snakeBody.png")
      this.load.image("snakeBody32","/assets/snakeBody32.png")
      this.load.image("apple","/assets/apple.png")
      this.load.image("applex32","/assets/applex32.png")
      this.load.image("portalBlue","/assets/portalBlue.png")
      this.load.image("wallSing01","/assets/wallSingle01.png")
      this.load.image("wallSing01x32","/assets/wallSingle01x32.png")
  }
  create(){
      // await this.connect();
      this.snake = new Snake(this);
  }

  async connect() {
  // add connection status text
  const connectionStatusText = this.add
    .text(0, 0, "Trying to connect with the server...")
    .setStyle({ color: "#ff0000", fontSize: "18px" })
    .setPadding(4);

  const client = new Client(BACKEND_URL);
  try {
    this.room = await client.joinOrCreate("snake-server", {
      playerName: "Testing123",
    });
    // connection successful!
    connectionStatusText.destroy();
  } catch (e) {
    // couldn't connect
    connectionStatusText.text = "Could not connect with the server.";
  }
}

  update(time){
      this.snake.update(time);
  }
}