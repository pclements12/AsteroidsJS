alienship.prototype = new SpaceObject();
function alienship(canvas){
	this.canvas = canvas;

<<<<<<< HEAD
	var turnDelay = (new Date()).getTime();
=======
	this.angle = Math.PI / 2; //constant, straight up

	var lastTurn = (new Date()).getTime();
	var shotDelay = 0; //milliseconds
>>>>>>> fixed typos

	this.getLastTurn = function(){
		return lastTurn;
	}

	function init(){

	}	

	this.getBoundingBox = function getBoundingBox(){

	}



	this.paint = function(){

	}

	this.init = init;

	this.init();
	return this;
}
