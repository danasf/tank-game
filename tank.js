;(function() {

	/* Game Logic */
	function Game(canvasId) {

		var self = this;
		var can = document.getElementById(canvasId);
		var screen = can.getContext('2d');
		
		this.size = {x: can.width, y: can.height };
		this.playable = true; // game is not over
		this.score = 0; // score

		/* physics */
		this.gravity = -2;

		var tick = function() {
			self.update();
			self.draw(screen);
			requestAnimationFrame(tick);
		};

		tick();
		Mountains(screen,this.size);

	};

	Game.prototype.update = function() {
		//var self = this;
	};

	Game.prototype.draw = function(screen) {
	
	};

	/* Player / tank logic */
	function Tank(game) {

	};

	Tank.prototype.update = function() {

	};

	Tank.prototype.draw = function() {

	};

	/* Bullet logic */
	function Bullet(game) {

	};

	Bullet.prototype.update = function() {

	};

	Bullet.prototype.draw = function() {

	};



	/* mountains, background */
	function Mountains(screen,size) {
		
		var step = 60;

		screen.rect(0,0,size.x,size.y);
		screen.fillStyle = 'blue';
		screen.fill();

		screen.beginPath();
		screen.moveTo(0,size.y)
		
		var i=60;
		while(i <= size.x) {
			screen.lineTo(i,size.y-Math.random()*200);
			console.log(i);
			i += step;
		}
		screen.lineTo(size.x,size.y);
      	screen.lineWidth = 5;
      	screen.strokeStyle = 'green';
      	screen.fillStyle = 'green';
      	screen.stroke();
      	screen.fill();
	};


	/* Keyboard handler */
	function Keyboard() {
		var keyState = {};
		this.KEYS = { LEFT: 37, RIGHT:39, FIRE:32 };

		window.onkeydown = function(e) {
			keyState[e.keyCode] = true;
		};

		window.onkeyup = function(e) {
			keyState[e.keyCode] = false;
		};

		this.isDown = function(keyCode) {
			return keyState[keyCode] === true;
		};


	};


	/* Helpers */

	var game = new Game("myGame");
})();

