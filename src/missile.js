missile.prototype = new SpaceObject();
function missile(canvas, x, y, angle, srcDx, srcDy, radius){
	this.canvas = canvas;
	this.ttl; //Time To Live
	this.startTime;
	this.x = x;
	this.y = y;
	var velocityMx = 10;
	this.radius = radius ? radius : 3;
	this.angle = angle;
	this.velocity = {
		x : 0,
		y: 0
	};
	
	this.init = function(){
		this.startTime = (new Date()).getTime();
		this.ttl = 1.5;
		
		var cosTheta = Math.cos(this.angle);
		var sinTheta = Math.sin(this.angle);							
		var dx = cosTheta;
		var dy = sinTheta;
		//console.log("accelerate", dx, dy);
		//console.log("angle", (Math.PI * 2) - this.angle, 360 - toDegrees(this.angle));
		
		this.velocity.x = velocityMx * dx;
		this.velocity.y = velocityMx * dy;
	}
	
	this.update = function(){
		var now = (new Date()).getTime();
		if(now - this.startTime > (this.ttl * 1000)){
			this.destroy();
		}
		
		game.getPowerUp(this, "update");
		missile.prototype.update.call(this);
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		ctx.strokeStyle = 'rgb(90, 175, 255)';
		ctx.fillStyle = 'rgb(90, 175, 255, 0.7)';
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
	
	this.canCollideWith = function(item){
		var can = (item instanceof asteroid || item instanceof alienship);
		return can;
	}

	this.getBoundingBox = function getBoundingBox(){
		var left = this.x - this.radius;
		var right = this.x + this.radius;
		var top = this.y - this.radius;
		var bottom = this.y + this.radius;
		return [{x:left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}];
	};	
	
	this.init();
	return this;
}


alien_missile.prototype = new missile();
function alien_missile(canvas, x, y, angle, srcDx, srcDy, radius){
		
	alien_missile.prototype.canvas = canvas;
	this.ttl; //Time To Live
	this.startTime;
	this.x = x;
	this.y = y;
	var velocityMx = 10;
	this.radius = radius ? radius : 3;
	this.angle = angle;
	this.velocity = {
		x : 0,
		y: 0
	};

	this.canCollideWith = function(item){
		var can = (	item instanceof asteroid ||
				item instanceof spaceship	);
		return can;
	}
	
	this.init();
	return this;
}
