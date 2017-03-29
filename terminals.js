class Rect {

	constructor(x, y, w, h) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}

	collidesWith(other) {
		var xoverlap = (this.x < other.x+other.w && other.x < this.x) || (this.x+this.w < other.x+other.w && other.x < this.x+this.w) || (this.x === other.x && this.x+other.w === other.x+other.w)
		var yoverlap = (this.y < other.y+other.h && other.y < this.y) || (this.y+this.h < other.y+other.h && other.y < this.y+this.h) || (this.y === other.y && this.y+other.h === other.y+other.h)
		return xoverlap && yoverlap
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

		this.move(0, 0, 0)
	}

	move(speed, xdir, ydir) {
		var nx = speed * xdir
		var ny = speed * ydir
		this.rect.x += nx
		this.rect.y += ny
		if (this.gravity) {
			this.falling = true
		}

		for (var i = 0; i < this.col.length; i++) {
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
					this.rect.y = this.col[i].rect.y+this.col[i].rect.h
				}
			}
		}

		this.brect.x = this.rect.x
		this.brect.y = this.rect.y+this.rect.h

		if (this.gravity) {
			for (var i = 0; i < this.col.length; i++) {
				if (this.brect.collidesWith(this.col[i].rect)) {
					this.falling = false
					this.vy = 0
				}
			}
		}

	}

	fall() {
		var t = 15
		this.vy += 0.3
		if (Math.min(t, this.vy) === t) {
			this.vy = t
		}
		this.move(this.vy, 0, 1)
	}

	jump() {
		this.vy = -8
		this.fall()
	}

}

class Game {
	
	constructor() {
		this.maxFPS = 60

		this.keyState = new Array(300)

		document.addEventListener("keydown", function(e){this.keyState[e.keyCode || e.which] = true}.bind(this))
		document.addEventListener("keyup", function(e){this.keyState[e.keyCode || e.which] = false}.bind(this))

		// Canvas initialization
		this.canvas = document.createElement("canvas")
		this.canvas.width = 800
		this.canvas.height = 500
		this.canvas.style.backgroundColor = "black"
		this.context = this.canvas.getContext("2d")
		document.body.insertBefore(this.canvas, document.body.childNodes[0])
		this.frameNo = 0
		this.interval = setInterval(this.update.bind(this), 1000/this.maxFPS)
		
		this.entities = []

		var what = new Rect(10, 10, 50, 50)
		var is = new Rect(10, 480, 600, 10)
		this.hey = new GameObject(what, this.entities, "#0F0", true)
		this.up = new GameObject(is, this.entities, "#00F", false)
		this.entities.push(this.hey)
		this.entities.push(this.up)
	}

	drawRect(color, rect) {
		this.context.fillStyle = color
		this.context.fillRect(rect.x, rect.y, rect.w, rect.h)
	}

	update() {
		this.clearScreen()

		for (var i = 0; i < this.entities.length; i++) {
			this.drawRect(this.entities[i].color, this.entities[i].rect)

			if (this.entities[i].falling) {
				this.entities[i].fall()
			}
		}	

		if (this.keyState[188] === true && !this.hey.falling) { // comma
			this.hey.jump()
		}

		if (this.keyState[65] === true) { // a
			this.hey.move(4, -1, 0)
		}

		if (this.keyState[69]) { //e
			this.hey.move(4, 1, 0)
		}
	}

	clearScreen() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

}

var hey = new Game()
