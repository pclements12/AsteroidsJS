var canvas = document.createElement("canvas");
var game = new Game(canvas);


test("collision detection",
	function(){
		var alien = new alienship(canvas);
		var m = new missile(canvas);
		
		alien.x = 100;
		alien.y = 100;
		
		m.x = 97;
		m.y = 97;
		
		var aBox = alien.getBoundingBox();
		var mBox = m.getBoundingBox();
		
		ok(game.overlapX(aBox[0].x, aBox[2].x, mBox[0].x, mBox[2].x), "Overlap X");
		ok(game.overlapX(mBox[0].x, mBox[2].x, aBox[0].x, aBox[2].x), "Reverse Overlap X");
		
		ok(game.overlapY(aBox[2].y, aBox[0].y, mBox[2].y, mBox[0].y), "Overlap Y");
		ok(game.overlapY(mBox[2].y, mBox[0].y, aBox[2].y, aBox[0].y), "Reverse Overlap Y")
		
		ok(game.isCollision(alien.getBoundingBox(), m.getBoundingBox()), "Collision");
		ok(game.isCollision(m.getBoundingBox(), alien.getBoundingBox()), "Reverse Collision");
	}
);