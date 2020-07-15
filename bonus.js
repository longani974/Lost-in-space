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
  //repare le vaiseau
  if (ship.life <= 95) {
    ship.life += 5;
  } else if (ship.life > 95) {
    ship.life = 100;
  }
};
let onscreen = [];

function textBonus(ctx, text, index) {
  ctx.fillStyle = "yellow";
  ctx.font = "16px serif";
  ctx.fillText(text, 10, index * 20);
}
function deleteFirstArr() {
  onscreen.splice(0, 1);
}

const applyBonus = (Number, heroShip, motherShip, ctx) => {
  // applique le bonus correspondant au Number
  switch (Number) {
    case 1:
      speedUp(heroShip);
      onscreen.push("Speed +");
      setTimeout(deleteFirstArr, 2000);
      console.log("speedUp");
      break;
    case 2:
      laserLoadFatser(heroShip);
      onscreen.push("Load +");
      setTimeout(deleteFirstArr, 2000);
      console.log("laserLoadFaster");
      break;
    case 3:
      giveBomb(heroShip);
      onscreen.push("Bomb +");
      setTimeout(deleteFirstArr, 2000);
      console.log("bigBomb");
      break;
    case 4:
      fixShip(motherShip);
      onscreen.push("Life +");
      setTimeout(deleteFirstArr, 2000);
      console.log("life++");
      break;
    default:
      console.error("!!! Numero de Bonus invalide thinks dans const dice !!!");
  }
};

export { bonusDice, speedUp, laserLoadFatser, applyBonus, textBonus, onscreen };
