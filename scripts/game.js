
function Game(canvas){
	var level = 0;
	var roundOver = true;
	var gameOver = false;
	var player;
	var alien;
	var items = [];
	var effects = [];
	var asteroids = [];
	var score;
	
	var scoreLabel = document.getElementById("score");
	var livesLabel = document.getElementById("lives");
	var levelLabel = document.getElementById("level");
	
	var messageDiv = document.getElementById("message");
	var highscoresDiv = document.getElementById("highscores");

	var keyListener = (function(game){
		var leftInterval, rightInterval, upInterval, shootInterval;
		var left = false;
		var right = false;
		var up = false;
		var shoot = false;

		function clearIntervals(){
			clearInterval(leftInterval);
			clearInterval(rightInterval);
			clearInterval(upInterval);
			clearInterval(shootInterval);
			leftInterval = rightInterval = upInterval = shootInterval = null;
		}
		
		return function(e){
			if(e.keyCode === 13 && !game.started){
				game.start();
			}
			else if(e.keyCode === 13 && game.started && roundOver){
				game.beginRound();
			}
			else if(e.keyCode === 13 && player.destroyed){
				player.reset();
				game.addItem(player);
			}
			else if(gameOver && e.keyCode === 13){
				game.reset();
			}
			if(!player || player.destroyed || roundOver || gameOver){
				left = right = up = shoot = false;
				clearIntervals();
				return;
			}
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
				//p
				case 80:
					game.pause();
					break;
				//o
				case 79:
					game.unpause();
					break;
			};
			//console.log("keydown, left", left, "right", right, "up", up, "shoot", shoot, (new Date()).getTime());
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
	
	this.drawStatus = function(){
		scoreLabel.innerHTML = score;
		livesLabel.innerHTML = player.lives;
		levelLabel.innerHTML = level;	
	}
	
	function pad(array){
		for(var i = 0; i < array.length; i++){
			var str = String(array[i]);
			while(str.length < 2){
				str = "0" + str;
			}
			array[i] = str;
		}
	}
	
	function dateTimeString (date){
		var d = [date.getMonth() + 1, date.getDate(), date.getFullYear()].join("/");
		var t = [date.getHours() > 12 ? date.getHours() % 12 : date.getHours(), date.getMinutes(), date.getSeconds()];
		pad(t);
		t = t.join(":");
		return d + " " + t;
	};
	
	this.updateGameState = function(){
		if(player.destroyed){
			if(player.lives <= 0){
				gameOver = true;
				this.started = false;
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
				
				highscores.push({score: score, date: dateTimeString(new Date())});
				highscores.sort(compare);
				highscores.splice(10); //only keep the top 10!
				var newHighScore = highscores[0].score === score;
				window.localStorage.setItem("asteroidsjs.highscores", JSON.stringify(highscores));
				this.displayHighscores(highscores, newHighScore);			
			}
		}
		else if(asteroids.length === 0){
			this.endRound();
		}
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
	
	this.draw = (function(ctx){
		function d(){
			if(pause){
				return;
			}
			//console.log("paint", (new Date()).getTime());
			this.updateGameState();
			if(gameOver || roundOver){
				return;
			}
			clear();
			this.checkForCollisions();
			for(var i = 0; i < items.length; i++){
				if(items[i].destroyed){
					if(items[i].points){
						score += items[i].points;
					}
					if(items[i] instanceof asteroid){
						var index = contains(asteroids, items[i]);
						if(index >= 0){
							asteroids.splice(index, 1);
						}
					}
					items.splice(i, 1);
					i--;
					continue;
				}
				items[i].update();
			}
			for(var i = 0; i < effects.length; i++){
				if(effects[i].destroyed){
					effects.splice(i, 1);
				}
				else{
					effects[i].update();
				}
			}
			this.drawStatus();
			requestAnimationFrame(this.draw);
		}
		return function(){
			d.call(ctx);
		}
	})(this)
	
	function contains(array, obj){
		for(var i = 0; i < array.length; i++){
			if(array[i] === obj){
				return i;
			}
		}
		return -1;
	}

	function getLevel() {
		return this.level;
	}
	
	this.started = false;
	this.start = function(){
		score = 0;		
		player = new spaceship(canvas);
		alien = new alienship(canvas);
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
		this.start();
	}
	
	this.beginRound = function(){
		if(gameOver){
			return;
		}
		items = [];
		asteroids = [];
		effects = [];
		
		var astrCount = 6 + level;
		
		for(var i = 0; i < astrCount; i++){
			var astr = new asteroid(canvas);
			this.addItem(astr);
		}
		player.reset();
		this.addItem(player);
		this.addItem(alien);
		roundOver = false;
		
		requestAnimationFrame(this.draw);
	}	
	
	this.endRound = function(){
		level++;
		roundOver = true;
		score += 1000 * level;
		this.displayMessage("Round Complete!");
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
		if(	(minX1 > minX2 && minX1 < maxX2) ||
			(maxX1 > minX2 && maxX1 < maxX2)) {
			x = true;
		}
		if( (minY1 > minY2 && minY1 < maxY2) ||
			(maxY1 > minY2 && maxY1 < maxY2)) {
			y = true;
		}
		return x && y;
	}
	
	this.checkForCollisions = function(){
		for(var i = 0; i < items.length; i++){
			var item1 = items[i];
			if(item1.destroyed) continue;
			for(var j = 0; j < items.length; j++){
				var item2 = items[j];
				if(	i === j || 
					item2.destroyed || 
					(item1 instanceof asteroid && item2 instanceof asteroid) ||
					(item1 instanceof spaceship && item2 instanceof missile) ||
					(item1 instanceof missile && item2 instanceof missile) ||
					(item2 instanceof spaceship && item1 instanceof missile)) {
					continue;
				}
				
				var box1 = item1.getBoundingBox();
				var box2 = item2.getBoundingBox();
				var d = distance({x: item1.x, y: item1.y}, {x: item2.x, y: item2.y});
				if(d < 100){
					if(this.isCollision(box1, box2)){
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
	
	this.displayMessage = function(message){
		clear();
		messageDiv.innerHTML = message;
		var style = messageDiv.style;
		style.display = "block";
		style.top = canvas.height/2 - messageDiv.clientHeight/2 + "px";
		style.left = canvas.width/2 - messageDiv.clientWidth/2 + "px";
	}
	
	function hideMessage(){
		messageDiv.style.display = "none";
	}
	
	this.displayHighscores = function(highscores, newHighScore){
		var html = "<div>Game Over!</div>";
		if(newHighScore){
			html += "<div class='newHighScore'>NEW HIGH SCORE!!</div>";
		}
		html += 
		"<table id='highscoresTable'>" +
			"<tbody>";
		for(var i = 0; i < highscores.length; i++){
			var aScore = highscores[i];
			if(aScore.score === score){
				html += "<tr class='playerScore'>";
			}
			else{
				html += "<tr>";
			}
			html += "<td class='score'>"+aScore.score+"</td>";
			html += "<td class='date'>"+aScore.date+"</td>";
			html += "</tr>";
		}		
		html += 
			"</tbody>"
		"</table>";
		this.displayMessage(html);
	}
	
	this.displayMessage("Press Enter to Start");
	
	return this;
}