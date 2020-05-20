const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')

canvas.width = 800
canvas.height = 400

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const randomFloat = (min, max) => Math.random() * (max - min) + min

class StellarObject {
    constructor(x, y, rayon, dx, dy) {
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.rayon = rayon
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI)
        ctx.strokeStyle = '#fff'
        ctx.stroke()
        ctx.fill()
        ctx.closePath()
    }
    update() {
        this.x += this.dx
        this.y += this.dy
        this.draw()
    }
}
let asteroids = [];
const spawnAsteroids = () => {
    window.setInterval(() => {
        const x = randomInt(canvas.width, canvas.width + (canvas.width * 20) / 100)
        const y = randomInt(0 - (canvas.height * 20) / 100, canvas.height + (canvas.height * 20) / 100)
        const dx = randomFloat(-0.3, -0.1)
        const dy = randomFloat(-0.05, 0.05)
        const rayon = randomInt(3, 15)
        asteroids.push(new StellarObject(x, y, rayon, dx, dy))
    }, 1000)
}

const animate = () => {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    asteroids.map(asteroid => asteroid.update())
}

spawnAsteroids()
animate()