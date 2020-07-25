'use strict';
	function createShader(gl, type, source) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if(success) {
			return shader;
		}

		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}

	function createProgram(gl, vertexShader, fragmentShader) {
		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		var success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if(success) {
			gl.detachShader(program, vertexShader);
			gl.deleteShader(vertexShader);
			gl.detachShader(program, fragmentShader);
			gl.deleteShader(fragmentShader);
			return program;
		}

		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	}

	function resizeCanvasToDisplaySize(canvas, multiplier) {
		multiplier = multiplier || 1;
		const width  = canvas.clientWidth  * multiplier | 0;
		const height = canvas.clientHeight * multiplier | 0;
		if (canvas.width !== width ||  canvas.height !== height) {
			canvas.width  = width;
			canvas.height = height;
			return true;
		}

		return false;
	}

	function setIndices(o, gl) {
		gl.bufferData(
			gl.ELEMENT_ARRAY_BUFFER,
			o.model.indices,
			gl.STATIC_DRAW
		);
	}

	function setGeometry(o, gl) {
		gl.bufferData(
			gl.ARRAY_BUFFER, 
			o.model.nodes,
			gl.STATIC_DRAW
		);
	}

	function setTexcoords(o, gl) {
		gl.bufferData (
			gl.ARRAY_BUFFER,
			o.model.texcoords,
			gl.STATIC_DRAW
		);
	}

	function setNormals(o, gl) {
		gl.bufferData (
			gl.ARRAY_BUFFER,
			o.model.normals,
			gl.STATIC_DRAW
		);
	}

	function setMatrices(o, gl) {
		gl.bufferData(
			gl.ARRAY_BUFFER,
			matrixData,
			gl.DYNAMIC_DRAW
		);
	}
	//function setColors(o, gl) {
	//	gl.bufferData(
	//		gl.ARRAY_BUFFER,
	//		new Uint8Array(o.model.colors),
	//		gl.STATIC_DRAW
	//	);
	//}