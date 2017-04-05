class Rect {

	constructor(x, y, w, h) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}

	collidesWith(other) {
		return (this.x < other.x + other.w &&
				this.x + this.w > other.x &&
				this.y < other.y + other.h &&
				this.h + this.y > other.y)
	}

}

class GameObject {

	constructor(rect, col, color="#F00", gravity=false) {
		this.rect = rect
		this.col = col
		this.color = color
		this.gravity = gravity

		this.brect = new Rect(this.rect.x, this.rect.y+this.rect.h, this.rect.w, 1)
		this.falling = false

		this.vy = 0

		// this.move(0, 0, 0)
	}

	move(speed, xdir, ydir) {
		let nx = speed * xdir
		let ny = speed * ydir
		let didMove = true
		this.rect.x += nx
		this.rect.y += ny
		if (this.gravity) {
			this.falling = true
		}

		// collision detection
		for (let i = 0; i < this.col.length; i++) {
			if (this.rect.collidesWith(this.col[i].rect) && this != this.col[i]) {
				if (nx > 0) {
					this.rect.x = this.col[i].rect.x-this.rect.w
				}

				if (nx < 0) {
					this.rect.x = this.col[i].rect.x+this.col[i].rect.w
				}

				if (ny > 0) {
					this.rect.y = this.col[i].rect.y-this.rect.h
				}

				if (ny < 0) {
					this.vy = 0
					this.rect.y = this.col[i].rect.y+this.col[i].rect.h
				}
				didMove = false
			}
		}

		this.brect.x = this.rect.x
		this.brect.y = this.rect.y+this.rect.h

		if (this.gravity) {
			for (let i = 0; i < this.col.length; i++) {
				if (this.brect.collidesWith(this.col[i].rect) && this.vy >= 0) {
					this.falling = false
					this.vy = 0
				}
			}
		}
	return didMove
	}

	fall() {
		let t = 15
		this.vy += 0.3
		if (Math.min(t, this.vy) === t) {
			this.vy = t
		}
		this.move(this.vy, 0, 1)
	}

}

class Player extends GameObject {
	
	constructor(rect, col) {
		super(rect, col, "#0F0", true)
	}

	jump() {
		this.vy = -8
		this.fall()
	}
}

class MovingPlat extends GameObject {

	constructor(rect, col, xdir, ydir, distance, speed) {
		super(rect, col, "#F0F", false)
		this.xdir = xdir
		this.ydir = ydir
		this.distance = distance
		this.speed = speed

		this.active = true
		this.moved = 0
	}

	platMove() {
		if (this.moved <= this.distance) {
			if (this.move(this.speed, this.xdir, this.ydir)) {
				this.moved += this.speed
			}
		} else {
			this.xdir *= -1
			this.ydir *= -1
			this.moved = 0
		}
	}

}

class Game {
	
	constructor() {
		this.maxFPS = 60

		// Canvas initialization
		this.canvas = document.createElement("canvas")
		this.canvas.width = 1000
		this.canvas.height = 562
		this.canvas.tabIndex = 1
		this.canvas.style.outline = "none"
		this.canvas.style.backgroundColor = "black"
		this.context = this.canvas.getContext("2d")
		document.body.insertBefore(this.canvas, document.body.childNodes[0])
		this.frameNo = 0
		this.interval = setInterval(this.update.bind(this), 1000/this.maxFPS)

		// Event Listeners

		this.keyState = {}

		this.canvas.addEventListener("keydown", (e) => {this.keyState[e.code] = true})
		this.canvas.addEventListener("keyup", (e) => {this.keyState[e.code] = false})

		
		this.entities = []

		let what = new Rect(10, 10, 50, 50)
		let is = new Rect(10, 480, 600, 10)
		let testPlatRect = new Rect(100, 380, 80, 10)
		let testPlatRect0 = new Rect(620, 480, 80, 10)
		this.hey = new Player(what, this.entities)
		this.up = new GameObject(is, this.entities, "#00F", false)
		this.testPlat = new MovingPlat(testPlatRect, this.entities, 1, 0, 100, 2)
		this.testPlat0 = new MovingPlat(testPlatRect0, this.entities, 0, -1, 100, 2)
		this.entities.push(this.hey)
		this.entities.push(this.up)
		this.entities.push(this.testPlat)
		this.entities.push(this.testPlat0)
	}

	drawRect(color, rect) {
		this.context.fillStyle = color
		this.context.fillRect(rect.x, rect.y, rect.w, rect.h)
	}

	update() {
		this.clearScreen()

		this.testPlat.platMove()
		this.testPlat0.platMove()

		for (let i = 0; i < this.entities.length; i++) {
			this.drawRect(this.entities[i].color, this.entities[i].rect)
			if (this.entities[i].gravity === true) {
				this.entities[i].fall()
			}
		}	

		if (this.keyState["KeyW"] === true && !this.hey.falling) {
			this.hey.jump()
		}

		if (this.keyState["KeyA"] === true) {
			this.hey.move(4, -1, 0)
		}

		if (this.keyState["KeyD"]) {
			this.hey.move(4, 1, 0)
		}
	}

	clearScreen() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

}

let hey = new Game()
