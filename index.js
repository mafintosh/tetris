#!/usr/bin/env node

var clivas = require('clivas');
var keypress = require('keypress');

var WIDTH = 15;
var HEIGHT = 20;

clivas.alias('box-color', 'inverse+cyan');
clivas.alias('full-width', 2*WIDTH+4);
clivas.flush(false);
clivas.cursor(false);

'black white blue yellow green magenta'.split(' ').forEach(function(color, i) {
	clivas.alias('color-'+i, '2+inverse+'+color);
});

var NUMBERS = [
	[
		'xxx',
		'x x',
		'x x',
		'x x',
		'xxx'
	],[
		'  x',
		'  x',
		'  x',
		'  x',
		'  x'
	],[
		'xxx',
		'  x',
		'xxx',
		'x  ',
		'xxx'
	],[
		'xxx',
		'  x',
		'xxx',
		'  x',
		'xxx'
	],[
		'x x',
		'x x',
		'xxx',
		'  x',
		'  x'
	],[
		'xxx',
		'x  ',
		'xxx',
		'  x',
		'xxx'
	],[
		'xxx',
		'x  ',
		'xxx',
		'x x',
		'xxx'
	],[
		'xxx',
		'  x',
		'  x',
		'  x',
		'  x'
	],[
		'xxx',
		'x x',
		'xxx',
		'x x',
		'xxx'
	],[
		'xxx',
		'x x',
		'xxx',
		'  x',
		'  x'
	]
];
var FIGURES = [
	[
		[0,1,0],
		[0,1,0],
		[1,1,0]
	],[
		[false,1,0],
		[false,1,0],
		[false,1,1]
	],[
		[1,1,0],
		[0,1,1],
		[0,0,0]
	],[
		[0,1,1],
		[1,1,0],
		[0,0,0]
	],[
		[0,0,0,0],
		[1,1,1,1],
		[0,0,0,0],
		[0,0,0,0]
	],[
		[1,1],
		[1,1]
	],[
		[0,1,0],
		[1,1,1],
		[0,0,0]
	]
];

var nextFigure = (Math.random()*FIGURES.length)|0;
var nextColor = 1+((Math.random()*5)|0);

var selectFigure = function() {
	figure = FIGURES[nextFigure];
	nextFigure = (Math.random()*FIGURES.length)|0;
	for (var i = 0; i < figure.length; i++) {
		for (var j = 0; j < figure.length; j++) {
			figure[i][j] = figure[i][j] && nextColor;
		}
	}
	nextColor = 1+((Math.random()*5)|0);
	y = -figure.length;
	x = ((WIDTH / 2) - (figure.length / 2)) | 0;

	var btm = figure.length-1;

	while (allEmpty(figure[btm])) {
		y++;
		btm--;
	}
};
var getScore = function() {
	var color = 1+(((score / 100)|0)%5);

	return ('00000'.substring(score.toString().length)+score.toString()).split('').map(function(d) {
		var num = NUMBERS[d];
		return num;
	}).reduce(function(result, value) {
		value.forEach(function(line, i) {
			result[i] = (result[i] ? result[i] + ' ' : '');
			result[i] += ' '+line.replace(/x/g, '{2+color-'+color+'}').replace(/ /g, '  ');
		});
		return result;
	}, []);
};

var board = [];
var x = 0;
var y = 0;
var figure;
var score = 0;

for (var i = 0; i < HEIGHT; i++) {
	board[i] = [];
	for (var j = 0; j < WIDTH; j++) {
		board[i][j] = 0;
	}
}

var rotateFigureMutation = function(dir) {
	var result = [];
	for (var i = 0; i < figure.length; i++) {
		for (var j = 0; j < figure[i].length; j++) {
			var y = dir === 1 ? j : figure.length-j-1;
			var x = dir === 1 ? figure.length-1-i : i;
			result[y] = result[y] || [];
			result[y][x] = figure[i][j];
		}
	}
	figure = result;
};
var addFigureMutation = function(draw) {
	for (var i = 0; i < figure.length; i++) {
		for (var j = 0; j < figure[i].length; j++) {
			var py = y+i;
			var px = x+j;
			if (figure[i][j] && (px < 0 || px >= WIDTH)) return false;
			if (py < 0) continue;
			if (!figure[i][j]) continue;
			if (!board[py] || board[py][px] || board[py][px] === undefined) return false;
			if (!draw) continue;
			board[py][px] = figure[i][j] || board[py][px];
		}
	}
	return draw ? true : addFigureMutation(true);
};
var removeFigureMutation = function() {
	for (var i = 0; i < figure.length; i++) {
		for (var j = 0; j < figure[i].length; j++) {
			var py = y+i;
			var px = x+j;
			if (px < 0) continue;
			if (!figure[i][j] || !board[py] || board[py][px] === undefined) continue;
			board[py][px] = 0;
		}
	}
};

var line = function() {
	var arr = [];
	for (var i = 0; i < WIDTH; i++) {
		arr[i] = 0;
	}
	return arr;
};
var allEmpty = function(arr) {
	return !arr.some(function(val) {
		return val;
	});
};
var hasEmpty = function(arr) {
	return arr.some(function(val) {
		return !val;
	});
};
var moveFigure = function(dx,dy) {
	removeFigureMutation();
	x += dx;
	y += dy;
	if (addFigureMutation()) return draw();
	x -= dx;
	y -= dy;
	addFigureMutation();
	draw();
};
var rotateFigure = function(dir) {
	removeFigureMutation();
	rotateFigureMutation(dir);
	if (addFigureMutation()) return draw();
	rotateFigureMutation(-dir);
	addFigureMutation();
};
var removeLines = function() {
	var modifier = 0;
	for (var i = 0; i < board.length; i++) {
		if (hasEmpty(board[i])) continue;
		board.splice(i,1);
		board.unshift(line());
		if (!modifier) {
			modifier += 150;
		}
		modifier *= 2;
		speed += 10;
	}
	score += modifier;
};

var draw = function() {
	clivas.clear();

	var scoreDraw = getScore();

	clivas.line('');
	clivas.line(' {full-width+box-color}');

	for (var i = 0; i < HEIGHT; i++) {
		var line = '{color-'+board[i].join('}{color-')+'}';
		var padding = '              ';

		if (i > 3 && scoreDraw[i-4]) {
			padding = '  '+scoreDraw[i-4];
		}
		if (i > 10 && FIGURES[nextFigure][i-11]) {
			padding = '   '+FIGURES[nextFigure][i-11].join('').replace(/false/g, '').replace(/0/g, '  ').replace(/[1-9]/g, '{2+color-'+nextColor+'}')+'    ';
		}

		clivas.line(' {2+box-color}'+line+'{2+box-color}'+padding);
	}

	clivas.line(' {full-width+box-color}   {green:tetris} {bold:'+require('./package.json').version+'} {green:by} {bold:@mafintosh}');
	clivas.line('');
	return true;
};

var loop = function() {
	if (moveFigure(0,1)) return setTimeout(loop, speed);
	removeLines();
	if (y < 0) {
		clivas.alias('box-color', 'inverse+red');
		draw();
		process.exit(0);
		return;
	}
	selectFigure();
	setTimeout(loop, speed);
};

var speed = 600;

setInterval(function() {
	speed -= 20;
	speed = Math.max(speed, 50);
}, 10000);

setTimeout(loop, speed);

selectFigure();
addFigureMutation();
draw();

keypress(process.stdin);

process.stdin.on('keypress', function(ch, key) {
	if (key.name === 'c' && key.ctrl) return process.exit(0);
	if (key.name === 'right' || key.name === 'l') {
		moveFigure(1, 0);
	}
	if (key.name === 'left' || key.name === 'h') {
		moveFigure(-1, 0);
	}
	if (key.name === 'down' || key.name === 'j') {
		if (moveFigure(0, 1)) {
			score++;
		}
	}
	if (key.name === 'up' || key.name === 'k') {
		rotateFigure(1);
	}
	if (key.name === 'space' || (key.name === 'g' && key.shift)) {
		while (moveFigure(0, 1)) {
			score++;
		}
	}
});
process.stdin.resume();

try {
	process.stdin.setRawMode(true);
} catch (err) {
	require('tty').setRawMode(true);
}
