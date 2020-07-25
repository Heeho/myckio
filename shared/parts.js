'use strict';
	var isserver = typeof window == 'undefined';

function State() {
		this.velocity = [0, 0, 0];
		this.rotation = [0, 0, 0];
		this.matrix = [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		0,0,0,1,];
	}
	State.prototype.X = function()			{return this.matrix.slice(0,3);}
	State.prototype.Y = function()			{return this.matrix.slice(4,7);}
	State.prototype.direction = function()	{return this.matrix.slice(8,11);}
	State.prototype.location = function()	{return this.matrix.slice(12,15);}	

function Controls() {
		this.turnLeft = false;
		this.turnRight = false;
		this.accelerateON = false;
		this.brakesON = false;
		this.shootON = false;
		this.secondaryON = false;
		this.autopilotON = false;
		this.lockedontarget = false;
		this.changetarget = false;
		this.mouseX = undefined;
		this.mouseY = undefined;
		this.rotationspeed = [.1,.1,.1,];
	}
		
function Shield() {
		this.amount = 0;
		this.power = 3;
		this.capacity = 3.0;
	}
	Shield.prototype.regenerate = function() {
		this.amount += 1 - Math.pow((this.amount / this.capacity), this.power); //console.log(this.amount);
	}
	
	if(isserver) {
		module.exports.State = State;
		module.exports.Controls = Controls;
		module.exports.Shield = Shield;
	}