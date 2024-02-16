const { Room } = require("colyseus");
const { InputData, Player, MainRoomState, Monster } = require("../states/main");

exports.default = class MainRoom extends Room {
  onCreate() {
    this.fixedTimeStep = 1000 / 60;
    this.autoDispose = false;
    this.setState(new MainRoomState());
    this.hurtId = 0;
    // set map dimensions
    this.state.mapWidth = 800;
    this.state.mapHeight = 600;
    this.currentTick = 0;
    this.onMessage(0, (client, input) => {
      // handle player input
      const player = this.state.players.get(client.sessionId);

      // enqueue input to user input buffer.
      player.inputQueue.push(input);
    });

    for (let i = 0; i < 1; i++) {
      const monster = new Monster(i);

      monster.x = 200 + i * 150;
      monster.y = 100;

      this.state.monsters.set(i, monster);
    }
    setInterval(() => {
      this.state.monsters.get(0).nextTickAttack = true;
    }, 5000);
    // this.onMessage(1, (client, input) => {
    //   // handle player input
    //   const player = this.state.players.get(client.sessionId);

    //   player.actionQueue.push("attack")

    // });

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });
  }

  fixedTick(timeStep) {
    
  }

  onJoin(client, options) {
    function randomIntFromInterval(min, max) {
      // min and max included
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    console.log(client.sessionId, "joined!");

    const player = new Player(client.sessionId);

    player.x = randomIntFromInterval(200, this.state.mapWidth - 200);
    player.y = 250;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client, consented) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  isColliding(obj1, obj2) {
    if (
      obj1.x < obj2.x + obj2.displayWidth &&
      obj1.x + obj1.displayWidth > obj2.x &&
      obj1.y < obj2.y + obj2.displayHeight &&
      obj1.displayHeight + obj1.y > obj2.y
    ) {
      return true;
    }
  }
};
