alienship.prototype = new SpaceObject();
function alienship(canvas){
	this.canvas = canvas;

	var turnDelay = (new Date()).getTime();
	this.angle = Math.PI / 2; //constant, straight up

	var lastTurn = (new Date()).getTime();
	var lastShot = (new Date()).getTime();
	var shotDelay = 0; //milliseconds

	this.getLastTurn = function(){
		return lastTurn;
	}

	function init(){
		this.canvas = canvas;
		alienship.prototype.init.call(this);
		this.x, this.y;
		this.x = randomInt(0, this.canvas.width);
		this.y = randomInt(0, this.canvas.height);
		this.paint;
		var level = game.getLevel();
		if (level < 10) {
			this.setVelocity(	randomFloat(-level - 3, level + 3),
						randomFloat(-level - 3, level + 3));
		} else {
			this.setVelocity(	randomFloat(-13, 13), 
						randomFloat(-13, 13));
		}
		//set initial shot delay
		this.shotDelay = randomInt(2000 - (10 * level), 5000 - (10 * level));
	}	

	this.canCollideWith = function(item){
		var can =  
			(//(item instanceof asteroid ||
			item instanceof missile ||
			item instanceof spaceship)
		return can;
	}
	
	this.getBoundingBox = function getBoundingBox(){
		var shipPoints = this.getShipPoints();
		var points = shipPoints;
		var maxX = points[0].x;
		var minX = points[0].x;
		var maxY = points[0].y;
		var minY = points[0].y;
		for (var i = 1; i < 6; i++) {
			maxX = Math.max(maxX, points[i].x);
			minX = Math.min(minX, points[i].x);
			maxY = Math.max(maxY, points[i].y);
			minY = Math.min(minY, points[i].y);
		}

		return [{x: minX, y: minY}, {x: maxX, y: minY}, {x: maxX, y: maxY}, {x: minX, y: maxY}];
	}

	this.getShipPoints = function(){
		var degAngle = toDegrees(this.angle);
		return [getArcCoordinates(this.x, this.y, normalizeAngle(0), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(60), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(120), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(180), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(240), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(300), 20)];
	}

	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		var shipPoints = this.getShipPoints();
		ctx.strokeStyle = 'rgb(255, 255, 255)';
		connectTheDots(ctx, shipPoints);
		ctx.beginPath();
		ctx.moveTo(shipPoints[0].x, shipPoints[0].y);
		ctx.lineTo(shipPoints[3].x, shipPoints[3].y);
		ctx.stroke();
	}

	this.shoot = function(){
		lastShot = (new Date()).getTime();
		var level = game.getLevel();
		this.shotDelay = randomInt(2000 - (10 * level), 5000 - (10 * level));
		console.log("new shot delay: ", this.shotDelay);
		var p = game.getPlayer().getCoordinates();
		var a = this.getCoordinates();
		var fuzz = randomInt(-30, 30);
		var vector = {x: p.x - a.x + fuzz, y: p.y - a.y + fuzz};
		var angle = Math.atan(vector.y/vector.x);
		var origin = vectorAdd(this.getCoordinates(), scaleVector(angle, 20));
		game.addItem(new alien_missile(this.canvas, origin.x, origin.y, angle, this.velocity.x, this.velocity.y, 3));
	}

	this.update = function(){
		var now = (new Date()).getTime();
		console.log("time til next shot: ", now - lastShot, now - lastShot > this.shotDelay ? "SHOOT" : "HOLD FIRE");
		if(now - lastShot > this.shotDelay){
			this.shoot();
		}
		alienship.prototype.update.call(this);
	}

	this.init = init;

	this.init();
	return this;
}
