/* Setting */
let nbMaxAsteroids = 50;
let shipColor = 'rgba(191, 42, 42, 1)';
let laserColor = 'rgba(217, 37, 85, 1)';
let thrusterColor = '#2a73c0';

const inputs = document.querySelectorAll('.settingValues input');

function handleUpdate() {
  const suffix = this.dataset.sizing || ''; //dataset.sizing correspond a data-sizing dans les input du HTML
  //console.log(this.name, this.value + suffix)
  document.documentElement.style.setProperty(
    `--${this.name}`,
    this.value + suffix
  ); //document.documentElement === document.querySelector(":root")
  if (this.name === 'shipColor') {
    shipColor = `${this.value + suffix}`;
  }
  if (this.name === 'laserColor') {
    laserColor = `${this.value + suffix}`;
  }
  if (this.name === 'thrusterColor') {
    thrusterColor = `${this.value + suffix}`;
  }
  if (this.name === 'nbAsteroids') {
    nbMaxAsteroids = `${this.value + suffix}`;
  }
}

const inputSetting = () => {
  inputs.forEach((input) => input.addEventListener('change', handleUpdate)); // sur change et mousemove pour les changements se facent en direct
  inputs.forEach((input) => input.addEventListener('mousemove', handleUpdate));
};

/* Score */

const asteroidsDestroyed = document.querySelector('#asteroidDestroyed');
const shootNumber = document.querySelector('#shootNb');
const precision = document.querySelector('#precision');

//afficher les scores

const score = (asteroidsDestroyedCount, shootCount) => {
  let hitpercent =
    Math.floor((asteroidsDestroyedCount / shootCount) * 100) || 0;

  asteroidsDestroyed.innerHTML = `${asteroidsDestroyedCount}`;
  shootNumber.innerHTML = `${shootCount}`;
  precision.innerHTML = `${hitpercent}%`;
};

//GameOver
let stop = false;
// Dans app.js lors d'un gameover et lorsque on appuie sur entrer on appel la function stopToFalse pour exécuter animate()
function stopToFalse() {
  stop = false;
}

function gameOver(gameOverScreen, func) {
  //playAudio("assets/sounds/fx/gameOver.wav", 0.07);
  stop = true; //Si stop === true la fonction animate ne s'exécute pas: donc le jeu s'arrete
  gameOverScreen.style.display = 'block'; //Affiche le texte du game over
  //En appuyant sur entrer le jeu se relance normalement
  document.addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
      gameOverScreen.style.display = 'none';
      func();
    }
  });
}

// détruit un objet en particulier dans un tableau (laser ou asteroid)
const objectToDelete = (arrObjects, object) => {
  const deleteObject = arrObjects.findIndex(
    //trouve l'objet à détruire (même position x) il est improbable que deux objets est exactement le même x
    (e) => e.x === object.x
  );
  arrObjects.splice(deleteObject, 1); //enleve cet objet du tableau
};

const playAudio = (path, volume = 1, loop = false, autoplay = false) => {
  const audio = new Audio(path);
  audio.load();
  autoplay ? (audio.autoplay = autoplay) : audio.play();
  audio.volume = volume;
  audio.loop = loop;
  console.log('music');
};
export {
  //setting
  thrusterColor,
  laserColor,
  shipColor,
  nbMaxAsteroids,
  inputs,
  handleUpdate,
  inputSetting,
  //score
  score,
  stop,
  stopToFalse,
  gameOver,
  objectToDelete,
  playAudio,
};
