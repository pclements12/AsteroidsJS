asteroid.prototype = new SpaceObject();
function asteroid(canvas, x, y, radius){	
	function init(){
		this.canvas = canvas;
		
		if(!radius){
			this.radius = 20;
		}
		else{
			this.radius = radius;
		}
		this.x, this.y;
		this.points = 1 / this.radius * 100;
		this.velocity = {
			x: 0,
			y: 0
		};
		
		if(x === undefined || y === undefined){
		
			var leftRight = randomInt(0, 2);
			var topBottom = randomInt(0, 2);
			
			if(leftRight === 0){
				this.x = randomInt(0, 0.25 * this.canvas.width);
			}
			else{
				this.x = randomInt(0.75 * this.canvas.width, this.canvas.width);
			}
			if(topBottom === 0){
				this.y = randomInt(0, 0.25 * this.canvas.height);
			}
			else{
				this.y = randomInt(0.75 * this.canvas.height, this.canvas.height);
			}
		}
		else{
			this.x = x;
			this.y = y;
		}
		
		var maxV = 20 / this.radius;
		
		this.velocity.x = randomFloat(-maxV, maxV);
		this.velocity.y = randomFloat(-maxV, maxV);
	}
	
	this.getBoundingBox = function getBoundingBox(){
		var left = this.x - this.radius;
		var right = this.x + this.radius;
		var top = this.y - this.radius;
		var bottom = this.y + this.radius;
		return [{x:left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}];
	};
	
	this.destroy = function(){
		if(this.radius > 5){
			this.generateChildren(2);
		}
		this.destroyed = true;
	}
	
	this.canCollideWith = function(item){
		var can =  
			(item instanceof spaceship ||
			item instanceof missile);
		return can;
	}
	
	this.generateChildren = function(count){
		for(var i = 0; i < count; i++){
			this.game.addItem(new asteroid(this.canvas, this.x, this.y, this.radius / 2));
		}
	}

	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		ctx.strokeStyle = 'rgb(255, 255, 255)';
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.stroke();
		
		//debug collisions
		//connectTheDots(ctx, this.getBoundingBox());
	}		
	
	this.init = init;
	
	this.init();
	return this;
};