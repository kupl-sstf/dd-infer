#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const file = process.argv[2];
const total = process.argv.length > 2? +process.argv[3]: 0;

if (!fs.existsSync(file)) {
	console.error('unknown file: ', file);
	process.exit(1);
}

/** progress bars */
let progress = 0;
let iprogress = 0;
let start_time = Date.now();
const barsize = 40;
function show_progress() {
	iprogress = (progress / total * 100).toFixed(1);
	let elapsed = ((Date.now() - start_time)/1000) >>> 0;
	let size = (barsize * iprogress / 100) >>> 0
	let bar = "[" + "=".repeat(size) + " ".repeat(barsize-size) + "]";
	
	process.stderr.write('\033[0G');
	process.stderr.write(bar);
	process.stderr.write(": "+iprogress+ "% " + elapsed + " sec  ");
}

let timerID = setInterval(show_progress, 1000);
show_progress();

/** main */
let o = undefined;
const err = [];
function load() {
	const rl = readline.createInterface({input: fs.createReadStream(file), terminal: false});
	rl.on('line', (line) => {
		progress++;
		const x = line.split("  ");
		if (x[1] === '1') {
			o = x[0];
			console.log(line);
		} else if (x[1] === '-1') {
			if (x[0] === o) return;
			o = undefined;
			console.log(line);
		} else {
			err[err.length] = x;
		}
	});
	rl.on('close', done);
}
load();

function done() {
	clearInterval(timerID);
	show_progress();
	console.error("");
	if (err.length > 0) {
		console.error("unknown elements: ", err);
	}
}

