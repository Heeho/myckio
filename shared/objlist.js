'use strict';
	var isserver = typeof window == 'undefined';
	if(isserver) {var models = require('./models.js');}
	
	var objlist = {
		celestials: {
			sun: {
				model: models.celestials.sun,
				instances: [],
			},
			planet: {
				model: models.celestials.planet,
				instances: [],
			},
			moon: {
				model: models.celestials.moon,
				instances: [],
			},
		},
		ships: {
			fighter: {
				model: models.ships.fighter,
				instances: [],
			},
			carrier: {
				model: models.ships.carrier,
				instances: [],
			},
			interceptor: {
				model: models.ships.interceptor,
				instances: [],
			},
		},
		effects: {
			throttle: {
				model: models.effects.throttle,
				instances: [],
			},
			explosion: {
				model: models.effects.explosion,
				instances: [],
			},
			flash: {
				model: models.effects.flash,
				instances: [],
			},
			forcefield: {
				model: models.effects.forcefield,
				instances: [],
			},
		},
		projectiles: {
			bolt: {
				model: models.projectiles.bolt,
				instances: [],
			},
		},
	}
	
	if(isserver) {module.exports = objlist;}