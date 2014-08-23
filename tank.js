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
		this.maxMtnHeight = 200;

		this.bodies = [];

		/* physics */
		this.gravity = -2;

		// initiate and draw new background

		this.mtns = new Mountains(this.maxMtnHeight);
		this.mtns.generate(screen,this.size);


		// initialize a player
		this.tank = new Tank(self,screen,this.mtns.getPeaks(),Math.floor(Math.random()*8));

		// init power indicator
		this.meter = new PowerMeter();

		var tick = function() {
			self.update();
			self.draw(screen);
			requestAnimationFrame(tick);
		};

		tick();


	};

	Game.prototype.update = function() {
		// if not a game over
		if(this.playable) {

			var self = this;
			this.tank.update(this);
			this.meter.update(this.tank.velocity);
			// is the player alive
			var isPlayerDead = function(i) {
				if(i.center.y > self.size.y-self.maxMtnHeight) {
					var collisionWithPlayer = bodiesColliding(self.tank,i);
					if(collisionWithPlayer) { delete self.tank; self.playable = false; }
				}
			 };

			var notCurrentlyColliding = function(b1) {
				return self.bodies.filter(function(b2) { return bodiesColliding(b1,b2); } ).length === 0;
			};
			this.bodies = this.bodies.filter(function(val) { 

				// get rid of things that are out of lower, side bounds
				var offScreen = (val.center.y > self.size.y + 10 || val.center.x < -30 || val.center.x > self.size.x+30) ? false : true;
				// get rid of things that are colliding with mountains
				var collisionMtn = isCollidingWithMountain(null,val,self.mtns);
				// get rid of bodies that are colliding with eachother 
				var collisionBodies = notCurrentlyColliding(val);

				// if everything is true you're all good!

				return offScreen && collisionMtn && collisionBodies;
			});


			this.bodies.forEach(function(val,key) { 
	 			val.update(self);
	 			isPlayerDead(val);
			});

			isTimeToMakePlane(self);

		

		} 
		// game over
		else {
			document.getElementById("gameOver").style.display="block";
		}


	};

	Game.prototype.draw = function(screen) {

		var self = this;

		this.mtns.draw(screen,this.size);

		if(this.playable) {
			this.tank.draw(screen);
			this.meter.draw(screen);
		}

		this.bodies.forEach(function(val,key) { 
			val.draw(screen);
		});

	};

	/* Player / tank logic */
	function Tank(game,screen,peaks,start) {

		this.game = game;
		this.radius = 20;
		this.velocity = {x:4, y:4};
		this.size = {x:this.radius,y:this.radius}
		this.center = {x: peaks[start].x , y: peaks[start].y };
		this.bulletLimiter = 10;
		
		this.turret = new Turret(90);

		var self = this;
		this.keys = new Keyboard();

	};

	Tank.prototype.update = function(game) {
		if(this.keys.isDown(this.keys.KEYS.RIGHT)) {
			//console.log("turret angle",this.turret.angle);
			this.turret.angle -= (this.turret.angle <= 0) ? 0 : 2;
			//console.log("new turret angle",this.turret.angle);

		}
		else if(this.keys.isDown(this.keys.KEYS.LEFT)) {
			//console.log("turret angle",this.turret.angle);
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
			this.bulletLimiter=10;
			} else { this.bulletLimiter--; }
		} 
		else {
			// do nothing
		}
	};

	Tank.prototype.draw = function(screen,angle) {

		//this turretAngle = (angle > 0 || angle < 360) ? angle : 90 ;  

		// tank base

		screen.beginPath();
		screen.arc(this.center.x,this.center.y,this.radius,Math.PI,false);
		screen.fillStyle = 'red';
		screen.lineWidth = 5;
		screen.fill();
		screen.closePath();


		// turret angle
		screen.beginPath();
		screen.moveTo(this.center.x,this.center.y);

		// period + starting angle offset
		var angleUnit = (2*Math.PI)/360.0;
		this.turret.tip.x = this.center.x+30*Math.cos(angleUnit*this.turret.angle);
		this.turret.tip.y = this.center.y+30*-Math.sin(angleUnit*this.turret.angle);
		
		screen.strokeStyle = 'red';
		screen.lineTo(this.turret.tip.x,this.turret.tip.y);
		screen.lineWidth = 5;
		screen.stroke();

	};

	/* Turret */
	function Turret(angle) {
		this.angle = angle;
		this.tip = {x:null,y:null};
	};

	/* Bullet logic */
	function Bullet(game,center,angle,velocity) {
		this.angle = angle;
		this.size = { x:3, y:3}; 
		this.velocity = { x:velocity.x, y:velocity.y};
		this.center = { x:center.x,y:center.y };
	};

	Bullet.prototype.update = function(game) {
		var angleUnit = (2*Math.PI)/360.0;
		this.center.x +=Math.cos(this.angle*angleUnit)*this.velocity.x;
		this.center.y +=-Math.sin(this.angle*angleUnit)*this.velocity.y;
		this.velocity.y -=0.1;
	};

	Bullet.prototype.draw = function(screen) {
		screen.fillStyle = 'black';
		screen.fillRect(this.center.x,this.center.y,this.size.x,this.size.y);
	};

	/* Airplane */

	function Plane() {
		this.size = { x:20, y:10}; 
		this.center =  { x:0, y:100 };
		this.velocity = { x:3, y:0 };
	};

	Plane.prototype.draw = function(screen) {
		screen.fillStyle = "black"
		screen.fillRect(this.center.x,this.center.y,this.size.x,this.size.y);
	};

	Plane.prototype.update = function(game) {

		this.center.x += this.velocity.x;
		this.center.y += Math.sin(this.center.x/10);

		if(Math.random() > 0.99) {
			 game.bodies.push(new Bullet(game,{x:this.center.x-10,y:this.center.y+10},90,{x:this.velocity.x, y:2}));
		}

	};


	/* mountains, background */
	function Mountains(height) {
		this.step = 60; // peaks in steps 
		this.points = []; // points of peaks
		this.height = height;
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
			var peak = size.y-Math.random()*this.height;
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

	function PowerMeter() {
		this.velocity = { x:1,y:0 };
		this.size = { height:100, width: this.velocity.x };

	};

	PowerMeter.prototype.draw = function(screen) {
			screen.beginPath();
			screen.fillStyle = "#ffff00";
			screen.fillRect(20,20,30*this.velocity.x,20);

	};

	PowerMeter.prototype.update = function(vel) {
		this.velocity = vel
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

	var bodiesColliding = function (b1,b2) {
		return !(
		b1 === b2 
		|| b1.center.x + b1.size.x / 2 < b2.center.x -b2.size.x / 2
		|| b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2
		|| b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2
		|| b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2
		);

	};


	/* Make new planes */
	var isTimeToMakePlane = function(self) {
		if(Math.random() > 0.99) {
			self.bodies.push(new Plane());
		}
	};


	/* Init */
	 window.addEventListener('load', function() {
		var game = new Game("myGame");
	 });
})();

