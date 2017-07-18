powerup.prototype = new SpaceObject();
function powerup(canvas, x, y, power){
/////////////////////////////////////
/*	
	 Power ups have two phases:
	1. space object (awaiting pickup) -> draws and updates
	2. as a powerup (after being picked up) -> interacts with object behaviors through hooks based on objectType and phase
*/
////////////////////////////////////
	this.canvas = canvas;
	this.x = x;
	this.y = y;
	this.lifetime = 12 * 1000; // 20 seconds to pick up the item
	this.power = power;
	
	this.radius = 10;
	this.velocity = {
		x : 0,
		y: 0
	};
	
	this.init = function(){
		this.createTime = (new Date()).getTime();
		this.opacity = 1.0;
		this.color = [
			255, 0 , 0
			// randomInt(0, 255),
			// randomInt(0, 255),
			// randomInt(0, 255)
		]
	}
	
	this.getBoundingBox = function getBoundingBox(){
		var left = this.x - this.radius;
		var right = this.x + this.radius;
		var top = this.y - this.radius;
		var bottom = this.y + this.radius;
		return [{x:left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}];
	};

	this.expired = function(){
		return this.power.expired();
	}
	
	this.update = function(){
		var now = (new Date()).getTime();
		var timeLived = now - this.createTime;
		if(timeLived > this.lifetime){
			this.destroy(false);
		}		
		else if(this.lifetime - timeLived < this.lifetime/2){
			this.opacity = (this.lifetime - timeLived) / (this.lifetime);
		}
		powerup.prototype.update.call(this);
	}
	
	this.pickup = function(){
		this.power.init();
	}
	
	this.canCollideWith = function(item){
		var can =  (item instanceof spaceship);
		return can;
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		ctx.fillStyle = "rgba(" + this.color.join(",") + ", " + this.opacity + ")";			
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.font = "10px monospace";
		ctx.fillStyle = "#fff";
		ctx.fillText(this.power.label,this.x, this.y);
		ctx.strokeStyle = "rgba(" + this.color.join(",") + ", " + this.opacity + ")";	
		ctx.stroke();
	}	
	
	this.init();
	return this;
}
