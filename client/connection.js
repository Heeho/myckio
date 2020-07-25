'use strict';
	var socket = io();
	
	socket.on('welcome', (data) => {
		console.log("Welcome, you've connected to " + data.servername + ", your id is " + data.player.id + ".");
		gameupdate = data.gameupdate; //console.log(gameupdates);
		gameupdaterate = data.gameupdaterate;
		player = data.player; //console.log(player);
		var dummy = {matrix: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]};
		player.target = dummy;
		//objlist.ships.fighter.instances[player.id] = player; //console.log(objlist.ships.fighter.instances[player.id], objlist.ships.fighter.instances);
		socket.on('gameupdate', (data) => { //console.log(data);
			gameupdate = data; //console.log(data);
		});
		main();
	});

	
	function emitcontrols() {
		socket.emit('controlsupdate', {id: player.id, controls: player.controls});
	}