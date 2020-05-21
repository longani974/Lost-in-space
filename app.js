const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomFloat = (min, max) => Math.random() * (max - min) + min;

const distance = (x1, y1, x2, y2) => {
  let xDistance = x2 - x1;
  let yDistance = y2 - y1;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
};

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };

  return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Grab angle between the two colliding particles
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y,
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
}

class StellarObject {
  constructor(x, y, rayon, dx, dy) {
    this.x = x;
    this.y = y;
    // this.dx = dx;
    // this.dy = dy;
    this.velocity = { x: dx, y: dy };
    this.rayon = rayon;
    this.mass = 1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
  update = (particules) => {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.draw();
    for (let i = 0; i < particules.length; i++) {
      if (this === particules[i]) continue;
      if (
        distance(this.x, this.y, particules[i].x, particules[i].y) <=
        this.rayon + particules[i].rayon
      ) {
        resolveCollision(this, particules[i]);
      }
    }
    //************************************* */
    // Code pour delete particules hors écran
    //*************************************** */
  };
}
let asteroids = [];
const spawnAsteroids = () => {
  window.setInterval(() => {
    let x = randomInt(canvas.width, canvas.width + (canvas.width * 20) / 100);
    let y = randomInt(
      0 - (canvas.height * 20) / 100,
      canvas.height + (canvas.height * 20) / 100
    );
    const dx = randomFloat(-0.3, -0.1);
    const dy = randomFloat(-0.05, 0.05);
    const rayon = randomInt(3, 15);

    if (asteroids.length !== 0) {
      for (let i = 0; i < asteroids.length; i++) {
        if (
          distance(x, y, asteroids[i].x, asteroids[i].y) <=
          rayon + asteroids[i].rayon
        ) {
          x = randomInt(canvas.width, canvas.width + (canvas.width * 20) / 100);
          y = randomInt(
            0 - (canvas.height * 20) / 100,
            canvas.height + (canvas.height * 20) / 100
          );
          i = -1;
        }
      }
    }
    asteroids.push(new StellarObject(x, y, rayon, dx, dy));
  }, 100);
};

const animate = () => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  asteroids.map((asteroid) => asteroid.update(asteroids));
};

spawnAsteroids();
animate();
