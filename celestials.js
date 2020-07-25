'use strict';
	var Thing = require('./thing.js');
	var models = require('./shared/models.js');
	var utils = require('./shared/utils.js');
	var m4 = utils.m4;

function Celestial() {
		Thing.call(this);
	}
	Celestial.prototype = Object.create(Thing.prototype);
	Celestial.prototype.constructor = Celestial;
	Celestial.prototype.onCollision = function(o, pen) 
		{
			//var pn = v3.normalize(pen);
			//var repulsion = v3.multiply(pn, (-this.acceleration - 2*v3.dot(this.state.velocity, pn)));
			//this.state.velocity = v3.add(this.state.velocity, repulsion);
		}
	Celestial.prototype.act = function() 
		{
			//revolve;
		}
	
function Sun(objlist) {
		Celestial.call(this);
		this.mass = 0; //(5.97 * 10 ** 24) * 332982;
		this.state.matrix = m4.translate(this.state.matrix, models.celestials.planet.size + 4 * 10 ** 5, 1000, 15 * 10 ** 10);
		objlist.celestials.sun.instances.push(this);
	}
	Sun.prototype = Object.create(Celestial.prototype);
	Sun.prototype.constructor = Sun;
	
function Planet(objlist) {
		Celestial.call(this);
		this.mass = 0; //5.97 * 10 ** 24;
		this.state.matrix = m4.translate(this.state.matrix, models.celestials.planet.size + 4 * 10 ** 5, 1000, 0);
		objlist.celestials.planet.instances.push(this);
	}
	Planet.prototype = Object.create(Celestial.prototype);
	Planet.prototype.constructor = Planet;
	
function Moon(objlist) {
		Celestial.call(this);
		this.mass = 0; //7.36 * 10 ** 22;
		this.state.matrix = m4.translate(this.state.matrix, models.celestials.planet.size + 4 * 10 ** 5, 1000, -4 * 10 ** 8);
		//this.state.velocity = [1000 / 60, 0, 0];
		objlist.celestials.moon.instances.push(this);
	}
	Moon.prototype = Object.create(Celestial.prototype);
	Moon.prototype.constructor = Moon;
	
function Asteroid(objlist) {
		Celestial.call(this);
	}
	Asteroid.prototype = Object.create(Celestial.prototype);
	Asteroid.prototype.constructor = Asteroid;
	
	module.exports.Celestial = Celestial;
	module.exports.Sun = Sun;
	module.exports.Planet = Planet;
	module.exports.Celestial = Celestial;
	module.exports.Moon = Moon;
	module.exports.Asteroid = Asteroid;