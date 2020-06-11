/* Setting */
let nbMaxAsteroids = 200;
let shipColor = "rgba(191, 42, 42, 1)";
let laserColor = "rgba(217, 37, 85, 1)";
let thrusterColor = "#2a73c0";


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

const inputSetting = () => {
    inputs.forEach((input) => input.addEventListener("change", handleUpdate)); // sur change et mousemove pour les changements se facent en direct
    inputs.forEach((input) => input.addEventListener("mousemove", handleUpdate));
};

/* Score */

const asteroidsDestroyed = document.querySelector("#asteroidDestroyed");
const shootNumber = document.querySelector("#shootNb");
const precision = document.querySelector("#precision");




//afficher les scores


const score = (asteroidsDestroyedCount, shootCount) => {
    let hitpercent = Math.floor((asteroidsDestroyedCount / shootCount) * 100) || 0;

    asteroidsDestroyed.innerHTML = `${asteroidsDestroyedCount}`;
    shootNumber.innerHTML = `${shootCount}`;
    precision.innerHTML = `${hitpercent}%`;
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
}