const speedUp = (ship) => {
    console.log("alors", ship.speed, ship.speedY)
    ship.speed = ship.speed + 1 / 10;
    ship.speedY = ship.speed / 2
    console.log("alors", ship.speed, ship.speedY)
}



export {
    speedUp
};