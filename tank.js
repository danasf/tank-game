/* 
  _______          _       _____                      
 |__   __|        | |     / ____|                     
    | | __ _ _ __ | | __ | |  __  __ _ _ __ ___   ___ 
    | |/ _` | '_ \| |/ / | | |_ |/ _` | '_ ` _ \ / _ \
    | | (_| | | | |   <  | |__| | (_| | | | | | |  __/
    |_|\__,_|_| |_|_|\_\  \_____|\__,_|_| |_| |_|\___|
                                                      
    By Dana Sniezko
    Written at Hacker School Summer 2014

*/
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
		this.tank = new Tank(self,screen,this.mtns.getPeaks(),Math.floor(Math.random()*8));

		var tick = function() {
			self.update();
			self.draw(screen);
			requestAnimationFrame(tick);
		};

		tick();


	};

	Game.prototype.update = function() {
		var self = this;
		this.tank.update(this);
		this.bodies.forEach(function(val,key) { 
 			val.update();
		});
		// get rid of things that are out of lower, side bounds
		this.bodies = this.bodies.filter(function(val) { 
			var offScreen = (val.center.y > self.size.y || val.center.x < 0 || val.center.x > self.size.x) ? false : true;
			var collision = isCollidingWithMountain(null,val,self.mtns);
			return offScreen && collision;
		});

	};

	Game.prototype.draw = function(screen) {

		var self = this;
		this.mtns.draw(screen,this.size);
		this.tank.draw(screen);
		this.bodies.forEach(function(val,key) { 
			val.draw(screen);
		});

	};

	/* Player / tank logic */
	function Tank(game,screen,peaks,start) {

		this.game = game;
		this.radius = 20;
		this.velocity = {x:4, y:4};
		this.center = {x: peaks[start].x , y: peaks[start].y };
		this.bulletLimiter = 3;
		
		this.turret = new Turret(90);
		this.meter = new PowerMeter(screen,this.velocity);

		var self = this;
		this.keys = new Keyboard();

	};

	Tank.prototype.update = function(game) {
		if(this.keys.isDown(this.keys.KEYS.RIGHT)) {
			console.log("turret angle",this.turret.angle);
			this.turret.angle -= (this.turret.angle <= 0) ? 0 : 2;
			console.log("new turret angle",this.turret.angle);

		}
		else if(this.keys.isDown(this.keys.KEYS.LEFT)) {
			console.log("turret angle",this.turret.angle);
			this.turret.angle += (this.turret.angle >= 180) ? 0 : 2;
		}
		else if(this.keys.isDown(this.keys.KEYS.UP)) {
			this.velocity.x += (this.velocity.x < 10) ? 0.2 : -0.2;
			this.velocity.y += (this.velocity.y < 10) ? 0.2 : -0.2;
		}

		else if(this.keys.isDown(this.keys.KEYS.DOWN)) {
			this.velocity.x -= (this.velocity.x > 0) ? 0.2 : -0.2;
			this.velocity.y -= (this.velocity.y > 0) ? 0.2 : -0.2;

		}
		else if(this.keys.isDown(this.keys.KEYS.FIRE)) {
			if(this.bulletLimiter == 0) {
			var bullet = new Bullet(game,this.turret.tip,this.turret.angle,this.velocity);
			game.bodies.push(bullet);
			this.bulletLimiter=3;
			} else { this.bulletLimiter--; }
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

		this.turret.tip.x = this.center.x+30*Math.cos(angleUnit*this.turret.angle);
		this.turret.tip.y = this.center.y+30*-Math.sin(angleUnit*this.turret.angle);
		screen.lineTo(this.turret.tip.x,this.turret.tip.y);
		screen.lineWidth = 5;
		screen.strokeStyle = 'red';
		screen.stroke();

		this.meter.draw();

	};

	/* Turret */
	function Turret(angle) {
		this.angle = angle;
		this.tip = {x:null,y:null};
	};

	/* Bullet logic */
	function Bullet(game,center,angle,velocity) {
		this.angle = angle;
		//this.velocity = {x:4,y:8};
		this.velocity = { x:velocity.x, y:velocity.y};
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
		this.KEYS = { UP: 38, DOWN: 40, LEFT: 37, RIGHT:39, FIRE:32 };

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

	/* Power Meter */

	function PowerMeter(screen,vel) {
		this.screen = screen;
		this.size = { height:100, width: 60 };
		this.velocity = vel;

	};

	PowerMeter.prototype.draw = function() {
			this.screen.fillStyle = "#ffff00";
			this.screen.rect(20,20,30*this.velocity.x,20);
			this.screen.fill();

	};

	PowerMeter.prototype.update = function() {

	};

	/* Helpers */
	var isCollidingWithMountain = function(screen,b1,mtn) {


		// if b1 y coord is over max mountain height, ignore it
		if(b1.y <  400) {
			return true;
		} else {

			// find nearest peak
			var nearPeak = Math.floor(b1.center.x/mtn.step)-1;
			
			// if out of bounds
			if((nearPeak+1) > mtn.points.length-1 || nearPeak < 0) {
				nearPeak=0;
			}

			// find difference between bullet x and y and nearest peak
			var deltaX = Math.abs(b1.center.x - mtn.points[nearPeak].x );
			var deltaY = Math.abs(b1.center.y - mtn.points[nearPeak].y );
			
			// y2 - y1 / step
			// need to deal with nearPeak+1 out of bounds
			//if((nearPeak+1) > mtn.points.len) { }
			var slope = ((mtn.points[nearPeak+1].y ) - mtn.points[nearPeak].y )/mtn.step;
			
			// y = mx+b! whoa, middle school algebra calling
			var impactPoint = slope*deltaX+mtn.points[nearPeak].y;

			//console.log("Impact point",impactPoint);
			//console.log("Delta, peak and bullet:",deltaX,deltaY);

			return (b1.center.y >= impactPoint ) ? false : true; 
		}



	};


	 window.addEventListener('load', function() {
		var game = new Game("myGame");
	 });
})();

