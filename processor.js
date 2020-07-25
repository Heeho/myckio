'use strict';
	var physics = require('./physics.js');
	var models = require('./shared/models.js');		
	
	var parts = require('./shared/parts.js');
	var Controls = parts.Controls;
	
	var objlist = require('./shared/objlist.js');

	var thing = require('./thing.js');		
	var projectiles = require('./projectiles.js');
	var Projectile = projectiles.Projectile;
	var Bolt = projectiles.Bolt;
	
	var effects = require('./effects.js');
	var Effect = effects.Effect;
	var Explosion = effects.Explosion;
	var Forcefield = effects.Forcefield;
	var Throttle = effects.Throttle;
	var Flash = effects.Flash;
	
	var ships = require('./ships.js');
	var Ship = ships.Ship;
	var Fighter = ships.Fighter;
	var Carrier = ships.Carrier;
	var Interceptor = ships.Interceptor;
	
	var celestials = require('./celestials.js');
	var Celestial = celestials.Celestial;
	var Sun = celestials.Sun;
	var Planet = celestials.Planet;
	var Moon = celestials.Moon;
	var Asteroid = celestials.Asteroid;
	
	var carrier;
	var players = {};
	
	function run() {
		physics(objlist); //console.log(players);
	}
	
	function newplayer() {
		var player = new Fighter(objlist);
		player.target = carrier;
		player.act(objlist);
		players[player.id] = player; //console.log(players);
		return player;
	}
	
	function init() {
		var sun = new Sun(objlist);
		var planet = new Planet(objlist);
		var moon = new Moon(objlist);
		carrier = new Carrier(objlist);		
		carrier.target = planet;
		run();
		//console.log(objlist);
	}

	module.exports.run = run;
	module.exports.init = init;
	module.exports.newplayer = newplayer;
	module.exports.objlist = objlist;
	module.exports.players = players;