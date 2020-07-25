'use strict';
	var isserver = typeof window == 'undefined';

	function radToDeg(r) {
		return r * 180 / Math.PI;
	}

	function degToRad(d) {
		return d * Math.PI / 180;
	}

	var m4 = {
		composeCameraMatrix: function(xAxis, yAxis, zAxis, cameraPosition) {
			return [
				xAxis[0], xAxis[1], xAxis[2], 0,
				yAxis[0], yAxis[1], yAxis[2], 0,
				zAxis[0], zAxis[1], zAxis[2], 0,
				cameraPosition[0],
				cameraPosition[1],
				cameraPosition[2],
				1,
			];
		},
		lookAt: function(cameraPosition, target, up) {
			var zAxis = v3.normalize(v3.substract(cameraPosition, target));
			var xAxis = v3.normalize(v3.cross(up, zAxis));
			var yAxis = v3.normalize(v3.cross(zAxis, xAxis));

			return m4.composeCameraMatrix(xAxis, yAxis, zAxis, cameraPosition);
		},
		perspective: function(fieldOfViewRadians, aspect, near, far) {
			var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewRadians);
			var rangeInv = 1.0 / (near - far);

			return [
				f/aspect, 	0, 			0, 						0,
				0, 			f, 			0, 						0,
				0, 			0, 			(near+far)*rangeInv,    -1,
				0,			0,			near*far*rangeInv*2, 	0,
			];
		},
		projection: function(width, height, depth) {
			return [
				2/width, 	0, 			0, 			0,
				0, 			-2/height, 	0, 			0,
				0, 			0, 			2/depth, 	0,
				-1, 		1, 			0, 			1,
			];
		},
		add: function(a, b) {
			var c = [];
			for(var i = 0; i < a.length; i++) {
				c[i] = a[i] + b[i];
			}
			return c;
		},
		substract: function(a, b) {
			var c = [];
			for(var i = 0; i < a.length; i++) {
				c[i] = a[i] - b[i];
			}
			return c;
		},
		multiplyn: function(a, n) {
			var c = [];
			for(var i = 0; i < a.length; i++) {
				c[i] = a[i] * n;
			}
			return c;
		},
		multiply: function(a, b) {
			var d = 4;
			var c = [
				0,  0,  0,  0,
				0,  0,  0,  0,
				0,  0,  0,  0,
				0,  0,  0,  0,
			];
			for(var i = 0; i < d; i++) {
				for(var j = 0; j < d; j++) {
					for(var k = 0; k < d; k++) {
						c[i * d + j] += b[i * d + k] * a[k * d + j];
					}	
				}
			}		
			return c;
		},
		m4v3: function (m4, v3) {
			var d = 4;
			var r = [0,0,0,0,];
			var v4 = v3.slice();
			v4.push(1);

			for(var i = 0; i < d; i++) {
				for(var j = 0; j < d; j++) {
					r[i] += m4[i + d*j] * v4[j];
				}
			}

			return r.slice(0,d);
		},
		inverse: function(m) {
			var m00 = m[0 * 4 + 0];
			var m01 = m[0 * 4 + 1];
			var m02 = m[0 * 4 + 2];
			var m03 = m[0 * 4 + 3];
			var m10 = m[1 * 4 + 0];
			var m11 = m[1 * 4 + 1];
			var m12 = m[1 * 4 + 2];
			var m13 = m[1 * 4 + 3];
			var m20 = m[2 * 4 + 0];
			var m21 = m[2 * 4 + 1];
			var m22 = m[2 * 4 + 2];
			var m23 = m[2 * 4 + 3];
			var m30 = m[3 * 4 + 0];
			var m31 = m[3 * 4 + 1];
			var m32 = m[3 * 4 + 2];
			var m33 = m[3 * 4 + 3];
			var tmp_0  = m22 * m33;
			var tmp_1  = m32 * m23;
			var tmp_2  = m12 * m33;
			var tmp_3  = m32 * m13;
			var tmp_4  = m12 * m23;
			var tmp_5  = m22 * m13;
			var tmp_6  = m02 * m33;
			var tmp_7  = m32 * m03;
			var tmp_8  = m02 * m23;
			var tmp_9  = m22 * m03;
			var tmp_10 = m02 * m13;
			var tmp_11 = m12 * m03;
			var tmp_12 = m20 * m31;
			var tmp_13 = m30 * m21;
			var tmp_14 = m10 * m31;
			var tmp_15 = m30 * m11;
			var tmp_16 = m10 * m21;
			var tmp_17 = m20 * m11;
			var tmp_18 = m00 * m31;
			var tmp_19 = m30 * m01;
			var tmp_20 = m00 * m21;
			var tmp_21 = m20 * m01;
			var tmp_22 = m00 * m11;
			var tmp_23 = m10 * m01;

			var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
			var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
			var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
			var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

			var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

			return [
				d * t0,
				d * t1,
				d * t2,
				d * t3,
				d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
				d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
				d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
				d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
				d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
				d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
				d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
				d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
				d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
				d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
				d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
				d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
			];
		},
		transpose: function(m) {
			return [
				m[0],m[4],m[8],m[12],
				m[1],m[5],m[9],m[13],
				m[2],m[6],m[10],m[14],
				m[3],m[7],m[11],m[15],
			];
		},
		translation: function(tx, ty, tz) {
			return [
				1,  0,  0,  0,
				0,  1,  0,  0,
				0,  0,  1,  0,
				tx, ty, tz, 1,
			];
		},
		xRotation: function(theta) {
			var c = Math.cos(theta);
			var s = Math.sin(theta);
			return [
				1,  0,  0,  0,
				0,  c,  s,  0,
				0, -s,  c,  0,
				0,  0,  0,  1,
			];
		},
		yRotation: function(phi) {
			var c = Math.cos(phi);
			var s = Math.sin(phi);
			return [
				c,  0, -s,  0,
				0,  1,  0,  0,
				s,  0,  c,  0,
				0,  0,  0,  1,
			];
		},	
		zRotation: function(gamma) {
			var c = Math.cos(gamma);
			var s = Math.sin(gamma);
			return [
				c,  s,  0,  0,
			   -s,  c,  0,  0,
				0,  0,  1,  0,
				0,  0,  0,  1,
			];
		},	
		scaling: function(sx, sy, sz) {
			return [
				sx, 0,  0,  0,
				0, sy,  0,  0,
				0,  0, sz,  0,
				0,  0,  0,  1,
			];
		},
		translate: function(m, tx, ty, tz) {
			return m4.multiply(m, m4.translation(tx, ty, tz));},
		xRotate: function (m, theta) {
			return m4.multiply(m, m4.xRotation(theta));},
		yRotate: function (m, phi) {
			return m4.multiply(m, m4.yRotation(phi));},
		zRotate: function (m, gamma) {
			return m4.multiply(m, m4.zRotation(gamma));},
		scale: function(m, sx, sy, sz) {
			return m4.multiply(m, m4.scaling(sx, sy, sz));},
	};

	var v = {
		multiply: function(v, n) {
			var result = [];
			for(var i = 0; i < v.length; i++) {
				result.push(v[i] * n);
			}
			return result;
		}	
	};

	var v3 = {
		abs: function(v) {
			return [Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2])];
		},
		add: function(a, b) {
			return [
				a[0] + b[0], 
				a[1] + b[1], 
				a[2] + b[2],
			];
		},
		substract: function(a, b) {
			return [
				a[0] - b[0], 
				a[1] - b[1], 
				a[2] - b[2],
			];
		},
		multiply: function(v, n) {
			return [
				n * v[0], 
				n * v[1], 
				n * v[2],
			];
		},
		inverse: function(v) {
			return [
				-1 * v[0],
				-1 * v[1],
				-1 * v[2],
			];
		},
		dot: function(a, b) {
			return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
		},
		cross: function(a, b) {
			return [
				a[1] * b[2] - a[2] * b[1],
				a[2] * b[0] - a[0] * b[2],
				a[0] * b[1] - a[1] * b[0],
			];
		},
		vlength: function(v) {
			return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		},
		vlength2: function(v) {
			return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
		},
		normalize: function(v) {
			var length = v3.vlength(v);
			if(length < 0.0001) {return [0, 0, 0];}
			return v3.multiply(v, 1/length);
		},
	}
	
	if(isserver) {
		module.exports.v = v;
		module.exports.v3 = v3;
		module.exports.m4 = m4;
		module.exports.radToDeg = radToDeg;
		module.exports.degToRad = radToDeg;
	}