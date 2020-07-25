'use strict';
	var player;
	var gameupdate;
	var gameupdaterate;
	var simulationrefresh = 3;
	var simulationcount = 0;
	
	function simulate() {
		if(simulationcount == 0) { //console.log('new step');
			//console.log(player);
			unpackgameupdate();
			objlist.ships.fighter.instances.push({matrix: player.state.matrix, step: player.state.matrix});
			if(gameupdate == undefined) {return;}
			simulationcount = simulationrefresh;
		}//} else { //console.log('interpolation');
			updatestate();
			move();
			interpolate();
			simulationcount--;
		//}
	}

	function unpackgameupdate() { //console.log(gameupdate);
		for(var c in objlist) {
			for(var t in objlist[c]) { //console.log(gameupdate[c][t]);
				objlist[c][t].instances = [];
				for(var i in gameupdate[c][t]) { //console.log(objlist[c][t].instances, gameupdate[c][t][i]);
					objlist[c][t].instances.push({matrix: gameupdate[c][t][i][0], step: gameupdate[c][t][i][1]}); //console.log(objlist[c][t].instances[keys[j]], gameupdate[0][c][t][keys[j]]);
				}
			}
		} //console.log('objlist: ', objlist, 'gameupdate: ', gameupdate);
	}

	function updatestate() { //console.log('target: ', player.target);
		player.lineoffire = player.target == undefined ? undefined : v3.substract(player.target.matrix.slice(12,15), player.state.matrix.slice(12,15));
		player.controls.lockedontarget = (player.controls.autopilotON && (v3.vlength2(player.lineoffire) < player.autopilotrange2)); console.log(player.controls.autopilotON, (v3.vlength2(player.lineoffire) < player.autopilotrange2));
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