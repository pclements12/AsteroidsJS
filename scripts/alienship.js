alienship.prototype = new SpaceObject();
function alienship(canvas){

	this.angle = Math.PI / 2; //constant, straight up

	var lastTurn = (new Date()).getTime();
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
		//var level = getLevel();
		//if (getLevel() < 12) {
		//	this.setVelocity(	randomFloat(-level - 5, level + 5),
		//						randomFloat(-level - 5, level + 5));
		//} else {
		//	this.setVelocity(	randomFloat(-17, 17), 
		//						randomFloat(-17, 17));
		//}
		//this.shotDelay = randomInt(2000 - (10 * level), 5000 - (10 * level));
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
		return [getArcCoordinates(this.x, this.y, normalizeAngle(120), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(60), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(300), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(240), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(0), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(180), 20)];
	}

	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		var shipPoints = this.getShipPoints();
		ctx.strokeStyle = 'rgb(255, 255, 255)';
		connectTheDots(ctx, shipPoints);
		connectTheDots(ctx, shipPoints[5], shipPoints[6]);

	}

	this.shoot = function(){

	}

	this.update = function(){
		alienship.prototype.update.call(this);
		this.paint();
	}

	this.init = init;

	this.init();
	return this;
}
