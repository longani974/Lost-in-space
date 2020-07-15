const bonusDice = {
  thinks: [1, 2, 3, 4], // chiffre correspondant au bonus exemple 1 correspond a speedUp
  weigth: [3, 2, 1, 1], // poids du bonus (plus le chiffre est eleve plus il y a de chance que ce bonus soit selectionné)
};

const speedUp = (ship) => {
  // function augmente la vitesse max du vaisseau
  ship.speed = ship.speed + 1 / 10;
  ship.speedY = ship.speed / 2;
};

const laserLoadFatser = (ship) => {
  // function augmente la vitesse de recharge des lasers
  ship.laserLoadTime += 0.05;
};

const giveBomb = (ship) => {
  // Donne une bombe au vaisseau
  ship.haveBomb = true;
};

const fixShip = (ship) => {
  if (ship.life <= 95) {
    ship.life += 5;
  } else if (ship.life > 95) {
    ship.life = 100;
  }
};

const applyBonus = (Number, heroShip, motherShip) => {
  // applique le bonus correspondant au Number
  switch (Number) {
    case 1:
      speedUp(heroShip);
      console.log("speedUp");
      break;
    case 2:
      laserLoadFatser(heroShip);
      console.log("laserLoadFaster");
      break;
    case 3:
      giveBomb(heroShip);
      console.log("bigBomb");
      break;
    case 4:
      fixShip(motherShip);
      console.log("life++");
      break;
    default:
      console.error("!!! Numero de Bonus invalide thinks dans const dice !!!");
  }
};

export { bonusDice, speedUp, laserLoadFatser, applyBonus };
