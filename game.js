
function Game(canvas){
	var level = 0;
	var roundOver = true;
	var gameOver = false;
	var player;
	var items = [];
	var asteroids = [];
	var score;
	
	var keyListener = (function(game){
		var left = false;
		var right = false;
		var up = false;
		var shoot = false;

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
				return;
			}
			//39 right, 37 left, 38 up, 40 down, 32 space;
			var down = e.type === "keydown";
			switch(e.keyCode){
				//left
				case 37:
					left = down;
					break;
				//right
				case 39:
					right = down;
					break;
				//up
				case 38:
					up = down;
					break;
				case 32:
					shoot = down;
					break;
			};
			if(left){
				player.rotateLeft();
			}
			if(right){
				player.rotateRight();
			}	
			if(up){
				player.accelerate();
			}
			if(shoot){
				player.shoot();
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
	
	this.drawStatus = function(){
		ctx.fillStyle = "white";
		ctx.font = "bold 11px Arial";
		ctx.fillText(score, 30, 30);
		ctx.fillText(player.lives, 100, 30);
		ctx.fillText(level, 120, 30);		
	}
	
	function dateTimeString (date){
		var d = [date.getMonth() + 1, date.getDate(), date.getFullYear()].join("/");
		var t = [date.getHours() % 12, date.getMinutes(), date.getSeconds()].join(":");
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
	
	this.draw = (function(ctx){
		function d(){
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
		this.start();
	}
	
	this.beginRound = function(){
		if(gameOver){
			return;
		}
		items = [];
		asteroids = [];
		
		var astrCount = 6 + level;
		
		for(var i = 0; i < astrCount; i++){
			var astr = new asteroid(canvas);
			this.addItem(astr);
		}
		player.reset();
		this.addItem(player);
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
					(item2 instanceof spaceship && item1 instanceof missile)) {
					continue;
				}
				
				var box1 = item1.getBoundingBox();
				var box2 = item2.getBoundingBox();
				var d = distance({x: item1.x, y: item1.y}, {x: item2.x, y: item2.y});
				if(d < 30){
					if(this.isCollision(box1, box2)){
						item1.destroy();
						item2.destroy();
					}
				}				
			}
		}
	}
	
	function clear(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}	
	
	this.displayMessage = function(message){
		clear();
		ctx.fillStyle = "white";
		ctx.font = "bold 24px Arial";
		ctx.fillText(message, (canvas.width / 2) - 100, (canvas.height / 2) - 24);
	}
	
	this.displayHighscores = function(highscores, newHighScore){
		clear();
		ctx.fillStyle = "white";
		ctx.font = "bold 24px Arial";
		var x = (canvas.width / 2) - 50;
		var y =(canvas.height / 2) - 100;
		var message = "Game Over!";
		ctx.fillText(message, x, y);
		y += 30;
		if(newHighScore){
			ctx.fillStyle = "red";
			x -= 40;
			ctx.fillText(" NEW HIGH SCORE!!", x, y);
			ctx.fillStyle = "white";
			x -= 20;
			y += 40;
		}
		else{
			x -= 60
		}
		for(var i = 0; i < highscores.length; i++){
			var aScore = highscores[i];
			if(aScore.score === score){
				ctx.fillStyle = "green";
				ctx.font = "bold 22px Arial";
			}
			else{
				ctx.fillStyle = "white";
				ctx.font = "bold 18px Arial";
			}
			ctx.fillText(aScore.score, x, y);
			ctx.fillText(aScore.date, x + 75, y);
			y += 25;
		}
	}
	
	this.displayMessage("Press Enter to Start");
	
	return this;
}