import * as utils from "./utils.js";
import * as ellasticCollisions from "./ellasticCollisions.js";
import * as secondary from "./secondary.js";
import * as bonus from "./bonus.js";

secondary.playAudio("assets/sounds/videoplayback.wav", 0.3, true, true);

const gameOverScreen = document.querySelector("#gameOver");

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800; //window.innerWidth;
canvas.height = 400; //window.innerHeight;

const minMapY = 0;
const maxMapY = canvas.height;

const minMapX = 0;
const maxMapX = canvas.width;

const timeSpawn = 500;

let animFrame;

let asteroidsDestroyedCount = 0;
const asteroidColor = "rgba(242, 134, 72, 1)";
const bonusColor = "yellow";
let shootCount = 0;

let arrExploded = [];
let arrBombExploded = [];

//Constuctor d'objets stellaires
class StellarObject {
  constructor(x, y, rayon, dx, dy, heroShip, color, canHaveBonus, isBonus) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: dx,
      y: dy,
    };
    this.rayon = rayon;
    this.color = color;
    this.mass = 1 / this.rayon; // la masse doit etre inversement proportionnel au rayon (a la taille) pour que l'algorithme fonctionne correctement
    this.heroShip = heroShip;
    this.canHaveBonus = canHaveBonus; // si la particule peut renfermer un bonus
    this.haveBonus = utils.randomInt(3, 3); // si la particule renferme un bonus (une chance sur trois)
    this.isBonus = isBonus; // si la particule est un bonus
  }
  //Dessine un cercle (objet stellaire en question)
  draw() {
    ctx.save(); // empeche la propagation de shadowBlur
    ctx.beginPath();
    ctx.shadowBlur = 15; //  Ajoute de la lumiere a l asteroid
    ctx.shadowColor = this.color;
    ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // empeche la propagation de shadowBlur
  }
  // Dessine des explosions
  drawExplosion(particule, nbParticules, colorExplosion) {
    for (let i = 0; i < nbParticules; i++) {
      let x = particule.x;
      let y = particule.y;
      const dx = utils.randomFloat(-3, 3);
      const possibleY = Math.sqrt(9 - dx * dx);
      const dy = utils.randomFloat(-possibleY, possibleY);
      arrExploded.push(
        new ExplodeAsteroid(x, y, dx, possibleY, colorExplosion)
      ); // Explosion en demi arc de cercle vers le bas
      arrExploded.push(
        new ExplodeAsteroid(x, y, dx, -possibleY, colorExplosion)
      ); // Explosion en demi arc de cercle vers le haut
      arrExploded.push(new ExplodeAsteroid(x, y, dx, dy, colorExplosion)); // Explosion contenu dans le cercle
    }
  }
  drawBombExplosion(particule, colorExplosion) {
    let x = particule.x;
    let y = particule.y;
    arrBombExploded.push(new BombExplosion(x, y, colorExplosion));
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
      if (this === particules[i]) continue; //Empeche la detection d'une collision d'une particule avec elle meme.
      if (
        utils.distance(this.x, this.y, particules[i].x, particules[i].y) <=
        this.rayon + particules[i].rayon
      ) {
        ellasticCollisions.resolveCollision(this, particules[i]);
      }
    }

    //4-Efface les objets inutiles
    particules.map((particule) => {
      // Detruit les asteroid hors map
      if (
        particule.y <= minMapY - particule.rayon ||
        particule.y >= maxMapY + particule.rayon ||
        particule.x >= 2 * maxMapX
      )
        secondary.objectToDelete(particules, particule);

      //Detection et init le jeu si le vaisseau this.starShip entre en collision avec un asteroide ou un bonus
      if (utils.RectCircleColliding(particule, this.heroShip.collisionBox)) {
        if (!particule.isBonus) {
          //si la particule n'est pas un bonus donc est un asteroid => gameOver
          secondary.gameOver(gameOverScreen, init);
        } else {
          //applique le bonus reçu
          const bonusNb = utils.randomInt(0, bonusChance.length - 1); //choisi un nombre au haseard entre 0 et la longueur moins 1 du tableau bonus chance
          const chance = bonusChance[bonusNb]; //stock le numero correspondant au bonus
          bonus.applyBonus(chance, heroShip, bigShip, ctx); // applique le bonus correspondant
          secondary.objectToDelete(particules, particule); //efface le bonus après avoir été intercepte
          secondary.playAudio("assets/sounds/fx/bonus.wav");
        }
      }
      //Detection collision d'un asteroide avec le vaisseau mere (bigShip)
      if (
        utils.distance(particule.x, particule.y, bigShip.x, bigShip.y) <=
        particule.rayon + bigShip.rayon
      ) {
        //Efface l asteroid apres la collision avec le vaisseau mere bigShip
        secondary.objectToDelete(particules, particule);
        //dessine l explosion asreroid contre le bigShip
        this.drawExplosion(particule, 40, asteroidColor);
        // Fait descendre la jauge de vie du vaisseau bigShip apres une collision celon la taille de l asteroid
        bigShip.life -= Math.floor(particule.rayon);
        // Si la jauge de vie est a zero la partie est finie -- gameOver
        if (bigShip.life <= 0) secondary.gameOver(gameOverScreen, init);
        secondary.playAudio("assets/sounds/fx/asteroidExplosion.wav");
      }
      //Vérifie si les lasers touchent un asteroid et exécute les fonctions en consequence
      heroWeapons.map((weapon) => {
        if (utils.RectCircleColliding(particule, weapon.collisionBox)) {
          // Assure l animation de l'explosion du laser et l'asteroid
          if (particule.canHaveBonus && particule.haveBonus === 3) {
            // si la particule peut contenir (asteroid) et contient un bonus => spawn un bonus
            particules.push(
              new StellarObject(
                particule.x,
                particule.y,
                2,
                -0.5,
                0,
                heroShip,
                bonusColor,
                false,
                true
              )
            );
          }
          //this.drawExplosion(particule, 80, secondary.laserColor);
          // Si le rayon de la particule est > 5 alors on divise son rayon par deux
          if (particule.rayon > 5 && weapon.category === "laser") {
            let rayon = particule.rayon / 2;
            let x = particule.x;
            let y = particule.y;
            let dx1 = particule.velocity.x - 0.25;
            let dy1 = particule.velocity.y + 0.5;
            let x2 = particule.x;
            let y2 = particule.y;
            let dx2 = particule.velocity.x - 0.25;
            let dy2 = particule.velocity.y - 0.5;
            this.drawExplosion(particule, 40, secondary.laserColor);
            particules.push(
              new StellarObject(
                x,
                y,
                rayon,
                dx1,
                dy1,
                heroShip,
                asteroidColor,
                true,
                false
              )
            );
            particules.push(
              new StellarObject(
                x,
                y,
                rayon,
                dx2,
                dy2,
                heroShip,
                asteroidColor,
                true,
                false
              )
            );
          } else if (weapon.category === "bomb") {
            this.drawBombExplosion(particule, secondary.shipColor);
            secondary.playAudio("assets/sounds/fx/bombExplosion.wav");
          } else this.drawExplosion(particule, 40, secondary.laserColor);
          //Detruit les laser et les asteroids qui rentrent en collision
          secondary.objectToDelete(particules, particule);
          secondary.objectToDelete(heroWeapons, weapon);
          asteroidsDestroyedCount++; //incremente le nombre d'asteroids detruit
          secondary.playAudio("assets/sounds/fx/asteroidExplosion.wav");
        }
        //Detruit les laser qui vont trop loin en X
        if (weapon.x > 4 * canvas.width)
          secondary.objectToDelete(heroWeapons, weapon);
      });
      arrBombExploded.map((bomb) => {
        if (
          utils.distance(particule.x, particule.y, bomb.x, bomb.y) <=
          particule.rayon + bomb.rayon
        ) {
          //Efface l asteroid apres la collision avec le vaisseau mere bigShip
          secondary.objectToDelete(particules, particule);
          //dessine l explosion asreroid contre le bigShip
          this.drawExplosion(particule, 40, secondary.shipColor);
          asteroidsDestroyedCount++; //incremente le nombre d'asteroids detruit
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
    this.defSpeed = 0.1; // effet acceleration
    this.keys = [];
    this.countKey = 0; // Utile pour empecher l'autorepeat de la touche espace.
    this.collisionBox = {}; //Boite virtuelle qui enveloppera le vaisseau pour gérer les colisions
    this.laserEnergyCapacity = 100;
    this.laserEnergyLevel = 100;
    this.laserEnergyConsumption = Math.floor(100 / 3);
    this.laserLoadTime = 0.2; // temps pour recharger la jauge laser;
    this.haveBomb = false; // le vaisseau transporte t il une bombe
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = "rgba(43, 47, 114, 1)";
    // partie du milieu (visible lorsque la jauge du laser se vide)
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = secondary.shipColor;
    // partie basse
    ctx.fillRect(
      this.x - this.width / 3,
      this.y + this.height,
      this.width,
      this.height / 2
    );
    // partie du haut
    ctx.fillRect(
      this.x - this.width / 3,
      this.y - this.height / 2,
      this.width,
      this.height / 2
    );
    ctx.closePath();
  }
  // Dessine la Jauge de niveau du laser
  drawLaserCapacity() {
    ctx.fillStyle = secondary.shipColor;
    //jauge pleine
    if (this.laserEnergyLevel > 99) {
      ctx.fillRect(this.x, this.y, this.width / 3, this.height);
      ctx.fillRect(
        this.x + this.width / 3,
        this.y,
        this.width / 3,
        this.height
      );
      ctx.fillRect(
        this.x + this.width / 3 + this.width / 3,
        this.y,
        this.width / 3,
        this.height
      );
      // Deux bar de jauge
    } else if (this.laserEnergyLevel <= 99 && this.laserEnergyLevel >= 66) {
      ctx.fillRect(this.x, this.y, this.width / 3, this.height);
      ctx.fillRect(
        this.x + this.width / 3,
        this.y,
        this.width / 3,
        this.height
      );
      // Une bar de jauge
    } else if (this.laserEnergyLevel <= 65 && this.laserEnergyLevel >= 33) {
      ctx.fillRect(this.x, this.y, this.width / 3, this.height);
    }
  }
  //Dessine les propulseurs -- marche avant
  drawThrusterForward() {
    ctx.beginPath();
    ctx.fillStyle = secondary.thrusterColor;
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
  //Dessine les propulseurs -- marche arriere
  drawThrusterBackward() {
    ctx.beginPath();
    ctx.fillStyle = secondary.thrusterColor;
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
  //Dessine les propulseurs -- marche vers le haut
  drawThrusterUp() {
    ctx.beginPath();
    ctx.fillStyle = secondary.thrusterColor;
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
  //Dessine les propulseurs -- marche vers le bas
  drawThrusterDown() {
    ctx.beginPath();
    ctx.fillStyle = secondary.thrusterColor;
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
  // Assure le controle du vaisseau
  control() {
    // Annule l'autorepeat de keydown de la touche espace
    if (this.countKey > 1) {
      this.keys[32] = false;
    }
    if (this.keys[38]) {
      if (this.velY < this.speedY) {
        this.velY += this.defSpeed * this.acclerationY;
      }
    }
    // Down
    if (this.keys[40]) {
      if (this.velY > -this.speedY) {
        this.velY -= this.defSpeed * this.acclerationY;
      }
      this.drawThrusterDown();
    }
    // Right
    if (this.keys[39]) {
      if (this.velX < this.speed) {
        this.velX += this.defSpeed * this.accelerationX;
      }
      this.drawThrusterForward();
    }
    // Left
    if (this.keys[37]) {
      if (this.velX > -this.speed) {
        this.velX -= this.defSpeed * this.accelerationX;
      }
      this.drawThrusterBackward();
    }
    // Space
    //verifie que les laser soient chargé pour pouvoir tirer
    if (
      this.keys[32] &&
      this.laserEnergyLevel - this.laserEnergyConsumption >= 0
    ) {
      spawnLaser(); //fait apparetre un laser
      this.laserEnergyLevel -= this.laserEnergyConsumption; // fait baisser le niveau d'energie alloué aux laser à chaque tir
      shootCount++; // Compte le nombre de tire effectué
      this.keys[32] = false; // Empeche de tirer tous les lasers en meme temps
    }
    // B -> tire une bombe
    if (
      this.keys[66] &&
      this.haveBomb // tire seulement si le vaisseau transporte une bombe
    ) {
      spawnBomb(); //fait apparetre une bomb
      this.haveBomb = false; // la bombe a ete tire donc le vaisseau ne transporte plus de bombe
    }

    // this.defSpeed = 0.1;
    // Assure la deceleration ou l'inertie du vaisseau
    this.velX *= this.friction;
    this.x += this.velX;
    this.velY *= this.friction;
    this.y -= this.velY;
  }

  update() {
    this.control();
    //gere la collision du vaisseau avec le vaisseau mere bigShip
    if (utils.RectCircleColliding(bigShip, this.collisionBox)) {
      this.x += 4; //Creer un champs de force autour du vaisseau mere
    }
    if (this.x > canvas.width - this.width) this.x = canvas.width - this.width; //collision limite droite
    if (this.y < -this.height / 2) this.y = -this.height / 2; //collision limite haut
    if (this.y > maxMapY - this.height / 2) this.y = maxMapY - this.height / 2; //collision limite bas
    this.draw(); // dessine le vaisseau
    this.drawLaserCapacity(); //dessine la jauge d energie du laser
    //met a jour l emplacement de la Boite virtuelle qui enveloppe le vaisseau pour gérer les colisions
    this.collisionBox = {
      x: this.x - this.width / 3,
      y: this.y - this.height / 2,
      w: this.width + this.width / 3,
      h: this.height * 2,
    };
  }
}
// Objet pour les lasers
class ShipWeapon {
  constructor(x, y, speed, width, height, category) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = width;
    this.height = height;
    this.collisionBox = {};
    this.category = category;
  }
  draw() {
    if (this.category === "laser") {
      this.drawLaser();
    } else if (this.category === "bomb") this.drawBomb();
  }
  drawLaser() {
    ctx.beginPath();
    ctx.fillStyle = secondary.laserColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.closePath();
  }
  drawBomb() {
    ctx.beginPath();
    ctx.fillStyle = secondary.shipColor;
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
// Mother ship
class MotherShip {
  constructor() {
    this.x = -canvas.height / 2;
    this.y = canvas.height / 2;
    this.rayon = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    this.life = 100;
  }
  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(43, 47, 114, 1";
    ctx.fill();
    ctx.closePath();
    ctx.globalCompositeOperation = "source-atop"; // permet de dessiner uniquement sur le vaisseau mere et ne depasse pas
    ctx.fillStyle = "rgba(0, 17, 38, 1)";
    ctx.fillRect(3, 15, 10, 10);
    ctx.fillRect(55, 100, 20, 20);
    ctx.fillRect(30, 160, 10, 10);
    ctx.fillRect(10, 200, 20, 20);
    ctx.fillRect(30, 250, 10, 10);
    ctx.fillRect(70, 250, 10, 10);
    ctx.fillRect(-5, 280, 20, 20);
    ctx.fillRect(25, 350, 20, 20);
    ctx.fillRect(50, 200, 5, 5);
    ctx.fillRect(70, 225, 5, 5);
    ctx.fillRect(20, 50, 5, 5);
    ctx.fillRect(5, 380, 5, 5);
    ctx.fillRect(15, 140, 5, 5);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0, 17, 38, 1)";
    ctx.lineWidth = 2;
    ctx.moveTo(8, 25);
    ctx.lineTo(8, 130);
    ctx.lineTo(35, 130);
    ctx.moveTo(8, 55);
    ctx.lineTo(0, 55);
    ctx.moveTo(8, 45);
    ctx.lineTo(38, 45);
    ctx.moveTo(65, 120);
    ctx.lineTo(65, 210);
    ctx.lineTo(30, 210);
    ctx.moveTo(10, 210);
    ctx.lineTo(0, 210);
    ctx.moveTo(20, 200);
    ctx.lineTo(20, 165);
    ctx.lineTo(30, 165);
    ctx.moveTo(35, 160);
    ctx.lineTo(35, 110);
    ctx.lineTo(55, 110);
    ctx.moveTo(65, 160);
    ctx.lineTo(80, 160);
    ctx.moveTo(35, 350);
    ctx.lineTo(35, 210);
    ctx.moveTo(35, 255);
    ctx.lineTo(70, 255);
    ctx.moveTo(25, 360);
    ctx.lineTo(0, 360);
    ctx.moveTo(15, 290);
    ctx.lineTo(35, 290);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    // Jauge de vie
    ctx.fillStyle = "rgba(191, 42, 42, 1)";
    ctx.fillRect(7, 75, 40, 20);
    ctx.fillRect(7, 325, 40, -20);
    const damageGauge = ((this.life - 100) * 40) / 100; // determine la grandeur de la jauge de vie
    ctx.fillStyle = "rgba(0, 17, 38, 1)";
    ctx.fillRect(47, 75, damageGauge, 20);
    ctx.fillRect(47, 325, damageGauge, -20);
  }
}
// Objet qui gere les explosions
class ExplodeAsteroid {
  constructor(x, y, dx, dy, color) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: dx,
      y: dy,
    };
    this.rayon = 1.5;
    this.color = color;
    this.opacity = 1;
  }
  draw() {
    ctx.save(); // empeche la propagation du globalAlpha
    ctx.beginPath();
    // ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
    // ctx.stroke();
    ctx.globalAlpha = this.opacity; // gere la transparence des particules d explosions
    ctx.fillStyle = this.color;
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // empeche la propagation du globalAlpha
  }
  update() {
    this.opacity -= 0.01; // la particule d explosion est un peu plus transparente a chaque rafraichissement de l ecran
    if (this.opacity <= 0) {
      this.opacity = 0; //sans cette ligne la particule retrouve toute son opacité du à la valeur négative
      // supprime la particule
      // const deleteParticule = arrExploded.findIndex((e) => e === this);
      // arrExploded.splice(deleteParticule, 1);
      secondary.objectToDelete(arrExploded, this);
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.draw();
  }
}

// objet qui gere l esplosion des bombes
class BombExplosion {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.rayon = 0;
    this.color = color;
    this.opacity = 1;
  }
  draw() {
    ctx.save(); // empeche la propagation du globalAlpha
    ctx.beginPath();
    // ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
    // ctx.stroke();
    ctx.globalAlpha = this.opacity; // gere la transparence des particules d explosions
    ctx.fillStyle = this.color;
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // empeche la propagation du globalAlpha
  }
  update() {
    this.opacity -= 0.01; // la particule d explosion est un peu plus transparente a chaque rafraichissement de l ecran
    this.rayon += 1.5;
    if (this.opacity <= 0) {
      this.opacity = 0; //sans cette ligne la particule retrouve toute son opacité du à la valeur négative
      // supprime la particule
      secondary.objectToDelete(arrBombExploded, this);
    }
    this.draw();
  }
}
//Construit le vaisseau mere bigShip
const bigShip = new MotherShip();
// Spawn des asteroides
let asteroids = [];
let clearIt; // variable pour stocker le setInterval et par la suite pouvoir l effacer grace a clearInterval dans la fonction init()
const spawnAsteroids = () => {
  clearIt = window.setInterval(() => {
    // x et y determine la position, dx et dy la vélocité et rayon le rayon de l asteroide
    let x = utils.randomInt(
      canvas.width,
      canvas.width + (canvas.width * 20) / 100
    );
    let y = utils.randomInt(minMapY, maxMapY);
    const dx = utils.randomFloat(-0.3, -0.1);
    const dy = utils.randomFloat(-0.05, 0.05);
    const rayon = utils.randomInt(3, 15);
    const color = "rgba(242, 134, 72, 1)";
    //Vérifie que l asteroide ne spawn pas sur une autre asteroide deja presente et le push dans le Array
    if (asteroids.length !== 0) {
      // une condition pour etre sure qu il existe deja une asteroid
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
    // On ajoute des asteroides tant que le nombre max d asteroids n est pas atteint
    if (asteroids.length < secondary.nbMaxAsteroids) {
      asteroids.push(
        new StellarObject(
          x,
          y,
          rayon,
          dx,
          dy,
          heroShip,
          asteroidColor,
          true,
          false
        )
      );
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
  let speed = 0.5; //2
  let speedY = 0.25; //1
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
const spawnLaser = () => {
  const x = heroShip.x + heroShip.width;
  const y = heroShip.y + heroShip.height / 2;
  const speed = 4;
  const width = 8;
  const height = 2;
  const category = "laser";

  heroWeapons.push(new ShipWeapon(x, y, speed, width, height, category));
  secondary.playAudio("assets/sounds/fx/laser.wav");
};
const spawnBomb = () => {
  const x = heroShip.x + heroShip.width;
  const y = heroShip.y + heroShip.height / 2;
  const speed = 4;
  const width = 8;
  const height = 2;
  const category = "bomb";
  heroWeapons.push(new ShipWeapon(x, y, speed, width, height, category));
  secondary.playAudio("assets/sounds/fx/bombDroped.wav");
};

//Rafraichie le canvas en 60 fps
let animationFrame;
const animate = () => {
  animationFrame = window.setInterval(() => {
    // une function animationFrame a été créé car la méthode créait un bug
    if (!secondary.stop) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // efface le canvas a chaque rafraichissement
      bigShip.draw();
      asteroids.map((asteroid) => asteroid.update(asteroids));
      heroShip.update();
      heroWeapons.map((weapon) => weapon.update(heroWeapons));
      arrExploded.map((particule) => particule.update(arrExploded));
      arrBombExploded.map((particule) => particule.update(arrBombExploded));
      secondary.score(asteroidsDestroyedCount, shootCount);
      if (heroShip.laserEnergyLevel < 100) {
        heroShip.laserEnergyLevel += heroShip.laserLoadTime; //fait remonter le niveau d energie des lasers a chaque rafraichissement
      }
    }
    bonus.onscreen.map((text, i) => bonus.textBonus(ctx, text, i + 1));
  }, 1000 / 60);
};

//key events
document.addEventListener("keydown", function (e) {
  if (e.keyCode === 32 || 37 || 38 || 39 || 40) e.preventDefault();
  heroShip.keys[e.keyCode] = true;
  if (e.keyCode === 32) heroShip.countKey += 1; // Annule l'autorepeat de keydown de la touche espace
});
document.addEventListener("keyup", function (e) {
  heroShip.keys[e.keyCode] = false;
  if (e.keyCode === 32) heroShip.countKey = 0; // Reinitialse la touche espace
});
// function pour initialiser le jeu ou le reinitialiser après un gameOver ou après l appui sur la touche entrer
let bonusChance;
const init = () => {
  window.clearInterval(clearIt); // reinitialise le setInterval pour spawn les asteroids
  shootCount = 0;
  asteroidsDestroyedCount = 0;
  asteroids = [];
  heroWeapons = [];
  arrExploded = [];
  spawnHeroShip();
  spawnAsteroids();
  secondary.stopToFalse(); //passe secondary.stop a false pour lancer la function animate
  bigShip.life = 100;
  bonusChance = utils.createChanceArr(
    bonus.bonusDice.thinks,
    bonus.bonusDice.weigth
  ); // tableau stoquant les bonus dans lequel sera tiré au sort un bonus a chaque creation de l objet bonus
};
init();
animate();
secondary.inputSetting(); //gere les changements de parametres grace au input (changement de couleur vaiseau,laser...)
