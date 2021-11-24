
function TouchModule(canvas, options){
	var defaults = {
		discreteDirections: true, //disallows combinations of up/down & right/left swipes
		delay: 300, //milliseconds
	}

	function _merge(defaults, options){
		for(var key in defaults){
			if(options[key] == undefined){
				options[key] = defaults[key];
			}
		}
	}
	if(!options){
		options = {};
	}
	_merge(defaults, options);

	var addEventListener = canvas.addEventListener || canvas.attachEvent;
	addEventListener("touchstart", handleStart, false);
	addEventListener("touchend", handleEnd, false);
	addEventListener("touchcancel", handleCancel, false);
	addEventListener("touchleave", handleEnd, false);
	addEventListener("touchmove", handleMove, false);

	var touchMap = {};
	var touchHistory = {};
	var touchNotification = {};

	function getTouch(t){
		return {id: t.identifier, x: t.pageX, y: t.pageY, time: (new Date()).getTime()};
	}

	function handleStart(event){
		if(event.target != canvas){
			return;
		}
		event.preventDefault();
		//can have multiple touches
		for(var i = 0; i < event.changedTouches.length; i++){
			var t = event.changedTouches[i];
			var touch = getTouch(t);
			if(!touchMap[touch.id]){
				touchMap[touch.id] = touch;
				touchHistory[touch.id] = [touch];
			}
			updateTouch(touch);
		}
	}

	function handleMove(event){
		if(event.target != canvas){
			return;
		}
		event.preventDefault();
		for(var i = 0; i < event.changedTouches.length;i++){
			var t = event.changedTouches[i];
			var touch = getTouch(t);
			touchHistory[touch.id].push(touch);
			touchMap[touch.id] = touch;
			updateTouch(touch);
		}
	}

	function handleEnd(event){
		if(event.target != canvas){
			return;
		}
		for(var i = 0; i < event.changedTouches.length;i++){
			var t = event.changedTouches[i];
			var touch = getTouch(t);
			touchHistory[touch.id].push(touch);
			updateTouch(touch, true);
			removeTouch(touch);
		};
	}

	function handleCancel(event){
		if(event.target != canvas){
			return;
		}
		event.preventDefault();
		for(var i = 0; i < event.changedTouches.length;i++){
			var t = event.changedTouches[i];
			var touch = getTouch(t);
			touchHistory[touch.id].push(touch);
			updateTouch(touch, true);
			removeTouch(touch);
		};
	}

	function updateTouch(touch, end){
		//evaluate the history of the touch to determine the gesture
		var history = touchHistory[touch.id];
		var first = history[0];
		var previous = history.length > 10 ? history[history.length - 5] : first;
		var last = history[history.length - 1];
		touch.type = touch === first ? "start" : (end ? "end" : "move");

		var left, right, up, down;
		left = right = up = down = false;
		//check if x or y direction is most influential
		var x = last.x - previous.x;
		var y = last.y - previous.y;
		var dx = Math.abs(x);
		var dy = Math.abs(y);

		var p = dx/(dx + dy);

		if(end && (last.time - first.time < 300) && (dx < 20 && dy < 20)){
			notifyTap(touch);
			return;
		}
		else if(end && (last.time - first.time > 300) && dx < 20 && dy < 20){
			notifyLongTap(touch);
			return;
		}
		if(dx < 5 && dy < 5){
			//too short of a drag to determine distance reliably
			return;
		}

		//diagonal swipe
		if(options.discreteDirections && (dx > 20 || dy > 20) && (p > 0.3 && p < 0.7)){
			if(x > 0){
				right = true;
			}
			else if(x < 0){
				left = true;
			}
			if(y > 0){
				down = true;
			}
			else if(y < 0){
				up = true;
			}
		}
		//horizontal/vertical swipe
		else if(dx > dy){
			if(x > 0){
				right = true;
			}
			else if(x < 0){
				left = true;
			}
		}
		else{
			if(y > 0){
				down = true;
			}
			else if(y < 0){
				up = true;
			}
		}

		//Notify listeners
		if(up){
			if(left){
				notifyUpLeft(touch);
				return;
			}
			else if(right){
				notifyUpRight(touch);
				return;
			}
			else{
				notifyUp(touch);
				return;
			}
		}
		if(down){
			if(left){
				notifyDownLeft(touch);
				return;
			}
			else if(right){
				notifyDownRight(touch);
				return;
			}
			else{
				notifyDown(touch);
				return;
			}
		}
		if(left){
			notifyLeft(touch);
				return;
		}
		if(right){
			notifyRight(touch);
				return;
		}
	}

	function removeTouch(touch){
		delete touchMap[touch.id];
		delete touchHistory[touch.id];
	}


	//functions to subscribe to parsed actions
	//e.g. swipeLeft, swipeRight, swipeUp, swipeDown, tap
	var _tap = [];
	var _longTap = [];
	var _left = [];
	var _right = [];
	var _up = [];
	var _down = [];

	var _upLeft = [];
	var _upRight = [];
	var _downLeft = [];
	var _downRight = [];

	function _remove(list, item){
		for(var i = 0; i < list.length; i++){
			if(list[i] === item){
				list.splice(i, 1);
				break;
			}
		}
	}

	this.tap = function(callback, off){
		if(off === true){
			_remove(_tap, callback);
		}
		else{
			_tap.push(callback);
		}
	}
	this.longTap = function(callback, off){
		if(off === true){
			_remove(_longTap, callback);
		}
		else{
			_longTap.push(callback);
		}
	}
	this.swipeLeft = function(callback, off){
		if(off === true){
			_remove(_left, callback);
		}
		else{
			_left.push(callback);
		}
	}
	this.swipeRight = function(callback, off){
		if(off === true){
			_remove(_right, callback);
		}
		else{
			_right.push(callback);
		}
	}
	this.swipeUp = function(callback, off){
		if(off === true){
			_remove(_up, callback);
		}
		else{
			_up.push(callback);
		}
	}
	this.swipeDown = function(callback, off){
		if(off === true){
			_remove(_down, callback);
		}
		else{
			_down.push(callback);
		}
	}
	this.swipeUpLeft = function(callback, off){
		if(off === true){
			_remove(_upLeft, callback);
		}
		else{
			_upLeft.push(callback);
		}
	}
	this.swipeUpRight = function(callback, off){
		if(off === true){
			_remove(_upRight, callback);
		}
		else{
			_upRight.push(callback);
		}
	}
	this.swipeDownLeft = function(callback, off){
		if(off === true){
			_remove(_downLeft, callback);
		}
		else{
			_downLeft.push(callback);
		}
	}
	this.swipeDownRight = function(callback, off){
		if(off === true){
			_remove(_downRight, callback);
		}
		else{
			_downRight.push(callback);
		}
	}

	function _notify(list, touch){
		if(touchNotification[touch.id] !== undefined && touchNotification[touch.id] < options.delay){
			return;
		}
		touchNotification[touch.id] = (new Date()).getTime();
		for(var i = 0; i < list.length; i++){
			list[i].call(canvas, touch);
		}
	}

	function notifyTap(touch){
		_notify(_tap, touch);
	}
	function notifyLongTap(touch){
		_notify(_longTap, touch);
	}
	function notifyLeft(touch){
		_notify(_left, touch);
	}
	function notifyRight(touch){
		_notify(_right, touch);
	}
	function notifyUp(touch){
		_notify(_up, touch);
	}
	function notifyDown(touch){
		_notify(_down, touch);
	}
	function notifyUpLeft(touch){
		_notify(_upLeft, touch);
	}
	function notifyUpRight(touch){
		_notify(_upRight, touch);
	}
	function notifyDownLeft(touch){
		_notify(_downLeft, touch);
	}
	function notifyDownRight(touch){
		_notify(_downRight, touch);
	}
}

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
				  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
if(!window.requestAnimationFrame){
	window.requestAnimationFrame = function(callback){
		setTimeout(callback, 16);
	}
}
if(!window.localStorage){
	(function(){
		var store = {};
		window.localStorage = {
			getItem : function(key){
				return store[key];
			},
			setItem : function(key, value){
				store[key] = value;
			}
		};
	})();
}