
const canvas = document.querySelector("canvas")
const ctx = canvas.getContext('2d')

let width, height, lastNow
let snowflakes
const maxSnowflakes = 100

document.getElementsByClassName('star-0')[0].style.opacity = 0
document.getElementsByClassName('star-1')[0].style.opacity = 0
document.getElementsByClassName('star-2')[0].style.opacity = 0
document.getElementsByClassName('star-3')[0].style.opacity = 0
document.getElementsByClassName('star-4')[0].style.opacity = 0
document.getElementsByClassName('star-5')[0].style.opacity = 0
document.getElementsByClassName('star-6')[0].style.opacity = 0


function playAudio() {
    play_lights();
    var x = document.getElementById("myAudio");
    x.volume = 0.1;
    x.play();
    document.getElementById('button-container-id').style.opacity = 0;
}

function init() {
    snowflakes = []
    resize()
    render(lastNow = performance.now())
}

function render(now) {
    requestAnimationFrame(render)

    const elapsed = now - lastNow
    lastNow = now

    ctx.clearRect(0, 0, width, height)
    if (snowflakes.length < maxSnowflakes)
        snowflakes.push(new Snowflake())

    ctx.fillStyle = ctx.strokeStyle = '#fff'

    snowflakes.forEach(snowflake => snowflake.update(elapsed, now))
}

function pause() {
    cancelAnimationFrame(render)
}
function resume() {
    lastNow = performance.now()
    requestAnimationFrame(render)
}


class Snowflake {
    constructor() {
        this.spawn()
    }

    spawn(anyY = false) {
        this.x = rand(0, width)
        this.y = anyY === true
            ? rand(-50, height + 50)
            : rand(-50, -10)
        this.xVel = rand(-.05, .05)
        this.yVel = rand(.02, .1)
        this.angle = rand(0, Math.PI * 2)
        this.angleVel = rand(-.001, .001)
        this.size = rand(7, 12)
        this.sizeOsc = rand(.01, .5)
    }

    update(elapsed, now) {
        const xForce = rand(-.001, .001);

        if (Math.abs(this.xVel + xForce) < .075) {
            this.xVel += xForce
        }

        this.x += this.xVel * elapsed
        this.y += this.yVel * elapsed
        this.angle += this.xVel * 0.05 * elapsed //this.angleVel * elapsed

        if (
            this.y - this.size > height ||
            this.x + this.size < 0 ||
            this.x - this.size > width
        ) {
            this.spawn()
        }

        this.render()
    }

    render() {
        ctx.save()
        const { x, y, angle, size } = this
        ctx.beginPath()
        ctx.arc(x, y, size * 0.2, 0, Math.PI * 2, false)
        ctx.fill()
        ctx.restore()
    }
}

// Utils
const rand = (min, max) => min + Math.random() * (max - min)

function resize() {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
}

window.addEventListener('resize', resize)
window.addEventListener('blur', pause)
window.addEventListener('focus', resume)
init()


var timings = [
    [, , , , , , , 0],
    [1, 0, 0, 0, 0, 0, 0, 138],
    [0, 1, 0, 0, 0, 0, 0, 500],
    [0, 0, 0, 0, 0, 0, 1, 836],
    [0, 0, 0, 1, 0, 0, 0, 1415],
    [0, 1, 0, , 0, 0, 0, 1734],
    [0, 0, 0, 0, 0, 1, 0, 2053],
    [0, 0, 0, 0, 1, 0, 0, 2640],
    [0, 0, 1, 0, 0, 0, 0, 2933],
    [1, 0, 0, 0, 0, 0, 0, 3287],
    [0, 0, 0, 0, 0, 1, 0, 3658],
    [0, 0, , 1, 0, 0, 0, 3926],



    [1, 1, 0, 0, 0, 0, 0, 5106],
    [0, 1, 1, 0, 0, 0, 0, 5469],
    [0, 0, 1, 1, 0, 0, 0, 5805],
    [0, 0, 0, 1, 1, 0, 0, 6194],
    [0, 0, 0, 0, 1, 1, 0, 6487],
    [0, 0, 0, 0, 0, 1, 1, 6789],
    [0, 0, 0, 0, 1, 1, 0, 7079],
    [0, 0, 0, 1, 1, 0, 0, 7366],
    [0, 0, 1, 1, 0, 0, 0, 7590],
    [0, 1, 1, 0, 0, 0, 0, 7722],
    [1, 1, 0, 0, 0, 0, 0, 7974],
    [0, 1, 1, 0, 0, 0, 0, 8261],
    [0, 0, 1, 1, 0, 0, 0, 8591],
    [0, 0, 0, 1, 1, 0, 0, 8934],
    [1, 1, 1, 1, 1, 1, 1, 9513],


    [1, 0, 0, 0, 0, 0, 0, 10138],
    [0, 1, 0, 0, 0, 0, 0, 10467],
    [0, 0, 0, 0, 0, 0, 1, 10836],
    [0, 0, 0, 1, 0, 0, 0, 11415],
    [0, 1, 0, 0, 0, 0, 0, 11734],
    [0, 0, 0, 0, 0, 1, 0, 12053],
    [0, 0, 0, 0, 1, 0, 0, 12640],
    [0, 0, 1, 0, 0, 0, 0, 12933],
    [1, 0, 0, 0, 0, 0, 0, 13287],
    [0, 0, 0, 0, 0, 1, 0, 13658],
    [0, 0, 0, 1, 0, 0, 0, 13926],

    [1, 1, 0, 0, 0, 0, 0, 15106],
    [0, 1, 1, 0, 0, 0, 0, 15469],
    [0, 0, 1, 1, 0, 0, 0, 15805],
    [0, 0, 0, 1, 1, 0, 0, 16194],
    [0, 0, 0, 0, 1, 1, 0, 16487],
    [0, 0, 0, 0, 0, 1, 1, 16789],
    [0, 0, 0, 0, 1, 1, 0, 17079],
    [0, 0, 0, 1, 1, 0, 0, 17366],
    [0, 0, 1, 1, 0, 0, 0, 17590],
    [0, 1, 1, 0, 0, 0, 0, 17722],
    [1, 1, 0, 0, 0, 0, 0, 17974],
    [0, 1, 1, 0, 0, 0, 0, 18261],
    [0, 0, 1, 1, 0, 0, 0, 18591],
    [0, 0, 0, 1, 1, 0, 0, 18934],
    [1, 1, 1, 1, 1, 1, 1, 19513],
]

function play_lights() {
    var i = timings.length;
    function myLoop(frames, j) {
        setTimeout(function () {
            console.log(frames)
            frames.forEach((pixel, i) => {
                console.log("111111")
                if (i < 7) {
                    if (pixel === 1) {
                        document.getElementsByClassName('star-' + i)[0].style.opacity = pixel / 2
                        document.getElementsByClassName('star-' + i)[0].style.transition = `opacity 0.1s ease-in`
                    } else {
                        document.getElementsByClassName('star-' + i)[0].style.opacity = 0
                    }
                }
            });
            i++;
            if (i < timings.length) {
                myLoop();
            }
        }, frames[7])
    }

    timings.forEach((frames, j) => {
        myLoop(frames, j);
    });
}

