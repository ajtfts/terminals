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

	toString() {return "[object Rect]"}

}

class GameObject {

	constructor(rect, col, color="#F00", gravity=false) {
		if (!(rect instanceof Rect)) {
			this.rect = new Rect(rect[0], rect[1], rect[2], rect[3])
		}
		else {
			this.rect = rect
		}
		this.col = col
		this.color = color
		this.gravity = gravity

		this.brect = new Rect(this.rect.x, this.rect.y+this.rect.h, this.rect.w, 1)
		this.falling = false

		this.vy = 0

		this.col.push(this)
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

	toString() {return "[Object GameObject]"}

}

class Player extends GameObject {
	
	constructor(rect, col) {
		super(rect, col, "#0F0", true)
	}

	jump() {
		this.vy = -8
		this.fall()
	}

	toString() {return "[Object Player]"}

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

	toString() {return "[Object MovingPlat]"}

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
		this.lastframe = +new Date

		// Event Listeners

		this.keyState = {}

		this.canvas.addEventListener("keydown", (e) => {this.keyState[e.code] = true})
		this.canvas.addEventListener("keyup", (e) => {this.keyState[e.code] = false})

		
		this.entities = []

		this.player = new Player([10, 10, 50, 50], this.entities)

		this.levels = {}
		
		let testLevel = function() {
			this.playerPos = [100, 10]
			new GameObject([40, 500, 50, 10], this.entities, "#F0F", false)
			new GameObject([10, 530, 980, 10], this.entities, "#00F", false)
		
		}

		let otherLevel = function() {
			this.playerPos = [200, 10]
			new GameObject([600, 460, 10, 50], this.entities, "#FF0", false)
			new GameObject([10, 530, 980, 10], this.entities, "#F00", false)
		}

		this.addLevel("testLevel", testLevel)
		this.addLevel("otherLevel", otherLevel)
		this.update()

	}

	addLevel(levelID, callback) {
		this.levels[levelID] = callback.bind(this)
	}

	loadLevel(levelID) {
		this.entities = []
		this.levels[levelID]()
		this.player = new Player([this.playerPos[0], this.playerPos[1], 50, 50], this.entities)
		this.loaded = levelID

	}

	drawRect(color, rect) {
		this.context.fillStyle = color
		this.context.fillRect(rect.x, rect.y, rect.w, rect.h)
	}

	update() {
		this.clearScreen()

		this.now = +new Date
		this.deltaT = this.now - this.lastframe

		for (let i = 0; i < this.entities.length; i++) {
			this.drawRect(this.entities[i].color, this.entities[i].rect)
			if (this.entities[i].gravity === true) {
				this.entities[i].fall()
			}
		}	

		if (this.keyState["KeyW"] === true && !this.player.falling) {
			this.player.jump()
		}

		if (this.keyState["KeyA"] === true) {
			this.player.move(4, -1, 0)
		}

		if (this.keyState["KeyD"]) {
			this.player.move(4, 1, 0)
		}

		this.lastframe = this.now

		window.requestAnimationFrame(this.update.bind(this)) 
	}

	clearScreen() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

}

let hey = new Game()

hey.loadLevel("testLevel")
