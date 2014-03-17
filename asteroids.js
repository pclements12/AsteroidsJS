window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
				  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var space = document.getElementById("space");
space.height = 600;
space.width = 800;

function distance(p1, p2){
	return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
}

function pythagorean(a, b){
	return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

function normalizeAngle(angle, radians){
	var max = 360;
	if(radians){
		max = (Math.PI * 2);
	}
	if(angle < 0){
		angle = angle + max;
	}
	return angle % max;					
}

function scaleVector(r_angle, magnitude){
	return {x: Math.cos(r_angle)*magnitude, y: Math.sin(r_angle)*magnitude};
}

function vectorAdd(/*p1, p2...*/){
	var x;
	var y;
	for(var i = 0; i < arguments.length; i++){
		if(x == null || y == null){
			x = arguments[i].x;
			y = arguments[i].y;
		}
		else{
			x += arguments[i].x;
			y += arguments[i].y;
		}
	}
	return {x: x, y: y};
}

//p1 - p2
function vectorSubtract(/* p1, p2 ...*/){
	var x;
	var y;
	for(var i = 0; i < arguments.length; i++){
		if(x == null || y == null){
			x = arguments[i].x;
			y = arguments[i].y;
		}
		else{
			x -= arguments[i].x;
			y -= arguments[i].y;
		}
	}
	return {x: x, y: y};
}

function connectTheDots(ctx, dots){
	if(!dots || dots.length < 2){
		return;
	}
	ctx.beginPath();
	for(var i = 0; i < dots.length + 1; i++){
		if(i == 0){
			ctx.moveTo(dots[i].x, dots[i].y);
		}
		else if(i == dots.length){
			ctx.lineTo(dots[0].x, dots[0].y);
			break;
		}
		else{
			ctx.lineTo(dots[i].x, dots[i].y);
		}
		//ctx.fillText(i, dots[i].x + 5, dots[i].y + 5);
	}	
	ctx.stroke();
	
}

//a = iso sides, b = base
function isoAltitude(a, b){
	return Math.sqrt(Math.pow(a, 2) - (Math.pow(b, 2) / 4));
}

function randomInt(min, max){
	if(min === undefined){
		min = 0;
	}
	if(max === undefined){
		max = 10;
	}
	var range = max - min;
	return Math.floor((Math.random() * range)) + min;
}

function randomFloat(min, max){
	if(min === undefined){
		min = 0;
	}
	if(max === undefined){
		max = 10;
	}
	var range = max - min;
	return (Math.random() * range) + min;	
}

function toDegrees(radians){
	return (radians / Math.PI) * 180;
}

function toRadians(degrees){
	return (degrees / 180) * Math.PI;
}

function getArcCoordinates ( x, y, degAngle, radius){
	//90 returns x = 0, y = 1;
	if(radius === undefined){
		radius = 1;
	}
	return {
		x: x + (Math.cos(toRadians(degAngle)) * radius),
		y: y + (Math.sin(toRadians(degAngle)) * radius)
	};
}

var game = new Game(space);

