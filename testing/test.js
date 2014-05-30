var canvas = document.createElement("canvas");
var game = new Game(canvas);


test("collision detection",
	function(){
		var box1 = [];
		var box2 = [];
		var alien = new alienship(canvas);
		var m = new missile(canvas);
		
		alien.x = 100;
		alien.y = 100;
		
		m.x = 97;
		m.y = 97;
		
		ok(game.isCollision(alien.getBoundingBox(), m.getBoundingBox()), "Collision 1");
		ok(game.isCollision(m.getBoundingBox(), alien.getBoundingBox()), "Collision 2");
	}
);