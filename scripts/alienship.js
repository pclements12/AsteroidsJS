alienship.prototype = new SpaceObject();
function alienship(canvas){
	this.canvas = canvas;

	var turnDelay = (new Date()).getTime();

	this.getTurnDelay = function(){
		return turnDelay;
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
