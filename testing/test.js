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
		
		function box(min, max){
			return [{x:min, y:min}, {x:max, y:min}, {x:max, y:max}, {x: min, y: max}];
		}
		
		
		var aBox = alien.getBoundingBox();
		var mBox = m.getBoundingBox();
		module("alien & missile");
		
		function testX(aBox, mBox){
			return game.overlapX(aBox[0].x, aBox[2].x, mBox[0].x, mBox[2].x);
		}
		
		function testY(aBox, mBox){
			return game.overlapY(aBox[2].y, aBox[0].y, mBox[2].y, mBox[0].y);
		}
		
		function testCollision(aBox, mBox){
			var collision = game.isCollision(aBox, mBox) && game.isCollision(mBox, aBox);
			return collision;
		}
		
		equal(true, game.overlapX(aBox[0].x, aBox[2].x, mBox[0].x, mBox[2].x), "Overlap X");
		equal(true, game.overlapX(mBox[0].x, mBox[2].x, aBox[0].x, aBox[2].x), "Reverse Overlap X");
		
		equal(true, game.overlapY(aBox[2].y, aBox[0].y, mBox[2].y, mBox[0].y), "Overlap Y");
		equal(true, game.overlapY(mBox[2].y, mBox[0].y, aBox[2].y, aBox[0].y), "Reverse Overlap Y")
		
		equal(true, game.isCollision(aBox, mBox), "Collision");
		equal(true, game.isCollision(mBox, aBox), "Reverse Collision");
		
		module("boxes");
		var box1 = box(0, 5);
		var box2 = box(1, 2);
		equal(true, testX(box1, box2), "Overlap X");
		equal(true, testY(box1, box2), "Overlap Y");
		
		box2 = box(5, 6);
		equal(false, testX(box1, box2), "Overlap X");
		equal(false, testY(box1, box2), "Overlap Y");		
		equal(false, game.isCollision(box1, box2), "Collision");
		
		box1 = box(5, 10);
		box2 = box(2, 3);
		equal(false, testX(box1, box2), "Overlap X");
		equal(false, testY(box1, box2), "Overlap Y");
		
		box1 = [{x:5, y:100}, {x:10, y:100}, {x:10, y:110}, {x: 5, y: 110}];
		box2 = [{x:0, y:5}, {x:8, y:5}, {x:8, y:10}, {x: 0, y: 10}];
		equal(true, testX(box1, box2), "Overlap X");
		equal(false, testY(box1, box2), "Overlap Y");
		equal(false, testCollision(box1, box2), "Collision");
		
		box1 = [{x:5, y:2}, {x:10, y:2}, {x:10, y:8}, {x: 5, y: 8}];
		box2 = [{x:100, y:5}, {x:110, y:5}, {x:110, y:10}, {x: 100, y: 10}];
		equal(false, testX(box1, box2), "Overlap X");
		equal(true, testY(box1, box2), "Overlap Y");
		equal(false, testCollision(box1, box2), "Collision");
		
	}
);