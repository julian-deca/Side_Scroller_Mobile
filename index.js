window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  const WIDTH = (canvas.width = 800);
  const HEIGHT = (canvas.height = 720);
  let enemies = [];
  let score = 0;
  let gameOver = false;

  class InputHandlers {
    constructor() {
      this.keys = [];
      this.touchY = "";
      this.touchTreshold = 30;
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowRight" ||
            e.key === "ArrowLeft") &&
          this.keys.indexOf(e.key) === -1
        ) {
          this.keys.push(e.key);
        } else if (e.key === "Enter" && gameOver) restartGame();
      });
      window.addEventListener("keyup", (e) => {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowLeft"
        ) {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
      });
      window.addEventListener("touchstart", (e) => {
        this.touchY = e.changedTouches[0].pageY;
      });
      window.addEventListener("touchmove", (e) => {
        const swipeDistance = e.changedTouches[0].pageY - this.touchY;
        if (
          swipeDistance < -this.touchTreshold &&
          this.keys.indexOf("swipe up") === -1
        )
          this.keys.push("swipe up");
        else if (
          swipeDistance > -this.touchTreshold &&
          this.keys.indexOf("swipe down") === -1
        ) {
          this.keys.push("swipe down");
          if (gameOver) restartGame();
        }
      });
      window.addEventListener("touchend", (e) => {
        console.log(this.keys);
        this.keys.splice(this.keys.indexOf("swipe up"), 1);
        this.keys.splice(this.keys.indexOf("swipe down"), 1);
      });
    }
  }
  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameHeight = gameHeight;
      this.gameWidth = gameWidth;
      this.width = 200;
      this.height = 200;
      this.x = 0;
      this.y = this.gameHeight - this.height;
      this.image = document.getElementById("player");
      this.frameX = 0;
      this.frameY = 1;
      this.speed = 0;
      this.vy = 0;
      this.weight = 1;
      this.maxFrame = 8;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
    }
    restart() {
      this.x = 100;
      this.y = this.gameHeight - this.height;
      this.maxFrame = 8;
      this.frameY = 0;
    }
    update(input, deltaTime, enemies) {
      enemies.forEach((enemy) => {
        const dx =
          enemy.x + enemy.width * 0.5 - 13 - (this.x + this.width * 0.5);
        const dy =
          enemy.y + enemy.height * 0.5 + 13 - (this.y + this.height * 0.5);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < enemy.width * 0.5 - 13 + this.width * 0.5) {
          gameOver = true;
        }
      });

      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else this.frameTimer += deltaTime;
      this.x += this.speed;
      if (input.keys.indexOf("ArrowRight") > -1) {
        this.speed = 5;
      } else if (input.keys.indexOf("ArrowLeft") > -1) {
        this.speed = -5;
      } else {
        this.speed = 0;
      }
      if (
        input.keys.indexOf("ArrowUp") > -1 ||
        (input.keys.indexOf("swipe up") > -1 && this.onGround())
      ) {
        console.log("aaaa");
        this.vy -= 32;
      }
      if (this.x < 0) this.x = 0;
      else if (this.x > this.gameWidth - this.width)
        this.x = this.gameWidth - this.width;

      this.y += this.vy;
      if (!this.onGround()) {
        this.vy += this.weight;
        this.maxFrame = 5;
        this.frameY = 1;
      } else {
        this.vy = 0;
        this.maxFrame = 8;

        this.frameY = 0;
      }
      if (this.y > this.gameHeight - this.height)
        this.y = this.gameHeight - this.height;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.width * this.frameX,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }
  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById("background");
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 20;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width - this.speed,
        this.y,
        this.width,
        this.height
      );
    }
    update() {
      this.x -= this.speed;
      if (this.x < 0 - this.width) this.x = 0;
    }
    restart() {
      this.x = 0;
    }
  }

  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameHeight = gameHeight;
      this.gameWidth = gameWidth;
      this.width = 160;
      this.height = 119;
      this.image = document.getElementById("enemy");
      this.x = this.gameWidth;
      this.y = gameHeight - this.height;
      this.maxFrame = 5;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 8;
      this.frameX = 0;
      this.markedForDeletion = false;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.width * this.frameX,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    update(deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer++;
      } else this.frameTimer += deltaTime;
      if (this.x < 0 - this.width) {
        score++;
        this.markedForDeletion = true;
      }
      this.x -= this.speed;
    }
  }
  function handleEnemies(deltaTime) {
    if (enemyTimer > enemyInterval + randomInterval) {
      enemies.push(new Enemy(WIDTH, HEIGHT));
      enemyTimer = 0;
    } else enemyTimer += deltaTime;
    enemies.forEach((enemy) => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });
    enemies = enemies.filter((enemy) => !enemy.markedForDeletion);
  }
  function displayStatusText(context) {
    context.textAlign = "left";
    context.fillStyle = "black";
    context.font = "40px Helvetica ";
    context.fillText("Score: " + score, 20, 50);
    context.fillStyle = "white";
    context.fillText("Score: " + score, 23, 53);
    if (gameOver) {
      context.textAlign = "center";
      context.fillStyle = "black";
      context.fillText("GAME OVER, your score is: " + score, WIDTH * 0.5, 200);
      context.fillStyle = "white";
      context.fillText(
        "GAME OVER, your score is: " + score,
        3 + WIDTH * 0.5,
        200 + 3
      );
      context.fillStyle = "black";
      context.fillText(
        "Press Enter or Swipe Down to Restart",
        WIDTH * 0.5,
        200 + 60
      );
      context.fillStyle = "white";
      context.fillText(
        "Press Enter or Swipe Down to Restart",
        WIDTH * 0.5 + 3,
        200 + 63
      );
    }
  }
  function restartGame() {
    player.restart();
    background.restart();
    enemies = [];
    score = 0;
    gameOver = false;
    animate(0);
  }
  const input = new InputHandlers();
  const player = new Player(WIDTH, HEIGHT);
  const background = new Background(WIDTH, HEIGHT);
  let lastTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 2000;
  let randomInterval = Math.random() * 1000 + 500;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    background.draw(ctx);
    background.update();

    player.draw(ctx);
    player.update(input, deltaTime, enemies);
    handleEnemies(deltaTime);
    displayStatusText(ctx);
    if (!gameOver) requestAnimationFrame(animate);
  }
  animate(0);
});
