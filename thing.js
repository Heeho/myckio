'use strict';
	var uuid = require('uuid');
	var parts = require('./shared/parts');
	var State = parts.State;
	
	function Thing() {
		this.id = uuid.v4();
		this.exists = true;
		this.state = new State();
		this.mass = 1.0;
		this.currenthitbox = [];
	}
	Thing.prototype.act = function(objlist) {}
	
	module.exports = Thing;