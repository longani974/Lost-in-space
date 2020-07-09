const bonusDice = {
    thinks: [1, 2, 3], // chiffre correspondant au bonus exemple 1 correspond a speedUp
    weigth: [3, 2, 1] // poids du bonus (plus le chiffre est eleve plus il y a de chance que ce bonus soit selectionné)
}

const speedUp = (ship) => { // function augmente la vitesse max du vaisseau
    console.log("speedUp")
    ship.speed = ship.speed + 1 / 10;
    ship.speedY = ship.speed / 2
}

const applyBonus = (Number, heroShip) => { // applique le bonus correspondant au Number
    switch (Number) {
        case 1:
            speedUp(heroShip)
            break;
        case 2:
            console.log("reloadFaster")
            break;
        case 3:
            console.log("bigBomb")
            break;
        default:
            console.error("!!! Numero de Bonus invalide thinks dans const dice !!!")
    }
}

export {
    bonusDice,
    speedUp,
    applyBonus
};