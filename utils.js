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



export {
    randomInt,
    randomFloat,
    distance,
    RectCircleColliding
};