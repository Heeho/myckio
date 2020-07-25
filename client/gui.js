'use strict';
	var gui = {
		hp: {
			model: guimodels.hp,
		},
		sp: {
			model: guimodels.sp,
		},
		en: {
			model: guimodels.en,
		},
		mouse: {
			model: guimodels.mouse,
		},
	}
	
	var guimodels = {
		mouse: {
			size: 1,
			nodes: [0,0,0,1,0,1,0,0,1,1,0,0],
			indices: [0,1,2,0,3,1],
			texcoords: [0,0,0,0,0,0,0,0],	
		},
		hp: {
			size: 1,
			nodes: [0,0,0,1,0,1,0,0,1,1,0,0],
			indices: [0,1,2,0,3,1],
			texcoords: [0,0,0,0,0,0,0,0],				
		},
		sp: {
			size: 1,
			nodes: [0,0,0,1,0,1,0,0,1,1,0,0],
			indices: [0,1,2,0,3,1],
			texcoords: [1,0,1,0,1,0,1,0],				
		},
		en: {
			size: 1,
			nodes: [0,0,0,1,0,1,0,0,1,1,0,0],
			indices: [0,1,2,0,3,1],
			texcoords: [.5,.5,.5,.5,.5,.5,.5,.5],				
		},
	}