function Game(canvas){
	var level = 0;
	var roundOver = true;
	var gameOver = false;
	var player;
	var alien;
	var items = [];
	var effects = [];
	var wait = false;
	
	var roundStartTime;
	var alienRespawn; //counter to prevent aliens from continually spawning

	var powers = [Powers.StickyShip, Powers.MultiShot, Powers.BigShot, Powers.OneUp, Powers.TimeFreeze];
	
	var powerUps = [];
	var asteroids = [];
	var score;
	
	var scoreLabel = document.getElementById("score");
	var livesLabel = document.getElementById("lives");
	var levelLabel = document.getElementById("level");
	
	var messageDiv = document.getElementById("message");
	var highscoresDiv = document.getElementById("highscores");
	var powerUpSpan = document.getElementById("powerUp");
	var instructionSpan = document.getElementById("instruction");
	instructionSpan.style.left = canvas.width / 2 - 100 + "px";

	var keyListener = (function(game){
		
		return function (e) {
		    //prevent navigation keys from doing their default behaviors
		    if ((!game.waiting() && e.keyCode == 32) || (e.keyCode >= 37 && e.keyCode <= 40)) {
		        e.preventDefault();
		    }
		    if (!game.waiting()) {
		        if (e.keyCode === 13 && !game.started) {
		            game.start();
		        }
		        else if (e.keyCode === 13 && game.started && roundOver) {
		            game.beginRound();
		        }
		        else if (e.keyCode === 13 && player.destroyed) {
		            player.reset();
		            game.addItem(player);
		        }
		        else if (gameOver && e.keyCode === 13) {
		            game.reset();
		        }
		    }
			if(!player || player.destroyed || roundOver || gameOver){
				return;
			}
			switch(e.keyCode){
				//p
				case 80:
					game.pause();
					return;
				//o
				case 79:
					game.unpause();
					return;
			};
			player.handleKeyInput(e);
		}
	})(this);
	
	document.addEventListener("keydown", keyListener);
	document.addEventListener("keyup", keyListener);

	var ctx = canvas.getContext("2d");

	this.addItem = function(spaceObject){
		spaceObject.setGame(this);
		if(spaceObject instanceof asteroid){
			asteroids.push(spaceObject);
		}
		items.push(spaceObject);
	}
	
	this.addEffect = function(spaceObject){
		spaceObject.setGame(this);
		effects.push(spaceObject);
	}
	
	this.addPowerUp = function(powerup){
		powerup.setGame(this);
		powerUps.push(powerup);
		powerup.power.init(document.createElement("span"));
		activatePower(powerup.power);
	}
	
	function activatePower(power){
		for(var i = 0; i < items.length; i++){
			power.activate(items[i]);
		}
		getPowerUpLabels();
	}
	
	function deactivatePower(power){
		for(var i = 0; i < items.length; i++){
			power.deactivate(items[i]);
		}
		power.terminate();
		getPowerUpLabels();
	}
	
	function getPowerUpLabels(){
		powerUpSpan.innerHTML = "";
		for(var i = 0; i < powerUps.length; i++){
			if(!powerUps[i].expired()){
				powerUpSpan.appendChild(powerUps[i].power.getLabel());
			}
		}
	}
	
	this.checkPowerUpExpirations = function(){
		for(var i = 0; i < powerUps.length; i++){
			if(powerUps[i].expired()){
				deactivatePower(powerUps[i].power);
				powerUps.splice(i, 1);
				i--;
			}
		}
	}
	
	this.getPowerUp = function(item, phase){
		var poweredUp = false;
		for(var i = 0; i < powerUps.length; i++){
			if(powerUps[i].power.affectsPhase(phase)){
				poweredUp = powerUps[i].power.action(item) || poweredUp;
			}
		}
		return poweredUp;
	}
	
	this.removePowerUps = function(){
		//remove all powerups at the end of a round
		for(var i = 0; i < powerUps.length; i++){
			deactivatePower(powerUps[i].power);
		}
		powerUps = [];
		powerUpSpan.innerHTML = "";
	}
	
	this.drawStatus = function(){
		scoreLabel.innerHTML = score;
		livesLabel.innerHTML = player.lives;
		levelLabel.innerHTML = level;	
	}
	
	function dateTimeString (date){
		var d = [date.getMonth() + 1, date.getDate(), date.getFullYear()].join("/");
		var t = date.toLocaleTimeString();
		return d + " " + t;
	};
	
	this.updateGameState = function(){
		if(player.destroyed){
		    if (player.lives <= 0) {
				this.handleGameOver();
			}
			else{
				this.setInstruction("Enter to respawn");
			}
		}
		else if(asteroids.length === 0 && alien.destroyed ||
			 asteroids.length === 0 && !this.hasAlien()){
			this.endRound();
		}
		else if ((new Date()).getTime() - roundStartTime > 
				10000 - randomInt(0,(1000*(level < 10 ? level : 9)))) {	
			if (!this.hasAlien() && alienRespawn === 0) {			
				alien = new alienship(canvas);
				this.addItem(alien);
				alienRespawn++;
			}				
		}
		else{
			this.setInstruction("");
		}
	}
	
	this.hasAlien = function() {			
		for(var i = 0; i < items.length; i++) {
			if (items[i] instanceof alienship) {
				return true;
			}
		}
		return false;
	}

	var pause = false;
	this.pause = function(){
		pause = true;
		this.displayMessage("Paused. Press 'o' to unpause");
	}
	
	this.unpause = function(){
		if(pause){
			hideMessage();
			pause = false;
			requestAnimationFrame(this.draw);
		}
	}

	this.waiting = function () {
	    return wait;
	}

	this.wait = function () {
	    wait = true;
	}

	this.resume = function () {
	    wait = false;
	}
	
	// diagnostic variables (perf measurement)
	var frameCount = 0;
	var frameRateSpan = document.getElementById("frameRate");
	setInterval(function(){
		frameRateSpan.innerHTML = frameCount;
		frameCount = 0;
	}, 1000);
	
	this.draw = (function(ctx){
		function d(){
			frameCount++;
			if(pause){
				return;
			}
			//console.log("paint", (new Date()).getTime());
			this.updateGameState();
			if(gameOver || roundOver){
				return;
			}
			clear();
			this.checkPowerUpExpirations();
			this.checkForCollisions();
			for(var i = 0; i < items.length; i++){
				if(items[i].destroyed){
					if(items[i].points){
						score += items[i].points;
					}
					if(items[i] instanceof asteroid){
						this.checkForPowerUps(items[i].x, items[i].y, items[i].radius);
						var index = contains(asteroids, items[i]);
						if(index >= 0){
							asteroids.splice(index, 1);
						}
					}
					items.splice(i, 1);
					i--;
					continue;
				}
				items[i]._update();
				items[i].paint();
			}
			for(var i = 0; i < effects.length; i++){
				if(effects[i].destroyed){
					effects.splice(i, 1);
				}
				else{
					effects[i].update();
					effects[i].paint();
				}
			}
			this.drawStatus();
			requestAnimationFrame(this.draw);
		}
		return function(){
			d.apply(ctx, arguments);
		}
	})(this)
	
	this.checkForPowerUps = function(x, y){
		//decide if we are going to spawn a powerup
		if(randomInt(0, 50) < 3){
			//decide which powerup to create based on rarity
			
			var power = this.getNextPowerUp();
			game.addItem(new powerup(canvas, x, y, power));			
		}
	}

	this.getLevel = function getLevel() {
		return level;
	}
	
	this.getPlayer = function(){
		return player;
	}
	
	this.getNextPowerUp = (function(){		
		var bag = [[],[],[]];
		for(var i = 0; i < powers.length; i++){
			var power = powers[i];
			bag[power.rarity - 1].push(power);
		}
		//rarities can be 1-3, higher is more rare
		//p(1) = 60%, p(2)=30%, p(3) = 10%
		return function(){
			var pick = randomInt(0, 10);
			if(pick === 0 && bag[2].length > 0){
				return bag[2][randomInt(0, bag[2].length)];
			}
			else if(pick > 0 && pick < 4 && bag[1].length > 0){
				return bag[1][randomInt(0, bag[1].length)];
			}
			else if(bag[0].length > 0){
				return bag[0][randomInt(0, bag[0].length)];
			}
			else if(powers.length > 0){
			    return powers[randomInt(0, powers.length)];
			}
		}
	})()
	
	this.started = false;
	this.start = function(){
		score = 0;		
		player = new spaceship(canvas);
		this.started = true;
		this.beginRound();
	}
	
	this.reset = function(){
		level = 0;
		gameOver = false;
		roundOver = false;
		items = [];
		asteroids = [];
		effects = [];
		this.removePowerUps();
		this.start();
	}
	
	this.beginRound = function(){
		if(gameOver){
			return;
		}
		items = [];
		asteroids = [];
		effects = [];
		this.removePowerUps();
		var astrCount = 6 + level;
		for(var i = 0; i < astrCount; i++){
			var astr = new asteroid(canvas);
			this.addItem(astr);
		}
		player.reset();
		this.addItem(player);
		roundStartTime = (new Date()).getTime();
		alienRespawn = 0;
		roundOver = false;
		requestAnimationFrame(this.draw);
	}
	
	this.endRound = function(){
		level++;
		roundOver = true;
		score += 1000 * level;
		this.removePowerUps();
		this.displayMessage("Round Complete!");
	}
	
	this.handleGameOver = function(){
		this.removePowerUps();
		if (this.hasAlien() && !alien.destroyed) {
			alien.destroy();
		}
		gameOver = true;
		this.started = false;
		this.displayMessage("<div>Game Over!</div>");
		this.wait();
		var self = this;
		self.getHighScores().done(function (highscores) {
			highscores.splice(20);
			self.postNewScore().done(function (score) {
				var id = score.ID;
				highscores.push(score);
				function comparator(a, b) {
					if (b.score === a.score) return 0;
					return b.score - a.score;
				}
				highscores.sort(comparator);
				var newHighScore = highscores[0].ID === id;
				self.displayHighscores(highscores, newHighScore, id);
				self.resume();
				self.setInstruction("Enter to Play Again.");
			});
		})
		.fail(function(){
			self.getLocalHighScores().done(function(){
				self.resume();
				self.setInstruction("Enter to Play Again.");
			});
		});
	}
	
	this.isCollision = function(box1, box2){
		var minX1 = box1[0].x;
		var minX2 = box2[0].x;
		var maxX1 = box1[2].x;
		var maxX2 = box2[2].x;
		var minY1 = box1[0].y;
		var minY2 = box2[0].y;
		var maxY1 = box1[2].y;
		var maxY2 = box2[2].y;
		
		var x = false;
		var y = false;
		
		
		// if(	(minX1 > minX2 && minX1 < maxX2) ||
			// (maxX1 > minX2 && maxX1 < maxX2)) {
			// x = true;
		// }
		// if( (minY1 > minY2 && minY1 < maxY2) ||
			// (maxY1 > minY2 && maxY1 < maxY2)) {
			// y = true;
		// }
		var x = this.overlapX(minX1, maxX1, minX2, maxX2);
		var y = this.overlapY(maxY1, minY1, maxY2, minY2);
		return x && y;
	}
	
	this.overlapX = function(left1, right1, left2, right2){
		var overlap =
			//left1 is between points2
			(left1 > left2 && left1 < right2) ||
			//right1 is between points2
			(right1 > left2 && right1 < right2) ||
			
			//left2 is between points1
			(left2 > left1 && left2 < right1) ||
			//right2 is between points1
			(right2 > left1 && right2 < right1);
		return overlap;
	}
	
	//top = max y (since y is upside down in the canvas)
	this.overlapY = function(top1, bottom1, top2, bottom2){
		var overlap =
			( top1 > bottom2 && top1 < top2) ||
			( bottom1 > bottom2 && bottom1 < top2) ||
			
			(top2 > bottom1 && top2 < top1) ||
			(bottom2 > bottom1 && bottom2 < top1);
		return overlap;
	}
	
	this.checkForCollisions = function(){
		for(var i = 0; i < items.length; i++){
			var item1 = items[i];
			if(item1.destroyed) continue;
			for(var j = 0; j < items.length; j++){
				var item2 = items[j];
				if(	i === j || 
					item2.destroyed || 
					!item1.canCollideWith(item2)){
					continue;
				}
				
				var box1 = item1.getBoundingBox();
				var box2 = item2.getBoundingBox();
				var d = distance({x: item1.x, y: item1.y}, {x: item2.x, y: item2.y});
				if(d < 100){
					if(this.isCollision(box1, box2)){
						if(item1 instanceof powerup){
							this.addPowerUp(item1);
							item1.destroy();
							continue;
						}
						if(item2 instanceof powerup){
							this.addPowerUp(item2);
							item2.destroy();
							continue;
						}
						item1.destroy();
						item2.destroy();
						var point = midpoint({x:item1.x, y:item1.y}, {x:item2.x, y:item2.y});
						var width1 = box1[1].x - box1[0].x
						var width2 = box2[1].x - box2[0].x;
						var radius = width1 > width2 ? width1 / 2 : width2 / 2;
						this.addEffect(new explosion(canvas, point.x, point.y, radius));
					}
				}				
			}
		}
	}
	
	function clear(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		hideMessage();
	}	
	
	this.displayMessage = function(message, append){
	    clear();
	    if (append) {
	        messageDiv.innerHTML += message;
	    }
	    else {
	        messageDiv.innerHTML = message;
	    }
		var style = messageDiv.style;
		style.display = "block";
		style.top = canvas.height/2 - messageDiv.clientHeight/2 + "px";
		style.left = canvas.width/2 - messageDiv.clientWidth/2 + "px";
	}
	
	function hideMessage(){
		messageDiv.style.display = "none";
	}
	
	this.setInstruction = function(instruction){
		if(instruction != instructionSpan.innerHTML){
			instructionSpan.innerHTML = instruction;
		}
	}

	this.getLocalHighScores = function() {
		var def = $.Deferred();
		this.getNickname(function(name){
			var highscores = JSON.parse(window.localStorage.getItem("asteroidsjs.highscores"));
			if(!highscores){
				highscores = [];
			}
			function compare(score1, score2){
				if(score1.score === score2.score){
					return 0;
				}
				return score2.score - score1.score;
			}
			var id = highscores.length;
			highscores.push({ID:id, name: name, levelReached: level, score: score, date: dateTimeString(new Date())});
			highscores.sort(compare);
			highscores.splice(20); //only keep the top 20!
			var newHighScore = highscores[0].ID === id;
			window.localStorage.setItem("asteroidsjs.highscores", JSON.stringify(highscores));
			this.displayHighscores(highscores, newHighScore, id);
			def.resolve(highscores);
		});	
		return def.promise();
	}
	
	this.getHighScores = function () {
	    return $.ajax({
	        url: "api/score",
	        type: "GET"
	    })
	}
	
	this.getNickname = function(callback){
		var self = this;
		this.displayMessage("Enter Nickname:<div><input id='nickname'/><button id='postScore'>Submit</button></div>", true);
	    var input = document.getElementById("nickname");
		input.focus();
	    function post() {
	        var name = input.value;
	        callback.call(self, name);		
		}
	    $("#postScore").one({"click": post, "touchstart": post});
		
	}

	this.postNewScore = function () {
	    var def = $.Deferred();
	    this.getNickname(function(name){
			var scoreObj = { name: name, score: score, levelReached: level };
	        $.ajax({
	            url: "api/score",
	            type: "POST",
	            data: scoreObj
	        }).done(def.resolve);
		});
	    return def.promise();	    
	}
	
	this.displayHighscores = function (highscores, newHighScore, newScoreId) {
		var html = "<div>Game Over!</div>";
		if(newHighScore){
			html += "<div class='newHighScore'>NEW HIGH SCORE!!</div>";
		}
		html +=
		"<table id='highscoresTable'>" +
            "<tbody>" +
			"<tr><th>Name</th><th>Score</th><th>Level</th><th>Date</th></tr>";

		for(var i = 0; i < highscores.length; i++){
			var aScore = highscores[i];
			if(aScore.ID === newScoreId){
				html += "<tr class='playerScore'>";
			}
			else{
				html += "<tr>";
			}
		    //"2014-04-29T20:22:09.62"			
			var dateTime = dateTimeString(new Date(aScore.date));
			html += "<td class='name'>" + aScore.name + "</td>";
			html += "<td class='score'>" + aScore.score + "</td>";
			html += "<td class='level'>" + aScore.levelReached + "</td>";
			html += "<td class='date'>" + dateTime + "</td>";
			html += "</tr>";
		}		
		html += 
			"</tbody>"
		"</table>";
		this.displayMessage(html);
	}
	
	this.displayMessage("Press Enter to Start");
	var leftTouch = new TouchModule(document.getElementById("touch-left"));
	leftTouch.swipeLeft(function(event){		
		player.handleKeyInput({type: "keydown", keyCode: 37});
		player.handleKeyInput({type: "keyup", keyCode: 37});
	});
	leftTouch.swipeRight(function(event){		
		player.handleKeyInput({type: "keydown", keyCode: 39});
		player.handleKeyInput({type: "keyup", keyCode: 39});
	});	
	leftTouch.swipeUp(function(event){		
		player.handleKeyInput({type: "keydown", keyCode: 38});
		player.handleKeyInput({type: "keyup", keyCode: 38});
	});
	leftTouch.tap(function(){
		if(game.waiting()){
			return;
		}
		if (!game.started) {
			game.start();
		}
		else if (game.started && roundOver) {
			game.beginRound();
		}
		else if (player.destroyed) {
			player.reset();
			game.addItem(player);
		}
		else if (gameOver) {
			game.reset();
		}
		else{
			player.handleKeyInput({type: "keydown", keyCode: 32});
			player.handleKeyInput({type: "keyup", keyCode: 32});
		}
	});

	return this;
}
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