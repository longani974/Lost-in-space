import * as utils from "./utils.js";
import * as ellasticCollisions from "./ellasticCollisions.js";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const minMapY = -canvas.height;
const maxMapY = 2 * canvas.height;

const minMapX = -canvas.width;
const maxMapX = 2 * canvas.width;

const timeSpawn = 100;

const asteroidsDestroyed = document.querySelector("#asteroidDestroyed");
const shootNumber = document.querySelector("#shootNb");
const precision = document.querySelector("#precision");

let asteroidsDestroyedCount = 0;
let shootCount = 0;

let nbMaxAsteroids = 200;
let shipColor = "rgba(191, 42, 42, 1)";
let laserColor = "#D92555";
let thrusterColor = "#2a73c0";

//afficher les scores

const score = () => {
  let hitpercent =
    Math.floor((asteroidsDestroyedCount / shootCount) * 100) || 0;

  asteroidsDestroyed.innerHTML = `${asteroidsDestroyedCount}`;
  shootNumber.innerHTML = `${shootCount}`;
  precision.innerHTML = `${hitpercent}%`;
};

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
<<<<<<< HEAD
<<<<<<< HEAD
=======
    this.color = "rgba(242, 134, 72, 1)";
>>>>>>> ea8c001... structure de la page web - choix des couleurs - javascript setting
    this.mass = 1 / this.rayon; // la masse doit etre inversement proportionnel au rayon (a la taille) pour que l'algorithme fonctionne correctement
=======
    this.mass = 1 / this.rayon;
    this.color = "grey";
>>>>>>> 6479711... Le vaisseau tire des missiles lasers
  }
  //Dessine un cercle (objet stellaire en question)
  draw() {
    ctx.beginPath();
    // ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
    // ctx.stroke();
    ctx.fillStyle = this.color;
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
      // if (particule.x < 0 - particule.rayon) {
      //   const deleteParticule = particules.findIndex(
      //     (e) => e.x === particule.x
      //   );
      //   particules.splice(deleteParticule, 1);
      // }
      //Loop la map en x
      if (particule.x >= maxMapX) return (particule.x = minMapX);
      if (particule.x <= minMapX) return (particule.x = maxMapX);
      //5-Loop la map en y
      if (particule.y >= maxMapY) return (particule.y = minMapY);
      if (particule.y <= minMapY) return (particule.y = maxMapY);

      //Detection et int le jeu si le vaisseau entre en collision avec un asteroide
      if (utils.RectCircleColliding(particule, heroShip.collisionBox)) {
        init();
      }
      heroWeapons.map((weapon) => {
        if (utils.RectCircleColliding(particule, weapon.collisionBox)) {
          //Detruit les laser et les asteroids qui rentrent en collision
          const deleteParticule = particules.findIndex(
            (e) => e.x === particule.x
          );
          particules.splice(deleteParticule, 1);

          const deleteLaser = heroWeapons.findIndex((e) => e.x === weapon.x);
          heroWeapons.splice(deleteLaser, 1);
          asteroidsDestroyedCount++;
        }
        //Detruit les laser qui vont trop loin en X
        if (weapon.x > 4 * canvas.width) {
          const deleteLaser = heroWeapons.findIndex((e) => e.x === weapon.x);
          heroWeapons.splice(deleteLaser, 1);
        }
      });
    });
  };
}
class StarShip {
  constructor(
    x,
    y,
    w,
    h,
    speed,
    speedY,
    friction,
    accelerationX,
    acclerationY
  ) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.velY = 0;
    this.velX = 0;
    this.speed = speed; // max speed
    this.speedY = speedY;
    this.friction = friction; // friction
    this.accelerationX = accelerationX;
    this.acclerationY = acclerationY;
    this.defSpeed = 0.1;
    this.keys = [];
    this.countKey = 0;
    this.collisionBox = {};
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = shipColor;
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
    // ctx.beginPath();
    // ctx.strokeStyle = "red";
    // const collisionBox = ctx.strokeRect(
    //   this.x - this.width / 3,
    //   this.y - this.height / 2,
    //   this.width + this.width / 3,
    //   this.height * 2
    // );

    ctx.closePath();
  }
  drawThrusterForward() {
    ctx.beginPath();
    ctx.fillStyle = thrusterColor;
    ctx.fillRect(
      this.x - this.width / 3,
      this.y - this.height / 2,
      -this.width / 8,
      this.height / 2
    );
    ctx.fillRect(
      this.x - this.width / 3,
      this.y - this.height / 2,
      -this.width / 2,
      this.height / 4
    );
    ctx.fillRect(
      this.x - this.width / 3,
      this.y + this.height,
      -this.width / 8,
      this.height / 2
    );
    ctx.fillRect(
      this.x - this.width / 3,
      this.y + this.height,
      -this.width / 2,
      this.height / 4
    );
    ctx.closePath();
  }
  drawThrusterBackward() {
    ctx.beginPath();
    ctx.fillStyle = thrusterColor;
    ctx.fillRect(
      this.x - this.width / 3,
      this.y - this.height / 2,
      this.width / 8,
      this.height / 2
    );
    ctx.fillRect(
      this.x + (2 * this.width) / 3,
      this.y - this.height / 2,
      this.width / 2,
      this.height / 4
    );
    ctx.fillRect(
      this.x + (2 * this.width) / 3,
      this.y + this.height,
      this.width / 8,
      this.height / 2
    );
    ctx.fillRect(
      this.x + (2 * this.width) / 3,
      this.y + this.height,
      this.width / 2,
      this.height / 4
    );
    ctx.closePath();
  }
  drawThrusterUp() {
    ctx.beginPath();
    ctx.fillStyle = thrusterColor;
    ctx.fillRect(
      this.x - this.width / 3,
      this.y + this.height + this.height / 2,
      this.height / 2,
      this.width / 8
    );
    ctx.fillRect(
      this.x + (2 * this.width) / 3,
      this.y + this.height + this.height / 2,
      this.height / 4,
      this.width / 2
    );
    ctx.fillRect(
      this.x - this.width / 3,
      this.y + this.height + this.height / 2,
      this.height / 4,
      this.width / 2
    );
    ctx.fillRect(
      this.x - this.width / 3,
      this.y + this.height + this.height / 2,
      this.height / 4,
      this.width / 2
    );
    ctx.closePath();
  }
  drawThrusterDown() {
    ctx.beginPath();
    ctx.fillStyle = thrusterColor;
    ctx.fillRect(
      this.x - this.width / 3,
      this.y - this.height / 2,
      -this.height / 2,
      -this.width / 8
    );
    ctx.fillRect(
      this.x + (2 * this.width) / 3,
      this.y - this.height / 2,
      -this.height / 4,
      -this.width / 2
    );
    ctx.fillRect(
      this.x - this.width / 3,
      this.y - this.height / 2,
      -this.height / 4,
      -this.width / 2
    );
    ctx.fillRect(
      this.x - this.width / 3,
      this.y - this.height / 2,
      -this.height / 4,
      -this.width / 2
    );
    ctx.closePath();
  }
  control() {
    // Annule l'autorepeat de keydown de la touche espace
    if (this.countKey > 1) {
      this.keys[32] = false;
    }
    // Up
    if (this.keys[38]) {
      if (this.velY < this.speedY) {
        this.velY += this.defSpeed * this.acclerationY;
        heroShip.drawThrusterUp();
      }
    }
    // Down
    if (this.keys[40]) {
      if (this.velY > -this.speedY) {
        this.velY -= this.defSpeed * this.acclerationY;
      }
      heroShip.drawThrusterDown();
    }
    // Right
    if (this.keys[39]) {
      if (this.velX < this.speed) {
        this.velX += this.defSpeed * this.accelerationX;
        heroShip.drawThrusterForward();
      }
    }
    // Left
    if (this.keys[37]) {
      if (this.velX > -this.speed) {
        this.velX -= this.defSpeed * this.accelerationX;
        heroShip.drawThrusterBackward();
      }
    }
    // Space
    if (this.keys[32]) {
      spawnWeapon();
      shootCount++;
      this.keys[32] = false;
    }

    this.velY *= this.friction;
    this.defSpeed = 0.1;
    asteroids.map((asteroid) => (asteroid.y += this.velY));
    heroWeapons.map((weapon) => {
      weapon.y += this.velY;
    });

    // apply some friction to x velocity.
    this.velX *= this.friction;
    //this.x += this.velX;
    asteroids.map((asteroid) => (asteroid.x -= this.velX));
  }

  update() {
    this.control();
    if (this.x < this.width / 3) this.x = this.width / 3; //collision limite gauche
    if (this.x > canvas.width - this.width) this.x = canvas.width - this.width; //collision limite droite
    this.draw();
    this.collisionBox = {
      x: this.x - this.width / 3,
      y: this.y - this.height / 2,
      w: this.width + this.width / 3,
      h: this.height * 2,
    };
  }
}

class ShipWeapon {
  constructor() {
    this.x = heroShip.x + heroShip.width;
    this.y = heroShip.y + heroShip.height / 2;
    this.speed = 4;
    this.width = 8;
    this.height = 2;
    this.collisionBox = {};
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = laserColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.closePath();
  }
  update = (particules) => {
    //1-vélocité
    this.x += this.speed;
    //2-dessine
    this.draw();
    this.collisionBox = {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height,
    };
  };
}

// Spawn des asteroides
let asteroids = [];
let clearIt;
const spawnAsteroids = () => {
  clearIt = window.setInterval(() => {
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
<<<<<<< HEAD
    if (asteroids.length < 250) {
      asteroids.push(new StellarObject(x, y, rayon, dx, dy));
=======
    if (asteroids.length < nbMaxAsteroids) {
      asteroids.push(new StellarObject(x, y, rayon, dx, dy, color));
>>>>>>> ea8c001... structure de la page web - choix des couleurs - javascript setting
    }
  }, timeSpawn); //Ce parametre est celui de window.setInterval qui englobe la fonction. Determine l interval entre les spawn
};
// Spawn le vaisseau hero
let heroShip;
const spawnHeroShip = () => {
  let widthShip = 16;
  let heightShip = widthShip / 2;
  let x = canvas.width / 2 - widthShip / 2;
  let y = canvas.height / 2 - heightShip / 2;
  let speed = 2;
  let speedY = 1;
  let friction = 0.97;
  let accelerationX = 1.25;
  let acclerationY = 1.2;
  heroShip = new StarShip(
    x,
    y,
    widthShip,
    heightShip,
    speed,
    speedY,
    friction,
    accelerationX,
    acclerationY
  );
};

let heroWeapons = [];
const spawnWeapon = () => {
  heroWeapons.push(new ShipWeapon());
};

//Rafraichie le canvas en 60 fps
const animate = () => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  asteroids.map((asteroid) => asteroid.update(asteroids));
  heroShip.update();
  heroWeapons.map((weapon) => weapon.update(heroWeapons));
  score();
};

//key events
document.addEventListener("keydown", function (e) {
  heroShip.keys[e.keyCode] = true;
  heroShip.countKey += 1; // Annule l'autorepeat de keydown de la touche espace
});
document.addEventListener("keyup", function (e) {
  heroShip.keys[e.keyCode] = false;
  heroShip.countKey = 0; // Reinitialse la touche espace
});
const init = () => {
  window.clearInterval(clearIt);
  asteroidsDestroyedCount = 0;
  shootCount = 0;
  asteroids = [];
  spawnHeroShip();
  spawnAsteroids();
};
init();
animate();

/********************************************************* */
/********************************************************* */
/********************************************************* */

const inputs = document.querySelectorAll(".settingValues input");

function handleUpdate() {
  const suffix = this.dataset.sizing || ""; //dataset.sizing correspond a data-sizing dans les input du HTML
  //console.log(this.name, this.value + suffix)
  document.documentElement.style.setProperty(
    `--${this.name}`,
    this.value + suffix
  ); //document.documentElement === document.querySelector(":root")
  if (this.name === "shipColor") {
    shipColor = `${this.value + suffix}`;
  }
  if (this.name === "laserColor") {
    laserColor = `${this.value + suffix}`;
  }
  if (this.name === "thrusterColor") {
    thrusterColor = `${this.value + suffix}`;
  }
  if (this.name === "nbAsteroids") {
    nbMaxAsteroids = `${this.value + suffix}`;
  }
}

inputs.forEach((input) => input.addEventListener("change", handleUpdate)); // sur change et mousemove pour les changements se facent en direct
inputs.forEach((input) => input.addEventListener("mousemove", handleUpdate));

/********************************************************* */
/********************************************************* */
/********************************************************* */
