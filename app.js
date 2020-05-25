import * as utils from "./utils.js";
import * as ellasticCollisions from "./ellasticCollisions.js";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const minMapY = -canvas.height;
const maxMapY = 2 * canvas.height;

console.log(minMapY, maxMapY);
//Constuctor d'objets stellaires
class StellarObject {
  constructor(x, y, rayon, dx, dy) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: dx,
      y: dy,
    };
    this.rayon = rayon;
    this.mass = 1 / this.rayon; // la masse doit etre inversement proportionnel au rayon (a la taille) pour que l'algorithme fonctionne correctement
  }
  //Dessine un cercle (objet stellaire en question)
  draw() {
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "transparent";
    ctx.closePath();
    ctx.fill();
  }

  //Update de chaque objet : 1-velocité 2-dessine 3-Collisions 4-Efface les objets inutiles
  update = (particules) => {
    //1-vélocité
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    //2-dessine
    this.draw();
    //3-Collisions
    for (let i = 0; i < particules.length; i++) {
      if (this === particules[i]) continue;
      if (
        utils.distance(this.x, this.y, particules[i].x, particules[i].y) <=
        this.rayon + particules[i].rayon
      ) {
        ellasticCollisions.resolveCollision(this, particules[i]);
      }
    }
    //4-Efface les objets inutiles
    particules.map((particule) => {
      if (particule.x < 0 - particule.rayon) {
        const deleteParticule = particules.findIndex(
          (e) => e.x === particule.x
        );
        particules.splice(deleteParticule, 1);
      }
      //5-Loop la map en y
      if (particule.y >= maxMapY) return (particule.y = minMapY);
      if (particule.y <= minMapY) return (particule.y = maxMapY);
    });
  };
}
class StarShip {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillRect(
      this.x - this.width / 3,
      this.y + this.height,
      this.width,
      this.height / 2
    );
    ctx.fillRect(
      this.x - this.width / 3,
      this.y - this.height / 2,
      this.width,
      this.height / 2
    );

    ctx.closePath();
  }
}
// Spawn des asteroides
let asteroids = [];
const spawnAsteroids = () => {
  window.setInterval(() => {
    // x et y determine la position, dx et dy la vélocité et rayon le rayon de l asteroide
    let x = utils.randomInt(
      canvas.width,
      canvas.width + (canvas.width * 20) / 100
    );
    let y = utils.randomInt(
      0 - (canvas.height * 20) / 100,
      canvas.height + (canvas.height * 20) / 100
    );
    const dx = utils.randomFloat(-0.3, -0.1);
    const dy = utils.randomFloat(-0.05, 0.05);
    const rayon = utils.randomInt(3, 15);
    //Vérifie que l asteroide ne spawn pas sur une autre asteroide deja presente et le push dans le Array
    if (asteroids.length !== 0) {
      for (let i = 0; i < asteroids.length; i++) {
        if (
          utils.distance(x, y, asteroids[i].x, asteroids[i].y) <=
          rayon + asteroids[i].rayon
        ) {
          x = utils.randomInt(
            canvas.width,
            canvas.width + (canvas.width * 20) / 100
          );
          y = utils.randomInt(
            0 - (canvas.height * 20) / 100,
            canvas.height + (canvas.height * 20) / 100
          );
          i = -1;
        }
      }
    }
    asteroids.push(new StellarObject(x, y, rayon, dx, dy));
  }, 500); //Ce parametre est celui de window.setInterval qui englobe la fonction. Determine l interval entre les spawn
};

let heroShip;
const spawnHeroShip = () => {
  let widthShip = 16;
  let heightShip = 8;
  let x = canvas.width / 8;
  let y = canvas.height / 2 - heightShip / 2;
  heroShip = new StarShip(x, y, widthShip, heightShip);
};
//Rafraichie le canvas en 60 fps
let velY = 0,
  velX = 0,
  speed = 2, // max speed
  speedY = 1,
  friction = 0.97, // friction
  accelerationX = 1.25,
  acclerationY = 1.2,
  defSpeed = 0.1,
  keys = [];
const shipControl = () => {
  if (keys[38]) {
    if (velY < speedY) {
      velY += defSpeed * acclerationY;
      //defSpeed += 0.1;
      console.log(velY);
    }
  }

  if (keys[40]) {
    if (velY > -speedY) {
      velY -= defSpeed * acclerationY;
      //defSpeed += 0.1;
      console.log(velY);
    }
  }
  if (keys[39]) {
    if (velX < speed) {
      velX += defSpeed; // * accelerationX;
      //defSpeed += 0.1;
      console.log(velX);
    }
  }
  if (keys[37]) {
    if (velX > -speed) {
      velX -= defSpeed * accelerationX;
      //defSpeed += 0.1;
      console.log(velX);
    }
  }
  velY *= friction;
  defSpeed = 0.1;
  asteroids.map((asteroid) => (asteroid.y += velY));

  // apply some friction to x velocity.
  velX *= friction;
  heroShip.x += velX;
};
const animate = () => {
  requestAnimationFrame(animate);
  shipControl();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  asteroids.map((asteroid) => asteroid.update(asteroids));
  heroShip.draw();
};

// key events
document.body.addEventListener("keydown", function (e) {
  keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
});

spawnHeroShip();
spawnAsteroids();
animate();
