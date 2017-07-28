var Powers = {};

Powers.MultiShot = new power({
	rarity: 1,
	label: "Multi Shot!",
	phase: "shoot",
	objectType: spaceship,
	action: function(item){
		var tip = item.getShipPoints()[0];
		for(var i = 0; i < 5; i++){
			var angle = item.angle + toRadians(randomInt(-15, 15));
			if(angle < 0){
				angle = (Math.PI * 2) + angle;
			}
			angle = angle % toRadians(360);
			game.addItem(new missile(item.canvas, tip.x, tip.y, angle, item.velocity.x, item.velocity.y, 3));
		}
	}
});

Powers.BigShot = new power({
	rarity: 1,
	label: "BIG Shot!",
	phase: "update",
	objectType: missile,
	action : function(item){
		item.radius = 20;
		console.log('big shot update:', item.radius);
	}
});

Powers.StickyShip = new power({
	rarity: 2,
	label: "Sticky Ship!",
	phase: "update",
	objectType: spaceship,
	action: function(item){
		if(!item.keyInput.isAccel()){
			item.velocity.x = 0;
			item.velocity.y = 0;
		}
	},
	deactivate: function(item){
		item.velocity.x = 0;
		item.velocity.y = 0;
	}
});

Powers.OneUp = new power({
	rarity: 3,
	label: "1UP!",
	objectType: spaceship,
	activate : function(item){
		item.lives++;
	}
});

Powers.TimeFreeze = new power({
	rarity: 2,
	label: "Freeze!",
	phase: "update",
	objectType: asteroid,
  asteroids: [],
	activate : function(item){
		this.asteroids.push(item);
		item.velocity = {x : 0, y: 0};
	},
	action : function(item){
		if(contains(this.asteroids, item) < 0){
			this.activate(item);
		}
	},
	deactivate : function(item){
		var maxV = 20 / item.radius;
		item.velocity.x = randomFloat(-maxV, maxV);
		item.velocity.y = randomFloat(-maxV, maxV);
	}
});

Powers.EMP = new power({
	rarity: 1,
	priority: 1,
	label: "Shield",
	phase: "update",
	objectType: spaceship,
	activate: function(item) {
		if (this.activated) return;
		this.spaceship = item;

		var tip = this.spaceship.getShipPoints()[0];
		this.emp = new missile(item.canvas, tip.x, tip.y, 0, 0, 0, 100);
		this.emp.velocity = { x: 0, y: 0 };
		game.addItem(this.emp);

		this.objectType = missile;
		this.activated = true;
	},
	action: function(item) {
		if (!this.emp || this.emp.destroyed) {
			var tip = this.spaceship.getShipPoints()[0];
			this.emp = new missile(item.canvas, tip.x, tip.y, 0, 0, 0, 100);
			this.emp.velocity = { x: 0, y: 0 };
			this.emp.ttl = 10;
			game.addItem(this.emp);
		}
		this.emp.radius = 100;
		this.emp.x = this.spaceship.x;
		this.emp.y = this.spaceship.y;
	},
	deactivate: function(item) {
		this.spaceship = undefined;
		this.emp && this.emp.destroy();
		this.emp = undefined;
	}

});

function power(args){
/*

	args : {
	  rarity: {Int}, how often the powerup is generated
		priority: {Int}, 1 is highest priority, higher priority is excecuted later so it's effects clobber other effects if conflicting
		label, {String}, powerup label to be displayed
		phase, {String} 'update' or 'shoot'. if neither, action will never fire, but activate and deactivate will
		objectType,{Object} constructor of objects that are affected by this powerup
		activate, {Function} called once on each item affected at powerup activation
		deactivate, {Function} called once on each item affected at powerup deactivation
		action {Function} called on each item affected whenever the "phase" occurs for that item
	}
*/
	var startTime;
	var duration = 15 * 1000;
	if(!args.objectType){
		args.objectType = null;
	}
	if(!args.phase){
		args.phase = "";
	}
	this.rarity = args.rarity;
	if(!this.rarity){
		this.rarity = 1;
	}
	this.priority = args.priority;
	if(!this.priority){
		this.priority = 99;
	}
	var labelSpan = null;
	var timerSpan = null;
	var timerInterval = null;
	this.label = args.label;

	this.init = function(span){
		startTime = (new Date()).getTime();
		labelSpan = span;
		labelSpan.innerHTML = args.label;
		timerSpan = document.createElement("span");
		labelSpan.appendChild(timerSpan);
		timerInterval = setInterval(function(){
			var time = (Math.floor(duration - ((new Date()).getTime() - startTime)) / 1000).toFixed(0);
			if(time < 5){
				timerSpan.className = "warning";
			}
			timerSpan.innerHTML = time;
		}, 1000);
		if(args.init){
			args.init();
		}
	}

	this.expired = function(){
		var now = (new Date()).getTime();
		return now - startTime > duration;
	}

	this.affectsItem = function(item){
		var affects = (item instanceof args.objectType);
		return affects;
	}

	this.affectsPhase = function(phase){
		return args.phase.toLowerCase() == phase.toLowerCase();
	}

	this.getPhase = function(){
		return args.phase;
	}

	this.getLabel = function(){
		return labelSpan;
	}

	this.activate = function(item){
		if(args.activate && this.affectsItem(item)){
			args.activate(item);
			return true;

		}
		return false;
	}

	this.deactivate = function(item){
		if(args.deactivate && this.affectsItem(item)){
			args.deactivate(item);
			return true;
		}
		return false;
	}

	this.action = function(item){
		if(args.action && this.affectsItem(item)){
			args.action(item);
			return true;
		}
		return false;
	}

	this.terminate = function(){
		if(timerInterval){
			clearInterval(timerInterval);
			timerInterval = null;
		}
		//labelSpan.parentNode.removeChild(labelSpan);
		//labelSpan.remove();
		if(args.terminate){
			args.terminate();
		}
	}
};
