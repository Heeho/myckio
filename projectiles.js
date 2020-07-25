'use strict';
	var isserver = typeof window == 'undefined';
	
	if(isserver) {
		var Thing = require('./thing.js');
		var utils = require('./shared/utils.js');
		var v = utils.v;
		var v3 = utils.v3;
		var m4 = utils.m4;
	}
	
function Projectile(objlist) {
		Thing.call(this);
		this.damage = 2;
		this.TTL = 3;
		this.decay = .95;
	}
	Projectile.prototype = Object.create(Thing.prototype);
	Projectile.prototype.constructor = Projectile;
	Projectile.prototype.act = function() 
		{
			if(this.TTL == 0) {this.exists = false;} else {
				this.TTL--;
			}
		}
	Projectile.prototype.onCollision = function(objlist, o, pen) 
		{
			if(o.exists) {o.takedamage(objlist, this);}
			this.exists = false;
		}

function Bolt(objlist, o) {
		Projectile.call(this);
		var xdeviation = 11;
		var ydeviation = 11;
		var rand = 2 * (Math.random() - .5);

		this.state.matrix = m4.translate(o.state.matrix, rand * xdeviation, rand * ydeviation, o.model.radius + this.TTL * o.acceleration);
		this.state.velocity = v3.add(o.state.velocity, v3.multiply(o.state.direction(), this.TTL * o.acceleration));

		objlist.projectiles.bolt.instances.push(this);
	}
	Bolt.prototype = Object.create(Projectile.prototype);
	Bolt.prototype.constructor = Bolt;
	
	if(isserver) {
		module.exports.Projectile = Projectile;
		module.exports.Bolt = Bolt;
	}