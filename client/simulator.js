'use strict';
	var player;
	var gameupdate;
	var gameupdaterate;
	var simulationrefresh = 3;
	var simulationcount = 0;
	
	function simulate() {
		if(simulationcount == 0) { //console.log(player);
			unpackgameupdate(); //objlist.ships.fighter.instances.push({matrix: player.state.matrix, step: player.state.matrix});
			if(gameupdate == undefined) {return;}
			simulationcount = simulationrefresh;
		} //console.log('interpolation');
		updatestate();
		move();
		interpolate();
		simulationcount--;
	}

	function unpackgameupdate() { //console.log('objlist: ', objlist, 'gameupdate: ', gameupdate);
		var hasupdate = false;
		var inobjlist = false;
		for(var c in objlist) {
			for(var t in objlist[c]) { //console.log(gameupdate[c][t]);
				//for each objlist instance: if there's no update in gameupdate[c][t] for an instance, splice it
				for(var obji = objlist[c][t].instances.length - 1; obji > -1; obji--) { //console.log(objlist[c][t].instances);
					hasupdate = false;
					for(var updi in gameupdate[c][t]) { 
						if(objlist[c][t].instances[obji].id == gameupdate[c][t][updi][0] && objlist[c][t].instances[obji].id != undefined) { //console.log(objlist[c][t].instances[obji].id, gameupdate[c][t][updi][0]); 
							hasupdate = true; 
							break;
						}
					}					
					if(!hasupdate) {objlist[c][t].instances.splice(obji, 1);}
				}
				//for each update instance: if objlist has object with that id, refresh matrix and step, else push it fresh
				for(var updi in gameupdate[c][t]) { //console.log(objlist[c][t].instances.length); //console.log(gameupdate[c][t][updi]);//console.log(gameupdate[c][t][updi]);
					inobjlist = false;
					for(var obji = 0; obji < objlist[c][t].instances.length; obji++) { //console.log('updi, obji: ', obji, updi, 'objlist: ', objlist[c][t].instances[obji].id, 'gameupdate: ', gameupdate[c][t][updi][0]);
						if(objlist[c][t].instances[obji].id == gameupdate[c][t][updi][0] && objlist[c][t].instances[obji].id != undefined) {
							inobjlist = true; break;
						}
					}
					if(inobjlist) { //console.log(objlist[c][t].instances[obji].matrix);
						for(var n = 0; n < objlist[c][t].instances[obji].matrix.length; n++) {
							objlist[c][t].instances[obji].matrix[n] = gameupdate[c][t][updi][1][n];
							objlist[c][t].instances[obji].step[n] = gameupdate[c][t][updi][2][n];
						}
					} else {
						objlist[c][t].instances.push({id: gameupdate[c][t][updi][0], matrix: gameupdate[c][t][updi][1], step: gameupdate[c][t][updi][2]});
					}
				}
			}
		} //console.log('objlist: ', objlist, 'gameupdate: ', gameupdate);
	}

	function updatestate() { //console.log('target: ', player.target);
		player.lineoffire = player.target == undefined ? undefined : v3.substract(player.target.matrix.slice(12,15), player.state.matrix.slice(12,15));
		player.controls.lockedontarget = (player.controls.autopilotON && (v3.vlength2(player.lineoffire) < player.autopilotrange2)); //console.log(player.controls.autopilotON, (v3.vlength2(player.lineoffire) < player.autopilotrange2));
		if(player.controls.changetarget) {
			var list = objlist.ships.interceptor.instances.concat(objlist.ships.carrier.instances); //console.log(list);
			if(list.length == 0) {return;}
			var offset = 0;
			var i = list.indexOf(player.target); //console.log(i, list.length, list[0]);
			i = i == -1 ? 0 : i;
			player.target = i + 1 < list.length ? list[i + 1] : list[offset]; //console.log(list, i);
			
			player.controls.changetarget = (player.target == undefined || player == player.target) ? true : false; //console.log(player.target);
		}	
		
		if(player.controls.accelerateON)	{player.state.velocity = v3.add(player.state.velocity, v3.multiply(player.state.matrix.slice(8,11), player.acceleration));}
		if(player.controls.brakesON)		{player.state.velocity = v3.multiply(player.state.velocity, 0.9);}

		player.state.rotation[0] += 
			player.controls.mouseY == undefined ? 0 :
			player.controls.mouseY ? player.controls.rotationspeed[0] : -player.controls.rotationspeed[0];
			player.controls.mouseY = undefined;
			
		player.state.rotation[2] += 
			player.controls.mouseX == undefined ? 0 :
			player.controls.mouseX ? player.controls.rotationspeed[2] : -player.controls.rotationspeed[2];
			player.controls.mouseX = undefined;
			
		player.state.rotation[1] += 
			player.controls.turnLeft ? -player.controls.rotationspeed[1] :
			player.controls.turnRight ? player.controls.rotationspeed[1] :
			0;
	}
	
	function move() {
		player.state.matrix = m4.zRotate(player.state.matrix, player.state.rotation[2]); player.state.rotation[2] = 0;
		player.state.matrix = m4.xRotate(player.state.matrix, player.state.rotation[0]); player.state.rotation[0] = 0;
		player.state.matrix = m4.yRotate(player.state.matrix, player.state.rotation[1]); player.state.rotation[1] = 0;

		player.state.matrix[12] += player.state.velocity[0];
		player.state.matrix[13] += player.state.velocity[1];
		player.state.matrix[14] += player.state.velocity[2];
	}
	
	function interpolate() { //console.log(objlist);
		var o, keys;
		for(var c in objlist) {
			for(var t in objlist[c]) { keys = Object.keys(objlist[c][t].instances);
				for(var j in keys) { //console.log(objlist[c][t].instances[keys[j]], gameupdate[0][c][t][keys[j]]);
					o = objlist[c][t].instances[keys[j]];
					o.matrix = m4.add(o.matrix, o.step);
				}
			}
		}
	}