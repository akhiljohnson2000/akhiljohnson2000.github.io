
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
    document.getElementById('button-container-id').style.opacity = 0;
    setTimeout(() => {
    play_lights();
    var x = document.getElementById("myAudio");
    x.volume = 0.5;
    x.play();
    }, 1000);
    
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
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 138],
    [0, 1, 0, 0, 0, 0, 0, 500],
    [0, 0, 0, 0, 0, 0, 1, 836],
    [0, 0, 0, 1, 0, 0, 0, 1415],
    [0, 1, 0, 0, 0, 0, 0, 1734],
    [0, 0, 0, 0, 0, 1, 0, 2053],
    [0, 0, 0, 0, 1, 0, 0, 2640],
    [0, 0, 1, 0, 0, 0, 0, 2933],
    [1, 0, 0, 0, 0, 0, 0, 3287],
    [0, 0, 0, 0, 0, 1, 0, 3658],
    [0, 0, 0, 1, 0, 0, 0, 3926],

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

    [1, 1, 0, 0, 0, 0, 0, 19828],
    [0, 1, 1, 0, 0, 0, 0, 20221],
    [0, 0, 1, 1, 0, 0, 0, 20478],
    [0, 0, 0, 1, 1, 0, 0, 20818],
    [0, 0, 0, 0, 1, 1, 0, 21161],
    [0, 0, 0, 0, 0, 1, 1, 22329],
    [0, 0, 0, 0, 1, 1, 0, 22698],
    [0, 0, 0, 1, 1, 0, 0, 23007],
    [0, 0, 1, 1, 0, 0, 0, 23308],
    [0, 1, 1, 0, 0, 0, 0, 22570],
    [1, 1, 0, 0, 0, 0, 0, 23910],
    [0, 1, 1, 0, 0, 0, 0, 24203],
    [0, 0, 1, 1, 0, 0, 0, 25133],
    [0, 0, 0, 1, 1, 0, 0, 25481],
    [1, 0, 1, 0, 0, 0, 0, 25790],
    [0, 0, 0, 1, 0, 0, 1, 26073],
    [0, 1, 0, 1, 0, 1, 0, 26385],



    [1, 0, 0, 0, 0, 0, 0, 27672],
    [0, 1, 0, 0, 0, 0, 0, 28010],
    [0, 0, 1, 0, 0, 0, 0, 28285],
    [0, 0, 0, 1, 0, 0, 0, 28629],
    [0, 0, 0, 0, 1, 0, 0, 28963],
    [0, 0, 0, 0, 0, 1, 0, 30166],
    [0, 0, 0, 0, 0, 0, 1, 30461],
    [0, 0, 0, 0, 0, 1, 0, 30776],
    [0, 0, 0, 0, 1, 0, 0, 31098],
    [0, 0, 0, 1, 0, 0, 0, 31481],
    [0, 0, 1, 0, 0, 0, 0, 32635],
    [0, 1, 0, 0, 0, 0, 0, 32969],
    [1, 0, 0, 0, 0, 0, 0, 33304],
    [0, 1, 1, 1, 0, 0, 0, 33596],
    [0, 0, 1, 1, 1, 0, 0, 33912],
    [0, 0, 0, 1, 1, 1, 0, 35215],
    [0, 0, 0, 0, 1, 1, 1, 35483],
    [0, 0, 0, 1, 1, 1, 0, 35787],
    [0, 0, 1, 1, 1, 0, 0, 36077],
    [0, 1, 1, 1, 0, 0, 0, 36387],
    [1, 1, 1, 0, 0, 0, 0, 36713],



    [0, 1, 1, 1, 0, 0, 0, 37100],
    [0, 0, 1, 1, 1, 0, 0, 37383],
    [0, 0, 0, 1, 1, 1, 0, 37726],
    [0, 0, 0, 0, 1, 1, 1, 38003],
    [0, 0, 0, 1, 1, 1, 0, 38327],
    [0, 0, 1, 1, 1, 0, 0, 38605],
    [0, 1, 1, 1, 0, 0, 0, 38936],


    
    [1, 0, 1, 0, 1, 0, 1, 40200],
    [0, 1, 0, 1, 0, 1, 0, 40700],
    [1, 0, 1, 0, 1, 0, 1, 41200],
    [0, 1, 0, 1, 0, 1, 0, 41700],
    [1, 0, 1, 0, 1, 0, 1, 42200],
    [0, 1, 0, 1, 0, 1, 0, 42700],
    [1, 0, 1, 0, 1, 0, 1, 43200],
    [0, 1, 0, 1, 0, 1, 0, 43700],
    [1, 0, 1, 0, 1, 0, 1, 44200],
    [0, 1, 0, 1, 0, 1, 0, 44700],
    [1, 0, 1, 0, 1, 0, 1, 45200],
    [0, 1, 0, 1, 0, 1, 0, 45700],
    [1, 0, 1, 0, 1, 0, 1, 46200],
    [0, 1, 0, 1, 0, 1, 0, 46700],
    [1, 0, 1, 0, 1, 0, 1, 47200],
    [0, 1, 0, 1, 0, 1, 0, 47700],
    [1, 0, 1, 0, 1, 0, 1, 48200],
    [0, 1, 0, 1, 0, 1, 0, 48700],
    [1, 0, 1, 0, 1, 0, 1, 49200],
    [0, 1, 0, 1, 0, 1, 0, 49700],
    [1, 0, 1, 0, 1, 0, 1, 50200],
    [0, 1, 0, 1, 0, 1, 0, 50700],
    [1, 0, 1, 0, 1, 0, 1, 51200],
    [0, 1, 0, 1, 0, 1, 0, 51700],
    [1, 0, 1, 0, 1, 0, 1, 52200],
    [0, 1, 0, 1, 0, 1, 0, 52700],
    [1, 0, 1, 0, 1, 0, 1, 53200],
    [0, 1, 0, 1, 0, 1, 0, 53700],
    [1, 0, 1, 0, 1, 0, 1, 54200],
    [0, 1, 0, 1, 0, 1, 0, 54700],
    [1, 0, 1, 0, 1, 0, 1, 55200],
    [0, 1, 0, 1, 0, 1, 0, 55700],
    [1, 0, 1, 0, 1, 0, 1, 56200],
    [0, 1, 0, 1, 0, 1, 0, 56700],
    [1, 0, 1, 0, 1, 0, 1, 57200],

    [0, 1, 0, 1, 0, 1, 0, 57565],
    [1, 1, 1, 0, 0, 0, 1, 57873],
    [0, 1, 1, 1, 0, 1, 0, 58256],
    [1, 0, 1, 1, 0, 0, 1, 58529],
    [1, 1, 1, 1, 1, 1, 1, 59172]
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
                        document.getElementsByClassName('star-' + i)[0].style.opacity = pixel
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

