'use strict';
	function main() {
		var gl = document.getElementById('canvas').getContext('webgl');
		if(!gl) {
			window.alert('Absolutely no WebGL here!');
		}

		/*-=ANGLE_instanced_arrays=-*/
		var extension = gl.getExtension('ANGLE_instanced_arrays');
		if(!extension) {
			window.alert('ANGLE_instanced_arrays not supported');
		}

		var vertexShaderSource = document.getElementById('vertex-shader').text;
		var fragmentShaderSource = document.getElementById('fragment-shader').text;
		var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
		var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
		var program = createProgram(gl, vertexShader, fragmentShader);

		var matrixLocation = gl.getAttribLocation(program, 'matrix');
		var positionLocation = gl.getAttribLocation(program, 'a_position');
		var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
		var normalLocation = gl.getAttribLocation(program, 'a_normal');
		
		var viewProjectionLoc = gl.getUniformLocation(program, 'viewprojection');
				
		var pointsource = gl.getUniformLocation(program, 'u_pointsource');
		//var directionalsource = gl.getUniformLocation(program, 'u_directionalsource');
		
		var ambient = gl.getUniformLocation(program, 'u_ambient');
		var point = gl.getUniformLocation(program, 'u_point');
		//var directional = gl.getUniformLocation(program, 'u_directional');
		
		var luminosity = gl.getUniformLocation(program, 'u_luminosity');
		var kambient = gl.getUniformLocation(program, 'u_kambient');
		var kdiffuse = gl.getUniformLocation(program, 'u_kdiffuse');
		var kspecular = gl.getUniformLocation(program, 'u_kspecular');
		var shininess = gl.getUniformLocation(program, 'u_shininess');

		var pointLocation = [15 * 10 ** 10, 0, 0];
		
		var ambientIntensity = .1;
		var pointIntensity = .5;		
		//var directionalDirection = [0,-1,0];
		//var directionalIntensity = 0;

				var currentX, currentY, nextX, nextY;
				canvas.addEventListener('mousemove', e => {
					nextX = e.clientX;
					nextY = e.clientY;
					
					//console.log('next/currentX: ', nextX, currentX, 'next/currentY: ', nextY, currentY);
					var condition = player.controls.autopilotON && player.controls.lockedontarget;

					player.controls.mouseX =
						condition ? undefined :
						nextX > currentX ? true :
						nextX < currentX ? false :
						undefined;		
					player.controls.mouseY =
						condition ? undefined :
						nextY > currentY ? true :
						nextY < currentY ? false :
						undefined;						

					currentX = nextX;
					currentY = nextY; //console.log(player.controls.mouseX, player.controls.mouseY);
				});

				canvas.addEventListener('mousedown',	(e) => {player.controls.shootON = true;});
				canvas.addEventListener('mouseup',		(e) => {player.controls.shootON = false;});

				document.addEventListener('keydown', (e) => {
					if(e.code == 'KeyQ')	{player.controls.turnLeft = true;}
					if(e.code == 'KeyE')	{player.controls.turnRight = true;}
					if(e.code == 'KeyW')	{player.controls.accelerateON = true;}
					if(e.code == 'Space')	{player.controls.brakesON = true;}

					if(e.code == 'KeyS')	{player.controls.autopilotON = !player.controls.autopilotON;}
					if(e.code == 'KeyR')	{player.controls.changetarget = true;}
				});
				document.addEventListener('keyup', (e) => {
					if(e.code == 'KeyQ')	{player.controls.turnLeft = false;}
					if(e.code == 'KeyE')	{player.controls.turnRight = false;}
					if(e.code == 'KeyW')	{player.controls.accelerateON = false;}
					if(e.code == 'Space')	{player.controls.brakesON = false;}
					if(e.code == 'Escape')	{score(`You've surrendered!`);}
				});

		//console.log(player);
		var camera = new Camera(gl);

		for(var i in objlist) {
			for(var j in objlist[i]) {				
				objlist[i][j].indexBuffer = gl.createBuffer();
				objlist[i][j].positionBuffer = gl.createBuffer();
				objlist[i][j].textureBuffer = gl.createBuffer();
				objlist[i][j].normalBuffer = gl.createBuffer();

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, objlist[i][j].indexBuffer);
				setIndices(objlist[i][j], gl);

				gl.bindBuffer(gl.ARRAY_BUFFER, objlist[i][j].positionBuffer);
				setGeometry(objlist[i][j], gl);

				gl.bindBuffer(gl.ARRAY_BUFFER, objlist[i][j].textureBuffer);
				setTexcoords(objlist[i][j], gl);

				gl.bindBuffer(gl.ARRAY_BUFFER, objlist[i][j].normalBuffer);
				setNormals(objlist[i][j], gl);
			}
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		var matrixBuffer = gl.createBuffer();

		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
			const level = 0;
			const internalFormat = gl.RGB;
			const width = 4;
			const height = 2;
			const border = 0;
			const format = gl.RGB;
			const type = gl.UNSIGNED_BYTE;
			const data = new Uint8Array(
			[
				255,0,0,	0,255,0,	0,0,255,	255,255,255,
				255,255,0,	255,0,255,	0,255,255,	0,0,0,
			]);
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		requestAnimationFrame(start);

		function start() { //console.log(gameupdates[0]);
			statistics[1] += 15;
			emitcontrols();
			simulate();
			camera.realign();
			render(); //console.log(objlist); return;
			requestAnimationFrame(start);
		}

		function render() { //console.log('render started');
			var o;

			resizeCanvasToDisplaySize(gl.canvas);
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			gl.enable(gl.CULL_FACE);
			gl.enable(gl.DEPTH_TEST);
			gl.useProgram(program);

			gl.uniform1f(ambient, ambientIntensity);
			gl.uniform1f(point, pointIntensity);
			
			gl.uniform3fv(pointsource, pointLocation);
			
			//gl.uniform1f(directional, directionalIntensity);
			//gl.uniform3fv(directionalsource, directionalDirection);
			
			var projectionMatrix = m4.perspective(camera.fieldOfViewRadians, camera.aspect, camera.zNear, camera.zFar);
			var viewMatrix = m4.inverse(camera.state.matrix); //console.log(projectionMatrix, viewMatrix);
			var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
			var viewITMatrix = m4.inverse(m4.transpose(viewMatrix));
			
			gl.uniformMatrix4fv(viewProjectionLoc, false, viewProjectionMatrix);

			var matrices;
			
			for(var h in objlist) { //console.log(objlist);
				for(var i in objlist[h]) { //console.log(objlist[h] == objlist.celestials);
					o = objlist[h][i]; //console.log(o); //one kind of projectiles, ships, effects, celestials 
					//if(o.instances.length == 0) {continue;}

					o.model.indices.length > 3 ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE);
					objlist[h] == objlist.celestials ? gl.disable(gl.DEPTH_TEST) : gl.enable(gl.DEPTH_TEST);

					gl.uniform1f(luminosity, o.model.luminosity);
					gl.uniform1f(kambient, o.model.kambient);
					gl.uniform1f(kdiffuse, o.model.kdiffuse);
					gl.uniform1f(kspecular, o.model.kspecular);
					gl.uniform1f(shininess, o.model.shininess);
					
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

					gl.enableVertexAttribArray(positionLocation);
					gl.bindBuffer(gl.ARRAY_BUFFER, o.positionBuffer);
						var size = 3;
						var type = gl.FLOAT;
						var normalize = false;
						var stride = 0;
						var offset = 0;
					gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

					gl.enableVertexAttribArray(texcoordLocation);
					gl.bindBuffer(gl.ARRAY_BUFFER, o.textureBuffer);
						var size = 2;
						var type = gl.FLOAT;
						var normalize = false;
						var stride = 0;
						var offset = 0;
					gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

					gl.enableVertexAttribArray(normalLocation);
					gl.bindBuffer(gl.ARRAY_BUFFER, o.normalBuffer);
						var size = 3;
						var type = gl.FLOAT;
						var normalize = false;
						var stride = 0;
						var offset = 0;
					gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

					/*-=ANGLE_instanced_arrays=-*/
						var numvertices = o.model.indices.length;
						var numinstances = Object.keys(o.instances).length; //console.log(o.instances, numvertices, numinstances);

						matrices = [];
						for(var i = 0; i < o.instances.length; i++) { //console.log(o.instances); //return;
							matrices.push(...o.instances[i].matrix); //console.log(o.instances[keys[j]].matrix);
						} //console.log(matrices);

						gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
						gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(matrices), gl.DYNAMIC_DRAW);

						for (var i = 0; i < 4; ++i) {
							var loc = matrixLocation + i;
							gl.enableVertexAttribArray(loc);
							gl.vertexAttribPointer(
								loc,				// location
								4,					// size (num values to pull from buffer per iteration)
								gl.FLOAT,			// type of data in buffer
								false,				// normalize
								4 * 16,				// stride, num bytes to advance to get to next set of values
								i * 4 * 4,			// offset in buffer, bytes per row of 4
							);
							extension.vertexAttribDivisorANGLE(loc, 1);
						}
					
					extension.drawElementsInstancedANGLE(gl.TRIANGLES, numvertices, gl.UNSIGNED_SHORT, 0, numinstances);

					gl.bindBuffer(gl.ARRAY_BUFFER, null);
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
				}
			}
		}
	}