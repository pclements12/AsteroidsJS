smoke.prototype = new SpaceObject();
function smoke(canvas, x, y, angle){
	this.canvas = canvas;
	this.x = x + randomInt(-3, 3);
	this.y = y + randomInt(-3, 3);
	var velocityMx = 10;
	this.radius = 3;
	this.angle = angle;
	this.velocity = {
		x : 0,
		y: 0
	};
	
	this.init = function(){
		
		var cosTheta = Math.cos(this.angle);
		var sinTheta = Math.sin(this.angle);							
		var dx = cosTheta;
		var dy = sinTheta;
		
		this.velocity.x = -0.5 * dx + randomFloat(-0.5, 0.5);
		this.velocity.y = -0.5 * dy + randomFloat(-0.5, 0.5);
		
		this.opacity = 0.3;
	}
	
	this.getBoundingBox = function(){
		return [{x: -1, y: -1}, {x: -1, y: -1}, {x: -1, y: -1}, {x: -1, y: -1}];
	}
	
	this.update = function(){
		this.opacity -= 0.008;
		if(this.opacity <= 0){
			this.opacity = 0;
		}
		smoke.prototype.update.call(this);
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		//ctx.strokeStyle = 'rgba(200, 200, 200, '+this.opacity + ')';
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(200, 200, 200, '+this.opacity + ')';
		ctx.fill();
		//ctx.stroke();
		
		if(this.opacity <= 0){
			this.destroy();
		}
	}	
	
	this.init();
	return this;
}
