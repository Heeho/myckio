'use strict';
	var isserver = typeof window == 'undefined';
	
	if(isserver) {
		var utils = require('./utils.js');
		var v = utils.v;
		var v3 = utils.v3;
		var m4 = utils.m4;
	}
		
	var models = {
		projectiles: {
			bolt: {
				size: 5,			
				nodes: [0,0,0,-11,0,6666,11,0,6666,],
				indices: [0,1,2,],
				texcoords: [1,0,1,0,1,0,],
				hitbox: [0,0,0,-11,0,6666,11,0,6666,],
				luminosity: 0,
				kambient: 0,
				kdiffuse: 0,
				kspecular: 0,
				shininess: 0,
			},
		},
		effects: {
			explosion: {
				size: 4,
				nodes: [1,0,0,0,1,0,0,0,1,-1,0,0,0,-1,0,0,0,-1,],
				indices: [0,5,1,5,3,1,3,2,1,2,0,1,5,0,4,0,2,4,2,3,4,3,5,4,],
				texcoords: [1,0,1,0,1,0,1,0,1,0,1,0,],
				luminosity: 0,
				kambient: 0,
				kdiffuse: 0,
				kspecular: 0,
				shininess: 0,
			},
			throttle: {
				size: 8,
				nodes: [/*0*/-1,0,0,/*1*/0,-1,0,/*2*/1,0,0,/*3*/0,0,-1,],
				indices: [0,3,1,3,2,1,0,1,2,0,2,3,],
				texcoords: [0,0,0,0,0,0,0,0,],
				luminosity: .2,
				kambient: 0,
				kdiffuse: 0,
				kspecular: 0,
				shininess: 0,
			},
			flash: {
				size: 11,
				nodes: [/*0*/-1,0,0,/*1*/0,-1,0,/*2*/1,0,0,/*3*/0,0,-2,],
				indices: [0,3,1,3,2,1,0,1,2,0,2,3,],
				texcoords: [.499,1,.499,1,.499,1,.499,1,],
				luminosity: .2,
				kambient: 0,
				kdiffuse: 0,
				kspecular: 0,
				shininess: 0,
			},
			forcefield: {
				size: 4,
				nodes: [-1,1,4,1,1,4,0,-1,4],
				indices: [2,1,0,],
				texcoords: [1,0,1,0,1,0,],
				luminosity: 0,
				kambient: 0,
				kdiffuse: 0,
				kspecular: 0,
				shininess: 0,
			}
		},
		ships: {
			fighter: {
				size: 10,
				nodes: [/*jaws*//*0*/-1,0,6,/*1*/1,0,6,/*front*//*2*/-1,0,4,/*3*/1,0,4,/*top*//*4*/-1,-1,2,/*5*/1,-1,2,/*sides*//*6*/-3,0,0,/*7*/3,0,0,/*bottom*//*8*/-1,1,0,/*9*/1,1,0,/*butt*//*10*/-2,0,-2,/*11*/0,-1,-2,/*12*/2,0,-2,],
				indices: [/*frontwings*/0,6,4,1,5,7,/*sides*/6,11,4,7,5,11,/*hood*/4,11,5,/*buttocks*/11,6,10,11,12,7,/*front*/2,4,3,3,4,5,/*upperjaws*/2,0,4,3,5,1,/*butt*/10,12,11,/*bottom*/8,12,10,8,9,12,/*bottomsides*/8,10,6,9,7,12,/*bottomwings*/8,6,0,9,1,7,/*bottomfront*/8,2,3,9,8,3,/*bottomjaws*/8,0,2,9,3,1,],
				texcoords: [.5,.0,.5,.0,.5,.5,.5,.5,.5,.5,.5,.5,.5,.0,.5,.0,.5,.0,.5,.0,.5,.0,.5,.0,.5,.0,],
				hitbox: [-1,0,6,1,0,6,/*+*/-1,-1,2,1,-1,2,/*+*/-3,0,0,3,0,0,/*+*/-1,1,0,1,1,0,/*+*/2,0,-2,0,-1,-2,-2,0,-2,],
				luminosity: 0,
				kambient: 1,
				kdiffuse: 1,
				kspecular: 1,
				shininess: 4,
			},
			carrier: {
				size: 8000,
				nodes: [/*front*//*0*/0,1,2,/*butt*//*1*/-2,0,-1,/*2*/0,-2,-1,/*3*/2,0,-1,],
				indices: [/*sides*/0,1,2,0,2,3,/*bottom*/0,3,1,/*butt*/2,1,3,],
				texcoords: [.499,.0,.499,.0,.499,.0,.499,.0,],
				hitbox: [0,1,2,0,-2,-1,-2,0,-1,2,0,-1,],
				luminosity: 0,
				kambient: 1,
				kdiffuse: 1,
				kspecular: 1,
				shininess: 4,
			},
			interceptor: {
				size: 10,
				nodes: [/*tip*//*0*/0,0,4,/*pit*//*1*/0,-0.5,3,/*top*//*2*/0,-1,2,/*3*/-2,-1,0,/*4*/2,-1,0,/*sides*//*5*/-3,0,0,/*6*/3,0,0,/*butt*//*7*/-2,0,-2,/*8*/0,-1,-2,/*9*/2,0,-2,/*bottom*//*10*/-1,1,0,/*11*/1,1,0,],
				indices: [/*front*/0,5,3,0,4,6,0,3,1,0,1,4,/*windview*/3,2,1,1,2,4,/*top*/2,3,8,2,8,4,/*buttocks*/5,7,3,3,7,8,4,8,9,6,4,9,/*butt*/7,9,8,/*bottom*/0,10,5,0,11,10,0,6,11,5,10,7,6,9,11,10,11,7,11,9,7,],
				texcoords: [0,.0,0,.5,0,.5,0,.5,0,.5,0,.0,0,.0,0,.0,0,.0,0,.0,0,.0,0,.0,],
				hitbox: [/*tip*//*0*/0,0,4,/*top*//*2*/0,-1,2,/*3*/-2,0,0,/*4*/2,0,0,/*sides*//*5*/-3,0,0,/*6*/3,0,0,/*butt*//*7*/-2,0,-2,/*8*/0,-1,-2,/*9*/2,0,-2,/*bottom*//*10*/-1,1,0,/*11*/1,1,0,],
				luminosity: 0,
				kambient: 1,
				kdiffuse: 1,
				kspecular: 1,
				shininess: 4,
			},
		},
		celestials: {
			sun: {
				size: 7 * 10 ** 8,
				nodes: [1,0,0,0,1,0,0,0,1,-1,0,0,0,-1,0,0,0,-1,],
				indices: [0,5,1,5,3,1,3,2,1,2,0,1,5,0,4,0,2,4,2,3,4,3,5,4,],
				texcoords: [1,0,1,0,1,0,1,0,1,0,1,0,],
				hitbox: [1,0,0,0,1,0,0,0,1,-1,0,0,0,-1,0,0,0,-1,],
				luminosity: 1,
				kambient: 1,
				kdiffuse: 1,
				kspecular: 1,
				shininess: 1,
			},
			planet: {
				size: 64 * 10 ** 5,
				nodes: [1,0,0,0,1,0,0,0,1,-1,0,0,0,-1,0,0,0,-1,],
				indices: [0,5,1,5,3,1,3,2,1,2,0,1,5,0,4,0,2,4,2,3,4,3,5,4,],
				texcoords: [.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,],
				hitbox: [1,0,0,0,1,0,0,0,1,-1,0,0,0,-1,0,0,0,-1,],
				luminosity: 0,
				kambient: 1,
				kdiffuse: 1,
				kspecular: 1,
				shininess: 4,
			},
			moon: {
				size: 17 * 10 ** 5,
				nodes: [1,0,0,0,1,0,0,0,1,-1,0,0,0,-1,0,0,0,-1,],
				indices: [0,5,1,5,3,1,3,2,1,2,0,1,5,0,4,0,2,4,2,3,4,3,5,4,],
				texcoords: [0,.5,0,.5,0,.5,0,.5,0,.5,0,.5,],
				hitbox: [1,0,0,0,1,0,0,0,1,-1,0,0,0,-1,0,0,0,-1,],
				luminosity: 0,
				kambient: 1,
				kdiffuse: 1,
				kspecular: 1,
				shininess: .5,
			},
		},
	}

	for(var kind in models) {
		for(var model in models[kind]) {
			set(models[kind][model]); //console.log(models[kind][model]);
		}
	}

	function set(m) {
		m.nodes = new Float32Array(v.multiply(m.nodes, m.size));
		m.normals = [];
		var p1, p2, p3, p1p2, p1p3;
		var normal;
		var facenormals = [];
		var facenormal;
		
		for(var i = 0; i < m.indices.length; i += 3) { //console.log(3 * m.indices[i], 3 * m.indices[i] + 3);
			p1 = m.nodes.slice(3 * m.indices[i + 0], 3 * m.indices[i + 0] + 3);
			p2 = m.nodes.slice(3 * m.indices[i + 1], 3 * m.indices[i + 1] + 3);
			p3 = m.nodes.slice(3 * m.indices[i + 2], 3 * m.indices[i + 2] + 3); //console.log('p1, p2, p3: ', p1, p2, p3);
			p1p2 = v3.substract(p2, p1);
			p1p3 = v3.substract(p3, p1);
			facenormal = v3.normalize(v3.cross(p1p2, p1p3)); //console.log(facenormal);
			facenormals.push(...facenormal); 
		} //console.log('facenormals: ', facenormals);

		for(var i = 0; i < m.nodes.length/3; i++) { //0, 1, 2 ,3
			normal = [0,0,0];
			for(var j = 0; j < m.indices.length; j += 3) {
				if(m.indices[j] == i || m.indices[j + 1] == i || m.indices[j + 2] == i) { //console.log('i, m.indices[j + x]: ', i, m.indices[j], m.indices[j + 1], m.indices[j + 2]);
					normal = v3.normalize(v3.add(normal, facenormals.slice(j, j + 3))); //console.log('j, facenormals.slice(j, j + 3): ', j, facenormals.slice(j, j + 3));
				}

			}
			m.normals.push(...normal); //console.log('normal: ', normal);
		} //console.log('m.normals: ', m.normals);

		m.normals = new Float32Array(m.normals);
		m.indices = new Uint16Array(m.indices);
		m.texcoords = new Float32Array(m.texcoords);

		if(m.hitbox != undefined) {
			m.hitbox = v.multiply(m.hitbox, m.size);
			m.radius = 0;
			m.radius2 = 0;
			var max = Number.NEGATIVE_INFINITY;
			var max2 = Number.NEGATIVE_INFINITY;
			var len, len2;
			for(var i = 0; i < m.nodes.length; i += 3) {
				len = v3.vlength(m.hitbox.slice(i, i + 3));
				len2 = len ** 2;
				max = len > max ? len : max;
				max2 = len2 > max2 ? len2 : max2;
			}
			m.radius = max;
			m.radius2 = max2; //console.log(m, 'radius, radius2: ', m.radius, m.radius2);
		}
	}
	if(isserver) {
		module.exports = models;
	}