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
	init: function(){
		this.asteroids = [];
	},
	activate : function(item){
		this.asteroids.push(item);
		item.velocity = {x : 0, y: 0};
	},
	action : function(item){
		if(contains(this.asteroids, item) < 0){
			this.asteroids.push(item);
			item.velocity = {x : 0, y: 0};
		}
	},
	deactivate : function(item){
		var maxV = 20 / item.radius;
		item.velocity.x = randomFloat(-maxV, maxV);
		item.velocity.y = randomFloat(-maxV, maxV);
	}
});

Powers.Shield = new power({
	rarity: 2,
	priority: 1,
	label: "Shield",
	phase: "update",
	objectType: spaceship,
	activate: function(item) {
		if (this.activated) return;

		var tip = game.getPlayer().getShipPoints()[0];
		this.shield = new missile(item.canvas, tip.x, tip.y, 0, 0, 0, 100);
		this.shield.velocity = { x: 0, y: 0 };
		game.addItem(this.shield);

		this.objectType = missile;
		this.activated = true;
	},
	action: function(item) {
		if(!this.shield || this.shield.destroyed) {
			this.destroy();
		}
		if(this.shield && game.getPlayer().destroyed) {
			this.destroy();
		}
		if(this.shield) {
			// Update the shield location to follow the player
			// override the default missile radius and ttl
			this.shield.ttl = 10;
			this.shield.radius = 100;
			this.shield.x = game.getPlayer().x;
			this.shield.y = game.getPlayer().y;
		}
	},
	terminate: function() {
		if(!this.activated) return;
		this.shield && this.shield.destroy();
		this.shield = undefined;
		this.objectType = spaceship;
		this.activated = false;
	}
});

Powers.EMP = new power({
	rarity: 3,
	priority: 1,
	label: "EMP",
	phase: "update",
	objectType: asteroid,
	duration: 10,
	init: function() {
		this.location = { x: game.getPlayer().x, y: game.getPlayer().y };
		this.blastRadius = 300;
		this.blast = new missile(game.getPlayer().canvas, this.location.x, this.location.y, 0, 0, 0, this.blastRadius);
		this.blast.velocity = { x: 0, y: 0 };
		game.addItem(this.blast);
	},
	activate: function(item) {
		if(distance({x: item.x, y: item.y}, this.location) < this.blastRadius) {
			item.destroy();
			game.addEffect(new explosion(item.canvas, item.x, item.y, item.radius));
		}
	}
});

function power(args){
/*

	args : {
	  	rarity: {Int}, how often the powerup is generated, higher rarity is generated less often
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
		duration = args.duration || 15 * 1000;
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
			args.init.call(this);
		}
	}

	// Call this to end the power before it's timer is up
	this.destroy = function() {
		duration = 0;
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
			args.activate.call(this, item);
			return true;
		}
		return false;
	}

	this.deactivate = function(item){
		if(args.deactivate && this.affectsItem(item)){
			args.deactivate.call(this, item);
			return true;
		}
		return false;
	}

	this.action = function(item){
		if(args.action && this.affectsItem(item)){
			args.action.call(this, item);
			return true;
		}
		return false;
	}

	this.terminate = function(){
		if(timerInterval){
			clearInterval(timerInterval);
			timerInterval = null;
		}
		if(args.terminate){
			args.terminate.call(this);
		}
	}
};
