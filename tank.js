;(function() {

	/* Game Logic */
	function Game(canvasId) {

		var self = this;
		var can = document.getElementById(canvasId);
		var screen = can.getContext('2d');
		
		this.size = {x: can.width, y: can.height };
		this.playable = true; // game is not over
		this.score = 0; // score

		this.bodies = [];

		/* physics */
		this.gravity = -2;



		// initiate and draw new background
		this.mtns = new Mountains();
		this.mtns.generate(screen,this.size);


		// initialize a player
		this.tank = new Tank(game,screen,this.mtns.getPeaks());

		var tick = function() {
			self.update();
			self.draw(screen);
			requestAnimationFrame(tick);
		};

		tick();


	};

	Game.prototype.update = function() {
		//var self = this;
		this.tank.update(game);
		this.bodies.forEach(function(val,key) { 
 			val.update();
		});
	};

	Game.prototype.draw = function(screen) {
		this.mtns.draw(screen,this.size);
		this.tank.draw(screen);
		this.bodies.forEach(function(val,key) { 
			val.draw(screen);
		});

	};

	/* Player / tank logic */
	function Tank(game,screen,peaks) {

		this.game = game;
		this.radius = 20;
		this.turretAngle = 90;		
		this.center = {x: peaks[4].x , y: peaks[4].y };
		var self = this;
		this.keys = new Keyboard();


	};

	Tank.prototype.update = function(game) {
		if(this.keys.isDown(this.keys.KEYS.LEFT)) {
			this.turretAngle -= 2;
		}
		else if(this.keys.isDown(this.keys.KEYS.RIGHT)) {
			this.turretAngle += 2;
		}
		else if(this.keys.isDown(this.keys.KEYS.FIRE)) {
			console.log("Fire");
			var bullet = new Bullet(game,this.center,this.turretAngle);
			game.bodies.push(bullet);
		} 
	};

	Tank.prototype.draw = function(screen,angle) {

		//this turretAngle = (angle > 0 || angle < 360) ? angle : 90 ;  

		// tank base
		screen.beginPath();
		screen.arc(this.center.x,this.center.y,this.radius,Math.PI,false);
		screen.closePath();
		screen.lineWidth = 5;
		screen.fillStyle = 'red';
		screen.fill();

		// turret angle
		screen.beginPath();
		screen.moveTo(this.center.x,this.center.y);

		// period + starting angle offset
		var angleUnit = (2*Math.PI)/360.0;

		screen.lineTo(this.center.x+30*Math.cos(angleUnit*this.turretAngle),this.center.y+30*-Math.sin(angleUnit*this.turretAngle));
		screen.lineWidth = 5;
		screen.strokeStyle = 'red';
		screen.stroke();

	};

	/* Bullet logic */
	function Bullet(game,center,angle) {
		this.angle = angle;
		this.velocity = {x:3,y:8};
		this.center = { x:center.x,y:center.y };
	};

	Bullet.prototype.update = function() {
		var angleUnit = (2*Math.PI)/360.0;
		this.center.x +=Math.cos(this.angle*angleUnit)*this.velocity.x;
		this.center.y +=-Math.sin(this.angle*angleUnit)*this.velocity.y;
		this.velocity.y -=0.1;
	};

	Bullet.prototype.draw = function(screen) {
		screen.rect(this.center.x,this.center.y,3,3);
		screen.fillStyle = 'black';
		screen.fill();
	};



	/* mountains, background */
	function Mountains() {
		this.step = 60; // peaks in steps 
		this.points = []; // points of peaks
	};

	// draw initial mountain range
	Mountains.prototype.generate = function (screen,size) {
		screen.rect(0,0,size.x,size.y);
		screen.fillStyle = 'blue';
		screen.fill();

		screen.beginPath();
		screen.moveTo(0,size.y);
		var i = this.step;
		
		while(i <= size.x) {
			var peak = size.y-Math.random()*200;
			this.points.push({ x:i, y:peak });
			screen.lineTo(i,peak);
			i += this.step;
		}

		screen.lineTo(size.x,size.y);
      	screen.lineWidth = 5;
      	screen.strokeStyle = 'green';
      	screen.fillStyle = 'green';
      	screen.stroke();
      	screen.fill();

	};

	// redraw as needed
	Mountains.prototype.draw = function(screen,size) {

		screen.rect(0,0,size.x,size.y);
		screen.fillStyle = 'blue';
		screen.fill();

		screen.beginPath();
		screen.moveTo(0,size.y);
		
		this.points.forEach(function(val,key) {
			screen.lineTo(val.x,val.y);
		});
		screen.lineTo(size.x,size.y);
      	screen.lineWidth = 5;
      	screen.strokeStyle = 'green';
      	screen.fillStyle = 'green';
      	screen.stroke();
      	screen.fill();

	};

	Mountains.prototype.getPeaks = function() {
		return this.points;
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

