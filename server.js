'use strict';
	var express = require('express');
	var http = require('http');
	var path = require('path');
	var socketio = require('socket.io');
	var app = express();
	var server = http.Server(app);
	var io = socketio(server);
	var port = 1337;
	
	var clients = 0;
	var players = [];
	
	var processor = require('./processor');
	var utils = require('./shared/utils.js');
	var v3 = utils.v3;
	var m4 = utils.m4;
	var snapshots = [];
	var gameupdaterate = 1000/20;
	
	processor.init();
	
	app.set('port', port);
	app.use('/', express.static(__dirname));
	
	// Routing
	app.get('/', function(request, response) {
		response.sendFile(path.join(__dirname, '/client/html/index.html'));
	});
	app.get('/game.html', function(request, response) {
		response.sendFile(path.join(__dirname, '/client/html/game.html'));
	});
		
	server.listen(port, function() {
		console.log('Starting server on port ' + port);
	});
	
	io.on('connection', (socket) => {
		clients++;
		console.log('user id ' + socket.id + ' connected, users online: ' + clients); //console.log(gameupdates);
		socket.emit('welcome', {servername: 'myckio', player: processor.newplayer(), gameupdaterate: gameupdaterate});
		socket.on('controlsupdate', (data) => {
			//console.log('got input from client id ' + data.id); //put input to corresponding player's input queue
			//console.log(data);
			for(var i in processor.players[data.id].controls) { 
				processor.players[data.id].controls[i] = data.controls[i]; //console.log(processor.players[data.id].controls);
			}
		});
		
		socket.on('disconnect', (socket) => {
			clients--;
			console.log('user disconnected, users online: ' + clients);
		});	
	});
	
	setInterval(function() {
		processor.run(); //console.log(players);
	}, 1000/60);
	
	setInterval(() => {
		snapshots.push(writesnapshot());
		if(snapshots.length > 2) {snapshots.shift();}
		if(snapshots.length < 2) {return;} //console.log(63, snapshots);
		io.sockets.emit('gameupdate', packgameupdate()); //console.log('updates sent to all players');
	}, gameupdaterate);

	function writesnapshot() {
		var data = {};
		for(var c in processor.objlist) { data[c] = {};
			for(var t in processor.objlist[c]) { data[c][t] = {};
				for(var i in processor.objlist[c][t].instances) { data[c][t][processor.objlist[c][t].instances[i].id] = {};//console.log(processor.objlist[h][i].instances[i].state.matrix);
					data[c][t][processor.objlist[c][t].instances[i].id] = processor.objlist[c][t].instances[i].state.matrix;
				}
			}
		} //console.log(80, snapshots[0]);	
		return data;
	}
	
	function packgameupdate() {
		var classes = Object.keys(snapshots[0]), gc, gt, ids, ss0, ss1;
		var gameupdate = {};
		for(var c in snapshots[0]) { gameupdate[c] = {}
			for(var t in snapshots[0][c]) { gameupdate[c][t] = {}; ids = Object.keys(snapshots[0][c][t]);
				for(var i in ids) {
					ss0 = snapshots[0][c][t][ids[i]];
					ss1 = snapshots[1][c][t][ids[i]];
					if(ss1 != undefined) {
						gameupdate[c][t][i] = [ss0, m4.multiplyn(m4.substract(ss1, ss0), .333)];
					} //else {console.log(97, snapshots[0][c][t][ids[i]], snapshots[1][c][t][ids[i]]);}
				}
			}
		} //console.log(92, gameupdate);
		return gameupdate;
	}	