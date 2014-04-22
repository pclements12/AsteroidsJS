explosion.prototype = new SpaceObject();
function explosion(canvas, x, y, radius){
	this.canvas = canvas;
	this.x = x + randomInt(-3, 3);
	this.y = y + randomInt(-3, 3);
	this.ttl = 10;
	this.radius = radius;
	this.velocity = {
		x : 0,
		y: 0
	};
	
	this.init = function(){
		this.opacity = 0.8;
	}
	
	this.getBoundingBox = function(){
		return [{x: -1, y: -1}, {x: -1, y: -1}, {x: -1, y: -1}, {x: -1, y: -1}];
	}
	
	this.update = function(){
		this.ttl--;
		if(this.ttl == 0){
			this.destroy();
		}		
		this.radius += randomInt(-5, 5);
		if(this.radius <= 0){
			this.radius = 5;
		}
		explosion.prototype.update.call(this);
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
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
		
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = color + this.opacity + ")";
		ctx.fill();
	}	
	
	this.init();
	return this;
}
