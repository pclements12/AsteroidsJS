
spaceship.prototype = new SpaceObject();
function spaceship(canvas){				
	this.canvas = canvas;
	
	this.angle = Math.PI * 1.5; //270 Degrees, IE, straight up, or -1, 0 on unit circle
	
	var fuzz = 1e-4; //handle 0-ish floats
	var MAX_SPEED = 25; //max vector magnitude of velocity
	var FINE_TURN_SPEED = 5; //degrees per turn command
	var COARSE_TURN_SPEED = 10; //degrees per turn command
	var lastShot = (new Date()).getTime();
	var shotDelay = 200; //millis
	this.boosterCount = 0;
	
	this.getShotDelay = function(){
		return shotDelay;
	}
	
	this.getVelocity = function(){
		return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
	}	
	
	this.smokeTrail = function(){
		if(this.boosterCount == 0){
			//show the booster + smoke for 20 animation loops
			this.boosterCount = 20;
		}
	}
	
	this.accelerate = function(){
						
		var cosTheta = Math.cos(this.angle);
		var sinTheta = Math.sin(this.angle);							
		var dx = cosTheta;
		var dy = sinTheta;
		//console.log("accelerate", dx, dy);
		//console.log("angle", (Math.PI * 2) - this.angle, 360 - toDegrees(this.angle));
		
		this.velocity.x += dx;
		this.velocity.y += dy;		
		
		if(this.getVelocity() > MAX_SPEED){
			this.velocity.x -= dx;
			this.velocity.y -= dy;
		}
		
		this.smokeTrail();
	}
	
	this.rotateLeft = function(){
		this.rotate(1);
	}
	
	this.rotateRight = function(){
		this.rotate(-1);
	}
	
	this.getShipPoints = function(){
		var degAngle = toDegrees(this.angle);
		return [getArcCoordinates(this.x, this.y, degAngle, 20),
			getArcCoordinates(this.x, this.y, normalizeAngle(degAngle - 140), 20),
			getArcCoordinates(this.x, this.y, normalizeAngle(degAngle + 140), 20)];
	}
	
	this.getBoundingBox = function getBoundingBox(){
		//get the ship's points
		
		var shipPoints = this.getShipPoints();
		var points = shipPoints;
		var maxX = points[0].x;
		var minX = points[0].x;
		var maxY = points[0].y;
		var minY = points[0].y;
		for(var i = 1; i < 3; i++){
			maxX = Math.max(maxX, points[i].x);
			minX = Math.min(minX, points[i].x);
			maxY = Math.max(maxY, points[i].y);
			minY = Math.min(minY, points[i].y);
		}
		
		return [{x: minX, y: minY}, {x: maxX, y: minY}, {x: maxX, y: maxY}, {x: minX, y: maxY}];
	};

	this.rotationTime = (new Date()).getTime();
	this.rotationSpeed = 0;
	this.rotate = function(sign){
		var now = (new Date()).getTime();
		if(now - this.rotationTime > 100){
			//console.log("fine rotation", now);
			this.rotationSpeed = FINE_TURN_SPEED;
		}
		else{
			//console.log("rough / continuous rotation", now);
			this.rotationSpeed = COARSE_TURN_SPEED;
		}
		this.rotationTime = now;
		if(sign < 0){
			this.angle += toRadians(this.rotationSpeed);
		}
		else{
			this.angle -= toRadians(this.rotationSpeed);
		}				
		if(this.angle < 0){
			this.angle = (Math.PI * 2) + this.angle;
		}
		this.angle = this.angle % toRadians(360);
		//console.log("rotated", (Math.PI * 2) - this.angle, 360 - toDegrees(this.angle));
	}
	
	this.shoot = function(){
		var now = (new Date()).getTime();
		if(now - lastShot < shotDelay){
			return;
		}
		lastShot = now;
		var degAngle = toDegrees(this.angle);
		var p1 = getArcCoordinates(this.x, this.y, degAngle, 20);
		if(!game.getPowerUp(this, "shoot")){
			this.game.addItem(new missile(this.canvas, p1.x, p1.y, this.angle, this.velocity.x, this.velocity.y, 3));
		}		
	}	
	
	this.canCollideWith = function(item){
		var can =  
			(item instanceof asteroid ||
			item instanceof powerup ||
			item instanceof alien_missile);
		return can;
	}
	
	this.destroy = function(){
		this.lives--;
		this.boosterCount = 0;
		this.destroyed = true;
		this.keyInput.clearInputs();
	}
	
	this.update = function(){
		spaceship.prototype.update.call(this);
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		var shipPoints = this.getShipPoints();
		ctx.strokeStyle = 'rgb(0, 255, 0)';
		connectTheDots(ctx, shipPoints);
		if(this.boosterCount > 0){
			this.drawBooster();
		}
		//debug collisions:
		//connectTheDots(ctx, this.getBoundingBox());
	}
	
	this.drawBooster = function(){
		this.boosterCount--;
		var d_angle = toDegrees(this.angle);
		var width = randomInt(5, 10);
		var height = randomInt(10, 20);
		var tail = vectorAdd({x: this.x, y: this.y}, scaleVector(this.angle, -18));
		
		var points = [	getArcCoordinates(tail.x, tail.y, d_angle - 90, width),
						getArcCoordinates(tail.x, tail.y, d_angle + 90, width),
						getArcCoordinates(tail.x, tail.y, normalizeAngle(180 + d_angle), height)];
		var ctx = this.canvas.getContext("2d");
		ctx.beginPath();
		ctx.strokeStyle = "orange";
		connectTheDots(ctx, points);
		var opacity = randomFloat(0.25, 0.75);
		var color = randomInt(0, 3);
		switch(color){
			case 0:
				color = "rgba(255, 0, 0, ";
				break;
			case 1:
				color = "rgba(255, 255, 224, ";
				break;
			case 2:
				color = "rgba(255, 102, 0, ";
		}
		ctx.fillStyle = color + opacity + ")";
		ctx.fill();

		var point = points[2];		
		this.game.addEffect(new smoke(this.canvas, point.x, point.y, this.angle));		
	}

	this.reset = function(){
		this.destroyed = false;
		this.init();
		this.keyInput.clearInputs();
	}
	
	this.init = function(){
		spaceship.prototype.init.call(this);
		this.angle = Math.PI * 1.5;
		this.x = this.canvas.width / 2;
		this.y = this.canvas.height / 2;
	}
	
	this.lives = 3;
	this.init();

	this.keyInput = new (function(player){
		var leftInterval, rightInterval, upInterval, shootInterval;
		var left = false;
		var right = false;
		var up = false;
		var shoot = false;

		this.clearInputs = function(){
			left = right = up = shoot = false;
			clearInterval(leftInterval);
			clearInterval(rightInterval);
			clearInterval(upInterval);
			clearInterval(shootInterval);
			leftInterval = rightInterval = upInterval = shootInterval = null;
		}
		
		this.isAccel = function(){
			return up;
		}
		
		this.isRotate = function(){
			return left || right;
		}
		
		this.isShoot = function(){
			return shoot;
		}
		
		this.handleInput = function(e){
			//39 right, 37 left, 38 up, 40 down, 32 space;
			var down = e.type === "keydown";
			switch(e.keyCode){
				//left
				case 37:
					if(!left && down){
						leftInterval = setInterval(function(){
							player.rotateLeft();
						}, 30);
					}
					left = down;
					break;
				//right
				case 39:
					if(!right && down){
						rightInterval = setInterval(function(){
							player.rotateRight();
						}, 30);
					}
					right = down;
					break;
				//up
				case 38:
					if(!up && down){
						upInterval = setInterval(function(){
							player.accelerate();
						}, 50);
					}
					up = down;
					break;
			    case 32:
					if(!shoot && down){
						shootInterval = setInterval(function(){
							player.shoot();
						}, player.getShotDelay());
					}
					shoot = down;
					break;
			}
			if(left){
				player.rotateLeft();
			}
			else{
				clearInterval(leftInterval);
				leftInterval = null;
			}
			if(right){
				player.rotateRight();
			}	
			else{
				clearInterval(rightInterval);
				rightInterval = null;
			}
			if(up){
				player.accelerate();
			}
			else{
				clearInterval(upInterval);
				upInterval = null;
			}
			if(shoot){
				player.shoot();
			}
			else{
				clearInterval(shootInterval);
				shootInterval = null;
			}
		};
	})(this);
	
	this.handleKeyInput = function(e){
		this.keyInput.handleInput(e);
	};
	
	return this;
}
