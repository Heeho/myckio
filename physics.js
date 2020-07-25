'use strict';
	var utils = require('./shared/utils.js');
	var v3 = utils.v3;
	var m4 = utils.m4;
	var Thing = require('./thing.js');
	
	var projectiles = require('./projectiles.js');
	var Projectile = projectiles.Projectile;
	var Bolt = projectiles.Bolt;
	
	var effects = require('./effects.js');
	var Effect = effects.Effect;
	var Explosion = effects.Explosion;
	var Forcefield = effects.Forcefield;
	var Throttle = effects.Throttle;
	var Flash = effects.Flash;
	
	var ships = require('./ships.js');
	var Ship = ships.Ship;
	var Fighter = ships.Fighter;
	var Carrier = ships.Carrier;
	var Interceptor = ships.Interceptor;
	
	var celestials = require('./celestials.js');
	var Celestial = celestials.Celestial;
	var Sun = celestials.Sun;
	var Planet = celestials.Planet;
	var Moon = celestials.Moon;
	var Asteroid = celestials.Asteroid;
	
	function physics(objlist) {
		deletenonexistant(objlist);
		actmove(objlist);
		hitboxes(objlist);
		collide(objlist); //console.log('starting gravity..');
		//gravity(s, c); //console.log('gravity finished');
	}
	
	var G = 6.67 * 10 ** (-11);
	function gravity(ships, celestials) { //console.log('gravity');
		var A, a1, a2, r;
	
		var list = [];
		for(var i in ships) {
			list.push(ships[i]);
		} 
	
		for(var i in celestials) {
			list.push(celestials[i]); 
		} //console.log(list); return;		
		
		var o1, o2;
		for(var h = 0; h < list.length; h++) { //console.log(list[h]); return;
			for(var i in list[h].instances) { //console.log(list[h].instances[i]); return;
				o1 = list[h].instances[i]; //console.log(list[h].instances.length > 1 && i < list[h].instances.length - 1);
				//1) collide with all of this type except checked
				if(list[h].instances.length > 1 && i < list[h].instances.length - 1) {
					for(var j = Number(i) + 1; j < list[h].instances.length - 1; j++) { 
						o2 = list[h].instances[j]; //console.log(o2); return;
						r = v3.substract(o2.state.location(), o1.state.location());
						A = G / v3.vlength2(r) / 60; // 60 for 60FPS
						a1 = A * o2.mass; 
						a2 = A * o1.mass;
						r = v3.normalize(r);
						o1.state.velocity = v3.add(o1.state.velocity, v3.multiply(r, a1));
						o2.state.velocity = v3.add(o2.state.velocity, v3.multiply(v3.inverse(r), a2));					
					}
				}
				//2) collide with all of other types except checked
				for(var k = h + 1; k < list.length; k++) { //console.log(list[k]); return;
					for(var l = 0; l < list[k].instances.length; l++) {
						o2 = list[k].instances[l]; //console.log(o2); return;
						r = v3.substract(o2.state.location(), o1.state.location());
						A = G / v3.vlength2(r) / 60; // 60 for 60FPS
						a1 = A * o2.mass; //console.log('a1: ', a1);
						a2 = A * o1.mass; //console.log('a2: ', a2);
						r = v3.normalize(r);
						o1.state.velocity = v3.add(o1.state.velocity, v3.multiply(r, a1));
						o2.state.velocity = v3.add(o2.state.velocity, v3.multiply(v3.inverse(r), a2));
					}
				}
			}
		}
	}

	function deletenonexistant(objlist) {
		for(var h in objlist) { //console.log(objlist[h]);
			for(var i in objlist[h]) { //console.log(objlist[h][i]);
				for(var j = objlist[h][i].instances.length - 1; j >= 0; j--) { //console.log(objlist[h][i].instances[j]);
					if(objlist[h][i].instances[j].exists == false) {
						objlist[h][i].instances.splice(i, 1);
					}				
				}
			}
		}
	}

	function actmove(objlist) { //console.log(objlist);
		for(var h in objlist) { //p, s, e, c
			for(var i in objlist[h]) { //a kind of p, s, e, c
				for(var j in objlist[h][i].instances) { //console.log(o[i].instances[j]);
					move(objlist[h][i].instances[j]); //if(!isserver) {console.log(objlist[h][i].instances[j]);}
					objlist[h][i].instances[j].act(objlist); //console.log('ok');
				}
			}
		}
	}

	function hitboxes(objlist) {
		var objlist = {projectiles: objlist.projectiles, ships: objlist.ships, celestials: objlist.celestials};
		var tempHitbox = [];
		var o, tempObj;

		for(var h in objlist) { //p, s, e, c
			for(var i in objlist[h]) { //a kind of p, s, e, c
				for(var j in objlist[h][i].instances) { //console.log(o[i].instances[j]);
					o = objlist[h][i].instances[j];
					tempObj = {
						state: {
							matrix: o.state.matrix.slice(),
							velocity: o.state.velocity.slice(),
							rotation: o.state.rotation.slice(), //o[i].state.rotation !== undefined ? _ : undefined,
						},
					};
					move(tempObj);

					//console.log('tempState: ', tempState);
					//console.log('tempState + velocity: ', tempState);
					//console.log(o[i]);
					for(var j = 0; j < objlist[h][i].model.hitbox.length; j += 3) {
						tempHitbox = m4.m4v3(tempObj.state.matrix, objlist[h][i].model.hitbox.slice(j, j + 3)); //console.log(tempHitbox);
						o.currenthitbox[j] = tempHitbox[0];
						o.currenthitbox[j+1] = tempHitbox[1];
						o.currenthitbox[j+2] = tempHitbox[2]; //console.log(o.currenthitbox);
					}
				}
			}
		}
	}

	function collide(objlist) {
		var distance, measure, penetration;

		var p = [];
		for(var i in objlist.projectiles) {
			p.push(objlist.projectiles[i]);
		}

		var s = [];
		for(var i in objlist.ships) {
			s.push(objlist.ships[i]); //console.log(s);
		}

		var projectile, ship, celestial;
	//projectile <-> ship
		for(var h in p) { //console.log(p[h]);
			for(var i in p[h].instances) {
				projectile = p[h].instances[i]; //console.log(projectile);
				for(var j in s) {
					for(var k in s[j].instances) {
						ship = s[j].instances[k]; //console.log(ship);
						distance = v3.vlength2(v3.substract(projectile.state.location(), ship.state.location()));
						measure = p[h].model.radius2 + s[j].model.radius2; //console.log('distance, measure: ', distance, measure);
						if(distance < measure) {
							penetration = gjk3d(projectile, ship);
							if(penetration !== undefined) {
								projectile.onCollision(objlist, ship, penetration);
							}
						}
					}
				}
			}
		}
		
		for(var i in celestials) {
			s.push(celestials[i]); //console.log(s);
		}		
		
	//ship/celestial <-> ship/celestial
		var s1, s2, a;
		for(var h = 0; h < s.length; h++) { //console.log(s[h], s.length);
			for(var i in s[h].instances) { //console.log(s[h].instances[i]);
				s1 = s[h].instances[i]; //console.log(s[h].instances[i]);
				//1) collide with all of this type except checked
				if(s[h].instances.length > 1 && i < s[h].instances.length - 1) { //a = s[h].instances.length > 1 ? 1 : 0; console.log(a);
					for(var j = Number(i) + 1; j < s[h].instances.length - 1; j++) {
						s2 = s[h].instances[j]; //console.log('h: ', h, 'i: ', i, 'j: ', j, 's1, s2: ', s1, s2);
						/*
						s[h].instances.length: 5
						i:	j:
						0	1234
						1	234
						2	34
						3	4
						*/
						distance = v3.vlength2(v3.substract(s1.state.location(), s2.state.location())); //console.log('locations: ', s1.state.location(), s2.state.location());
						measure = s[h].model.radius2 * 2; //console.log('distance, measure: ', distance, measure);
						if(distance < measure) {
							penetration = gjk3d(s1, s2);
							if(penetration !== undefined) { //console.log(s1, s2);
								s1.onCollision(s2, penetration);
								s2.onCollision(s1, v3.inverse(penetration));
							}
						}
					}
				}
				//2) collide with all of other types except checked
				for(var k = h + 1; k < s.length; k++) { //console.log(s[k]);
					for(var l in s[k].instances) {
						s2 = s[k].instances[l]; //console.log(s2);
						distance = v3.vlength2(v3.substract(s1.state.location(), s2.state.location())); //console.log('locations: ', s1.state.location(), s2.state.location());
						measure = s[h].model.radius2 + s[k].model.radius2; //console.log('distance, measure: ', distance, measure);
						if(distance < measure) {
							penetration = gjk3d(s1, s2);
							if(penetration !== undefined) { //console.log(s1, s2);
								s1.onCollision(s2, penetration);
								s2.onCollision(s1, v3.inverse(penetration));
							}
						}
					}
				}
			}
		}
	}



	function move(o) {
		o.state.matrix[12] += o.state.velocity[0];
		o.state.matrix[13] += o.state.velocity[1];
		o.state.matrix[14] += o.state.velocity[2];

		o.state.matrix = m4.zRotate(o.state.matrix, o.state.rotation[2]); o.state.rotation[2] = 0;
		o.state.matrix = m4.xRotate(o.state.matrix, o.state.rotation[0]); o.state.rotation[0] = 0;
		o.state.matrix = m4.yRotate(o.state.matrix, o.state.rotation[1]); o.state.rotation[1] = 0;
	}

	function gjk3d(o1, o2) { //GJK collision detection linked with EPA for penetration vector
		var hitbox1 = o1.currenthitbox;
		var hitbox2 = o2.currenthitbox; //console.log('hitboxes: ',hitbox1, hitbox2);

		var c1 = o1.state.location();
		var c2 = o2.state.location(); //console.log('centres: ', c1, c2);

		var central = v3.substract(c2, c1);
		var up = [0,1,0];
		var simplex = [];

		var d1, d2, d3, d4, d;
		var p1, p2, p3, p4;
		var p2p1, p3p1;

		var p1p2, p1p3, p4p1, p4p2, p4p3;
		var n1, n2, n3, n4;

		var collision = false;
		var winding = 0;
		var loopCount = 0;

		while(loopCount++ < 33) { //console.log('gjk3d loop');
			switch(simplex.length) {
			case 0: 
				d1 = central;
				if(v3.vlength(d1) == 0) { console.log('centers overlap, d1=0: ', d1);
					return up;
				}
				d2 = v3.inverse(d1);
				p1 = v3.substract(furthest(hitbox1, d1), furthest(hitbox2, d2)); //console.log('d1, p1: ', d1, p1);
				if(v3.vlength(p1) == 0){ console.log('vertex collision, p1=0: ', p1);
					return central;
				}
				simplex.push(p1);
				break;

			case 1:
				p2 = v3.substract(furthest(hitbox1, d2), furthest(hitbox2, d1));
				if(v3.vlength(p2) == 0){ console.log('vertex collision, p2=0: ', p2);
					return central;
				} //console.log('d2, p2 ', d2, p2);
				if(v3.dot(p2, d2) > 0) {
					simplex.push(p2);
				} else { //console.log('no collision'); 
					return;
				}
				break;

			case 2:
				p2p1 = v3.substract(p1,p2);
				d3 = v3.normalize(v3.cross(v3.cross(p2p1, p1), p2p1));
				if(v3.vlength(d3) == 0) { console.log('edge collision, d3=0: ', d3); 
					return central;
				}
				p3 = v3.substract(furthest(hitbox1, d3), furthest(hitbox2, v3.inverse(d3))); //console.log('d3, p3 ', d3, p3);
				if(v3.vlength(p3) == 0){ console.log('vertex collision, p3=0: ', p3);
					return central;
				}	
				if(v3.dot(p3, d3) > 0) {
					simplex.push(p3);
				} else { //console.log('no collision'); 
					return;
				}	
				break;

			case 3:
				p3p1 = v3.substract(p1,p3);
				d4 = v3.normalize(v3.cross(p2p1, p3p1));
				if(v3.vlength(d4) == 0) {
					//console.log('edge collision, d4: ', d4); 
					//collision = true;
					return central;
				}

				d4 = v3.dot(d4, p3) < 0 ? d4 : v3.inverse(d4);

				p4 = v3.substract(furthest(hitbox1, d4), furthest(hitbox2, v3.inverse(d4)));
				if(v3.vlength(p4) == 0){ console.log('vertex collision, p4=0: ', p4);
					return central;
				}	
				//console.log('d4, p4 ', d4, p4);
				if(v3.dot(p4, d4) > 0) {
					simplex.push(p4);
				} else {
					//console.log('no collision'); 
					return;
				}
				break;

			case 4:
				p1p2 = v3.substract(simplex[1], simplex[0]);
				p1p3 = v3.substract(simplex[2], simplex[0]);
				p4p1 = v3.substract(simplex[0], simplex[3]);
				p4p2 = v3.substract(simplex[1], simplex[3]);
				p4p3 = v3.substract(simplex[2], simplex[3]);

				n4 = v3.normalize(v3.cross(p1p2, p1p3));

				winding = v3.dot(n4, simplex[3]);

				n1 = winding > 0 ? v3.normalize(v3.cross(p4p1, p4p2)) : v3.normalize(v3.cross(p4p2, p4p1));
				n2 = winding > 0 ? v3.normalize(v3.cross(p4p2, p4p3)) : v3.normalize(v3.cross(p4p3, p4p2));
				n3 = winding > 0 ? v3.normalize(v3.cross(p4p3, p4p1)) : v3.normalize(v3.cross(p4p1, p4p3));
				n4 = winding > 0 ? v3.inverse(n4) : n4; //console.log('n1, n2, n3: ', n1, n2, n3); //console.log('simplex[0,1,2,3]: ', simplex);

				if(v3.dot(n1, simplex[3]) < 0) {
					simplex.splice(2, 1); d = n1;
				} 
				else if(v3.dot(n2, simplex[3]) < 0) {
					simplex.splice(0, 1); d = n2;
				} 
				else if(v3.dot(n3, simplex[3]) < 0) {
					simplex.splice(1, 1); d = n3;
				} 
				else {
					collision = true;
				}

				if(collision) { //console.log('collision!'); //return collision;
					var penetration = epa3d([hitbox1, hitbox2],simplex,[n1, n2, n3, n4]);
					return penetration;
				} else {
					p4 = v3.substract(furthest(hitbox1, d), furthest(hitbox2, v3.inverse(d)));
					if(v3.dot(p4, d) > 0) {// || -v3.dot(v3.normalize(p4), v3.normalize(d)) < .0) { // strange edge cases
						simplex.push(p4);
					} else {
						return;
					} 
				}
				break;
			}
		}
	}

	function furthest(hitbox, d) {		
		var furthest = 0;
		var max = Number.NEGATIVE_INFINITY;
		var temp = 0;
		for(var i = 0; i < hitbox.length; i += 3) {
			temp = v3.dot(hitbox.slice(i, i + 3), d);
			if(temp > max) {max = temp; furthest = i;}
		}		

		return hitbox.slice(furthest, furthest + 3);
	}

	function epa3d(hitboxes, simplex, normals) {

		var tolerance = 20;
		var loopCount = 0;
		var faces = [];

		var l = [];
		var n = [];
		var p = [];

		var dx, px, lx;
		var pxpa, pxpb, pxpc;
		var n1, n2, n3;
		var l1, l2, l3;

		var winding;
		var measure;
		var penetration;

		//get points from simplex and normalized normals from normals
		for(var i = 0; i < simplex.length; i++) {
			p.push(simplex[i].slice());
			n.push(v3.normalize(normals[i].slice()));
		}

		//get distance to origin for each face		
		l.push(v3.dot(p[3], n[0]));
		l.push(v3.dot(p[3], n[1]));
		l.push(v3.dot(p[3], n[2]));
		l.push(v3.dot(p[0], n[3]));

		//form faces array
		faces = [
			{vertices: [p[0], p[1], p[3]], normal: n[0], distance: l[0],},
			{vertices: [p[1], p[2], p[3]], normal: n[1], distance: l[1],},
			{vertices: [p[2], p[0], p[3]], normal: n[2], distance: l[2],},
			{vertices: [p[0], p[2], p[1]], normal: n[3], distance: l[3],},
		];

		while(loopCount++ < 33) {
			faces.sort(function(f1, f2) {return f1.distance - f2.distance;}); //sort faces by distance to origin

			dx = faces[0].normal; //get the face closest to the origin and check if there are any simplex points in that direction
			lx = faces[0].distance;
			px = v3.substract(furthest(hitboxes[0], dx), furthest(hitboxes[1], v3.inverse(dx)));

			if(v3.dot(v3.substract(px, faces[0].vertices[0]), dx) < tolerance) { //if none (or in tolerance margin), get this normal * distance as penetration, else check other faces //console.log(measure);
				penetration = v3.multiply(dx, lx); //console.log(penetration); //console.log(loopCount);
				return penetration;
			} else {			
				pxpa = v3.substract(px, faces[0].vertices[0]);
				pxpb = v3.substract(px, faces[0].vertices[1]);
				pxpc = v3.substract(px, faces[0].vertices[2]);

				n1 = v3.normalize(v3.cross(pxpb, pxpa));
				winding = v3.dot(n1, px);

				n1 = winding > 0 ? n1 : v3.inverse(n1);
				l1 = v3.dot(px, v3.normalize(n1));

				faces.push({
					vertices: [px, faces[0].vertices[0], faces[0].vertices[1],],
					normal: n1,	
					distance: l1,
				});

				n2 = winding > 0 ? v3.normalize(v3.cross(pxpc, pxpb)) : v3.normalize(v3.cross(pxpb, pxpc));
				l2 = v3.dot(px, v3.normalize(n2));

				faces.push({
					vertices: [px, faces[0].vertices[1], faces[0].vertices[2],], 
					normal: n2,	
					distance: l2,
				});

				n3 = winding > 0 ? v3.normalize(v3.cross(pxpa, pxpc)) : v3.normalize(v3.cross(pxpc, pxpa));
				l3 = v3.dot(px, v3.normalize(n3));

				faces.push({
						vertices: [px, faces[0].vertices[2], faces[0].vertices[0],], 
						normal: n3,	
						distance: l3,
				});

				faces.shift(); //console.log(faces);
			}			
		} //console.log(loopCount);
		return penetration;
	}
	
	module.exports = physics;