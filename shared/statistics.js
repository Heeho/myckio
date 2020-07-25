'use strict';
	var isserver = typeof window == 'undefined';

	var statistics = [
		0,
		0,
	];
	
	function score(string) {
		statistics[1] /= 1000;
		//localStorage.setItem('header', string);
		//localStorage.setItem('kills', statistics[0]);
		//localStorage.setItem('time', statistics[1]);
		//localStorage.setItem('kps', statistics[0] / statistics[1]); //window.alert(localStorage.getItem('time'));
		window.location.replace('./score.html');
	};
	
	if(isserver) {
		module.exports.statistics = statistics;
		module.exports.score = score;
	}