// Choisi un Nb entier au hasard compris entre MIN et MAX
const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

// Choisi un Nb à virgule au hasard compris entre MIN et MAX
const randomFloat = (min, max) => Math.random() * (max - min) + min;

// Calcul la distance entre deux objets (cercles) par rapport a leurs centres grace au theoreme de pytagore
const distance = (x1, y1, x2, y2) => {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
};

// Collision entre un cercle et un rectangle

const RectCircleColliding = (circle, rect) => {
    var distX = Math.abs(circle.x - rect.x - rect.w / 2);
    var distY = Math.abs(circle.y - rect.y - rect.h / 2);
    var dx = distX - rect.w / 2;
    var dy = distY - rect.h / 2;


    if (distX <= (rect.w / 2) && distY <= (rect.h / 2) || dx * dx + dy * dy <= (circle.rayon * circle.rayon)) {
        return true;
    }
}

// Céer un tableau de choses a tirer au hasard mais plus cette chose a un poid élevé plus elle a de chance d etre tiré au hasard
function createChanceArr(thinks, weight) {
    const arrChance = []
    if (thinks.length === weight.length) {
        for (let i = 0; i < thinks.length; i++) {
            for (let j = 0; j < weight[i]; j++) {
                arrChance.push(thinks[i]) // on ajout au tableau une chose le nombre de fois correspondant à son poid
            }
        }
    } else return console.error("!!!! thinks.length != weight.length !!!!"); // return un message d erreur si le nb de valeur du tableau de choses n est pas egale a celui du tableau des poids conrespondant
    return arrChance
}



export {
    randomInt,
    randomFloat,
    distance,
    RectCircleColliding,
    createChanceArr
};