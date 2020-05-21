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

export {
    randomInt,
    randomFloat,
    distance
};