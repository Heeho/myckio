'use strict';
	var isserver = typeof window == 'undefined';
	
	if(isserver) {
		var Thing = require('./thing.js');
		var parts = require('./shared/parts.js');
		var Controls = parts.Controls;
		var Shield = parts.Shield;
		var models = require('./shared/models.js');
		var utils = require('./shared/utils.js');
		var v3 = utils.v3;
		var m4 = utils.m4;
		var degToRad = utils.degToRad;
		var radToDeg = utils.radToDeg;
		var effects = require('./effects.js');
		var Effect = effects.Effect;
		var Explosion = effects.Explosion;
		var Flash = effects.Flash;
		var Throttle = effects.Throttle;
		var Forcefield = effects.Forcefield;
		var projectiles = require('./projectiles.js');
		var Projectile = projectiles.Projectile;
		var Bolt = projectiles.Bolt;
		var stats = require('./shared/statistics.js');
		var statistics = stats.statistics;
		var score = stats.score;
	}

function Ship() {
		//primary
		Thing.call(this);
		//this.mass = 10;

		this.isPlayer = false;

		this.target = null;
		this.autopilotwinding = [];
		this.autopilotrange2 = 6400 ** 2;
		this.lineoffire = null;

		//controls
		this.controls = new Controls();

		//engine
		this.acceleration = 2;

		//energy
		this.energyCap = 100;
		this.energyGain = 2;
		this.energy = this.energyCap;
		
		//energy cost
		this.accelerateCost = 2;
		this.brakesCost = 2;
		this.shootCost = 10;

		//shield
		this.shield = new Shield();
		
		//hull
		this.hitpoints = 1;
	}
	Ship.prototype = Object.create(Thing.prototype);
	Ship.prototype.constructor = Ship;
	Ship.prototype.onCollision = function(o, pen) 
		{
			var pn = v3.normalize(pen);
			var repulsion = v3.multiply(pn, (-this.acceleration - 2*v3.dot(this.state.velocity, pn)));
			this.state.velocity = v3.add(this.state.velocity, repulsion);
		}
	Ship.prototype.accelerate = function(effect) 
		{
			this.state.velocity = v3.add(this.state.velocity, v3.multiply(this.state.direction(), this.acceleration));
		}
	Ship.prototype.brake = function(effect) 
		{
			this.state.velocity = v3.multiply(this.state.velocity, 0.9);
		}
	Ship.prototype.shoot = function(objlist) 
		{
			if(this.energy >= this.shootCost) {
				this.energy -= this.shootCost;
				var p = new Bolt(objlist, this);
			}
		}
	Ship.prototype.secondary = function(objlist) 
		{		

		}
	Ship.prototype.autopilotX = function() 
		{
			var correction = v3.multiply(v3.substract(this.target.state.velocity, this.state.velocity), 11);
			this.autopilotwinding[0] = v3.dot(v3.cross(this.state.X(), this.lineoffire), this.state.Y()) > 0 ? -1 : 1;
			this.controls.mousepos[0] += v3.dot(this.state.X(), v3.normalize(v3.add(this.lineoffire, correction))) * this.autopilotwinding[0]; //console.log('measure: ', measure);
		}
	Ship.prototype.autopilotY = function() 
		{	
			var correction = v3.multiply(v3.substract(this.target.state.velocity, this.state.velocity), 11);
			this.autopilotwinding[1] = v3.dot(v3.cross(this.state.Y(), this.lineoffire), this.state.X()) > 0 ? 1 : -1;
			var pitch = v3.dot(this.state.Y(), v3.normalize(v3.add(this.lineoffire, correction))) * this.autopilotwinding[1] > 0; //console.log('measure: ', measure);
			this.controls.mouseposY.push(pitch);
		}
	Ship.prototype.updateenergy = function() 
		{
			this.energy += this.energy < this.energyCap ? this.energyGain : this.energy > this.energyCap ? -1 : 0;
		}
	Ship.prototype.updatelineoffire = function() 
		{
			this.lineoffire = this.target == null ? null : v3.substract(this.target.state.matrix.slice(12,15), this.state.matrix.slice(12,15));
		}		
	Ship.prototype.changetarget = function(list) 
		{
			//console.log(this.target);
			//console.log(list.length, list, list[0]);
			if(list.length == 0) {return;}
			var offset = 0;
			var i = list.indexOf(this.target); //console.log(i, list.length, list[0]);
			i = i == -1 ? 0 : i;
			this.target = i + 1 < list.length ? list[i + 1] : list[offset]; //console.log(list, i);
			
			this.controls.changetarget = (!this.target.exists || this.target == undefined || this == this.target) ? true : false;
		}
	Ship.prototype.ai = function(objlist) 
		{			
			var up = [0,1,0];
			this.state.matrix = m4.yRotate(m4.lookAt(this.state.location(), this.target.state.location(), up), degToRad(180));

			var outofrange = v3.vlength2(this.lineoffire) > this.autopilotrange2 / 6;
			var wrongdirection = v3.dot(v3.normalize(this.state.velocity), v3.normalize(this.lineoffire)) < 0;
			var toofast = v3.vlength(this.state.velocity) > 22;

			//chase, aim, shoot
			if(outofrange) {
				if(wrongdirection) {
					if(toofast) {
						this.brake();
					} else {
						this.accelerate(new Flash(objlist, this));
					}
				} else {
					this.accelerate(new Flash(objlist, this));
				}
			} else {
				this.shoot(objlist);
			}
			
			//strafe
			var frontanglecos = .5;
			var infront = v3.dot(v3.normalize(this.lineoffire), this.target.state.direction()) < frontanglecos; //console.log(infront);
			var onleft = v3.dot(v3.normalize(this.lineoffire), this.target.state.X()) >= 0;
			if(infront) {
				var strafedirection = v3.cross(v3.normalize(this.lineoffire), this.target.state.Y());
				var strafe = v3.multiply(strafedirection , this.acceleration/2);
				if(onleft) {
					this.state.velocity = v3.add(this.state.velocity, v3.inverse(strafe)); //v3.dot(this.lineoffire, target.state.direction()) -1 +- 
					this.accelerate(new Flash(objlist, this));
				} else {
					this.state.velocity = v3.add(this.state.velocity, strafe);
				}
			}		
		}
	Ship.prototype.takedamage = function(objlist, projectile) 
		{
			if(this.shield.amount >= projectile.damage) {
				this.shield.amount -= projectile.damage;
				var e = new Forcefield(objlist, projectile, this);
			} else {
				this.shield.amount = 0;
				this.hitpoints -= projectile.damage - this.shield.amount;
				var e = new Explosion(objlist, this);
			}
			if(this.hitpoints <= 0) {this.die();} //console.log(this, 'hitpoints, shield: ', this.hitpoints, this.shield.amount);
		}
	Ship.prototype.die = function() 
		{
			this.exists = false;
			//statistics[0] ++;
		}

function Fighter(objlist) {
		Ship.call(this);
		this.model = models.ships.fighter;
		this.front = this.model.radius;
		this.rear = -this.model.radius / 3;
		this.hitpoints = 4;
		this.controls.autopilotON = true; //this.controls.changetarget = true;
		objlist.ships.fighter.instances.push(this);
	}
	Fighter.prototype = Object.create(Ship.prototype);
	Fighter.prototype.constructor = Fighter;
	Fighter.prototype.act = function(objlist) 
		{		
			this.updatelineoffire();
			this.updateenergy();
			this.shield.regenerate(); //console.log(this.shield.amount);

			this.controls.lockedontarget = this.autopilotON && (v3.vlength2(this.lineoffire) < this.autopilotrange2);

			if(this.controls.autopilotON && this.controls.lockedontarget) {
				this.autopilotY();
			}	
			if(this.controls.changetarget || !this.target.exists || this.target == undefined) {
				this.changetarget(objlist.ships.interceptor.instances.concat(objlist.ships.carrier.instances));
			}
			//this.ai();/*
			
			this.state.rotation[0] += 
				this.controls.mouseY == undefined ? 0 :
				this.controls.mouseY ? this.controls.rotationspeed[0] : -this.controls.rotationspeed[0];
				this.controls.mouseY = undefined;
				
			this.state.rotation[2] += 
				this.controls.mouseX == undefined ? 0 :
				this.controls.mouseX ? this.controls.rotationspeed[2] : -this.controls.rotationspeed[2];			
				this.controls.mouseX = undefined;
				
			this.state.rotation[1] += 
				this.controls.turnLeft ? -this.controls.rotationspeed[1] :
				this.controls.turnRight ? this.controls.rotationspeed[1] :
				this.controls.lockedontarget ? this.controls.rotationspeed[2] :
				this.state.rotation[1];
				
			if(this.controls.shootON)		{this.shoot(objlist);}
			if(this.controls.accelerateON)	{this.accelerate(new Throttle(objlist, this));}
			if(this.controls.brakesON)		{this.brake(new Throttle(objlist, this));}//*/
		}
	Fighter.prototype.die = function() 
		{
			this.exists = false;
			score(`Eventually you sucked!`);
		}

function Carrier(objlist) {
		Ship.call(this);
		this.model = models.ships.carrier;
		this.front = this.model.radius;
		this.rear = -this.model.radius / 2;

		this.controls.secondaryON = true;
		this.energyCap = 666;
		this.energyGain = 1;
		this.energy = this.energyCap;

		this.accelerateCost = 2;
		this.brakesCost = 2;
		this.shootCost = 15;
		this.secondaryCost = 666;

		this.acceleration = 1;
		this.hitpoints = 999;
		
		this.shield.capacity = 10;
		
		this.state.matrix = [
			1,	0,	0,	0,
			0,	1,	0,	0,
			0,	0,	1,	0,
			20000,0,0,  1,
		];

		this.gunpoint = v3.add(this.state.location(), v3.multiply(this.state.direction(), models.ships.carrier.size));
		objlist.ships.carrier.instances.push(this);
	}
	Carrier.prototype = Object.create(Ship.prototype);
	Carrier.prototype.constructor = Carrier;

	Carrier.prototype.act = function(objlist) 
		{
			this.shield.regenerate();
			
			this.energy += this.energy < this.energyCap ? this.energyGain : this.energy > this.energyCap ? -1 : 0; //console.log(this.energy);
			if(this.controls.secondaryON && this.energy >= this.secondaryCost) {
				this.energy -= this.secondaryCost;
				this.secondary(objlist);
			}	
		}
	Carrier.prototype.shoot = function(objlist) 
		{
			//var b = new Blaster(this);
		}
	Carrier.prototype.secondary = function(objlist) 
		{ //console.log('carrier secondary');
			var i = new Interceptor(objlist, this); //console.log(i);
		}

function Interceptor(objlist, o) {
		Ship.call(this);
		this.model = models.ships.interceptor;
		this.front = this.model.radius;
		this.rear = -this.model.radius / 3;

		//console.log(o);
		this.target = o; //console.log(this.target.state.matrix);
		this.controls.autopilotNO = true;
		this.controls.lockedontarget = true;

		this.acceleration = 2;
		this.hitpoints = 1;
		this.beamrange2 = this.autopilotrange2 / 3;
		this.shootCost = 30;

		this.state.matrix = m4.translate(o.state.matrix, 0, 0, o.rear);

		this.state.velocity = v3.add(o.state.velocity, v3.multiply(o.state.direction(), 50));

		this.gunpoint = v3.add(this.state.location(), v3.multiply(this.state.direction(), models.ships.interceptor.size));
		objlist.ships.interceptor.instances.push(this);
		//console.log('interceptor created', objlist);
	}
	Interceptor.prototype = Object.create(Ship.prototype);
	Interceptor.prototype.constructor = Interceptor;
	Interceptor.prototype.act = function(objlist) 
		{
			if(this.target == objlist.ships.carrier.instances[0]) {
				this.changetarget(objlist.ships.fighter.instances);
				return;
			}
			//console.log(this.target);
			//console.log(this.target.state.matrix);
			this.updatelineoffire();
			this.updateenergy();

			this.ai(objlist);
		}
		
	if(isserver) {
		module.exports.Ship = Ship;
		module.exports.Fighter = Fighter;
		module.exports.Carrier = Carrier;
		module.exports.Interceptor = Interceptor;
	}