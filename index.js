const canvas = document.querySelector("#game-container");
const ctx = canvas.getContext("2d");
const modal = document.querySelector("#modal");
const scoreDisplay = document.querySelector("#score");
const restartButton = document.querySelector("#restart"); 
let gameOver = false;

canvas.width = innerWidth;
canvas.height = innerHeight;

// Create Entity (the circles)
class Entity {
  constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = "red";
  }
  draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
  }
}

// Create central Red Dot Player
class Player extends Entity{
  constructor(x, y, radius, color) {
      super(x, y, radius);
      this.color = color;
  }
}

// Create Projectiles
class Projectile extends Player {
  constructor(x, y, radius, color, velocity) {
      super(x, y, radius, color);
      this.velocity = velocity;
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
}
}

// Create enemies
class Enemy extends Projectile {
  constructor(x, y, radius, color, velocity) {
      super(x, y, radius, color, velocity);
  }
}

class Particle extends Enemy {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}
const player = new Player(canvas.width / 2, canvas.height / 2, 10, "red");
const projectile = new Projectile(50, 50, 30, "blue", {x: 3, y: 3});
const enemies = [];
const projectiles = [];
const particles = [];

if (!gameOver) {
  player.draw();
  projectile.draw();
  window.addEventListener("click", (event) => {
      // const projectile = new Projectile(event.clientX, event.clientY, 5, "white", null);
      const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
      );

      const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };

    const projectile = new Projectile(
        player.x,
        player.y,
        5,
        "white",
        velocity
    );

      projectile.draw();
      projectiles.push(projectile);
  });

  function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const color = `rgb(${r}, ${g}, ${b})`;
        const randomValue = Math.random();
        let x ,y;
        if (randomValue < 0.25) {
            x = 0 - radius;
            y = Math.random() * canvas.height;
        } else if (randomValue >= 0.25 && randomValue < 0.5) {
            x = canvas.width + radius;
            y = Math.random() * canvas.height;
        } else if (randomValue >= 0.5 && randomValue < 0.75) {
            x = Math.random() * canvas.width;
            y = 0 - radius;
        } else if (randomValue >= 0.75) {
            x = Math.random() * canvas.width;
            y = canvas.height + radius;
        }
        const angle = Math.atan2(player.y - y, player.x - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
  }
  spawnEnemies();

  let animationId;

  function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    projectiles.forEach((projectile) => projectile.update());

    particles.forEach((particle, index) => {
      if (particle.alpha <= 0) {
        particles.splice(index, 1);
      } else {
        particle.update();
      }
    });

    enemies.forEach((enemy, enemyIndex) => {
      projectiles.forEach((projectile, projectileIndex) => {
        const distance = Math.hypot(
          projectile.x - enemy.x,
          projectile.y - enemy.y
        );

        if (distance - projectile.radius - enemy.radius <= 0) {
          // particles creation
          for (let i = 0; i < 8; i++) {
            particles.push(
              new Particle(
                projectile.x,
                projectile.y,
                Math.random() * (3 - 1) + 1,
                enemy.color,
                {
                  x: (Math.random() - 0.5) * 3,
                  y: (Math.random() - 0.5) * 3,
                }
              )
            );
          }

          if (enemy.radius - 10 > 5) {
            gsap.to(enemy, {
              radius: enemy.radius - 12,
            });
            setTimeout(() => {
              projectiles.splice(projectileIndex, 1);
            }, 0);
          } else {
            setTimeout(() => {
              enemies.splice(enemyIndex, 1);
              projectiles.splice(projectileIndex, 1);
            }, 0);
          }
        }
      });

      const distPlayerEnemy = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (distPlayerEnemy - enemy.radius - player.radius <= 0) {
          cancelAnimationFrame(animationId);
          modal.classList.replace("hidden","modal-active");
        }
        enemy.update();
      });
    scoreDisplay.innerText = enemies.length;
    console.log(enemies.length);
  }
  animate();
}

const restartGame = () => {
  restartButton.addEventListener("click", () => {
    window.location.reload();
  })
}



