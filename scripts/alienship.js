alienship.prototype = new SpaceObject();
function alienship(canvas){
	this.canvas = canvas;

	var turnDelay = 0; //ms
	this.angle = Math.PI / 2; //constant, straight up
	var lastTurn = (new Date()).getTime();
	var lastShot = (new Date()).getTime();
	var shotDelay = 0; //milliseconds
	var radius = 20;
	this.points = radius * 10;

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
		if (level < 7) {
			this.setVelocity(	randomFloat(-level - 1, level + 1),
						randomFloat(-level - 1, level + 1));
		} else {
			this.setVelocity(	randomFloat(-7, 7), 
						randomFloat(-7, 7));
		}
		window.alien = this;
		//set initial shot delay
		this.shotDelay = randomInt(2000 - (10 * level), 5000 - (10 * level));
		this.turnDelay = randomInt(1000, 3500);
	}	

	this.canCollideWith = function(item){
		var can =  
			(item instanceof asteroid ||
			item instanceof missile ||
			item instanceof spaceship);
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
		return [getArcCoordinates(this.x, this.y, normalizeAngle(0), radius),
				getArcCoordinates(this.x, this.y, normalizeAngle(60), radius),
				getArcCoordinates(this.x, this.y, normalizeAngle(120), radius),
				getArcCoordinates(this.x, this.y, normalizeAngle(180), radius),
				getArcCoordinates(this.x, this.y, normalizeAngle(240), radius),
				getArcCoordinates(this.x, this.y, normalizeAngle(300), radius)];
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
		var p = game.getPlayer().getCoordinates();
		var a = this.getCoordinates();
		//set fuzz to be +/- 6 degrees for this guy (seems to be about the right balance)
		//bumped fuzz up to +- 11, seemed too accurate to me
		var fuzz = toRadians(randomFloat(-11, 11));
		var vector = {x: p.x - a.x, y: p.y - a.y};
		var angle = Math.atan(vector.y/vector.x);
		var origin = vectorAdd(this.getCoordinates(), scaleVector(angle, 23));
		if (a.x <= p.x) {	
			game.addItem(new alien_missile(this.canvas, origin.x, origin.y, angle + fuzz, this.velocity.x, this.velocity.y, 3));
		} else {
			game.addItem(new alien_missile(this.canvas, origin.x, origin.y, angle - Math.PI + fuzz, this.velocity.x, this.velocity.y, 3));
		}
	}

	this.changeDirection = function() {
		var max = game.getLevel() + 3;
		if (max > 7) {
			max = 7;
		}		
		var xVel = this.getVelocity().x;
		var yVel = this.getVelocity().y;
		this.setVelocity(	xVel + randomFloat(-2, 2),
					yVel + randomFloat(-2, 2));
		if (this.getVelocity().x > max) {
			this.setVelocity( 7, this.getVelocity().y);
		}
		if (this.getVelocity().x < -max) {
			this.setVelocity( -max, this.getVelocity().y);
		}
		if (this.getVelocity().y > max) {
			this.setVelocity( this.getVelocity().x, max);
		}
		if (this.getVelocity().y < -max) {
			this.setVelocity( this.getVelocity().x, -max);
		}
		//console.log(this.getVelocity());
		this.turnDelay = randomInt(1000, 3500);
		lastTurn = (new Date()).getTime();		
	}

	this.update = function(){
		var now = (new Date()).getTime();
		if(now - lastShot > this.shotDelay){
			this.shoot();
		}
		if(now - lastTurn > this.turnDelay){
			this.changeDirection();
		}
		alienship.prototype.update.call(this);
	}

	this.init = init;

	this.init();
	return this;
}
