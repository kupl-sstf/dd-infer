#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const fmt = require('./formating.js');

let sortby = 0;
let stats = false;
let group_mode = false;
process.argv.shift();
process.argv.shift();
while (typeof process.argv[0] === 'string' && process.argv[0].startsWith("-")) {
	if (process.argv[0] === '-s') {
		let s = process.argv[1];
		if (s === 'name') sortby = 1;
		else sortby = 0; // number of alarms
		
		process.argv.shift();
		process.argv.shift();
	} else if (process.argv[0] === '-t') {
		stats = true;
		process.argv.shift();
	} else if (process.argv[0] === '-g') {
		group_mode = true;
		process.argv.shift();
	}
}
let hash;
if (group_mode) {
	hash = function (obj) {
		if (obj.bug_type === "STACK_VARIABLE_ADDRESS_ESCAPE") {
			obj = { bug_type: obj.bug_type,
				trace: obj.bug_trace[0] };
		} else {
			obj = { bug_type: obj.bug_type,
				trace: obj.bug_trace[1].description };
		}
		return JSON.stringify(obj);
	}
} else {
	hash = function (obj) {
		return JSON.stringify(obj);
	}
}

const name = process.argv[0];
let reports = process.argv[1];
if (reports === undefined) reports = './reports';

let sloc = null;
if (name !== undefined) {
	const raw = fs.readFileSync(name).toString();
	const lines = raw.split("\n");
	sloc = {};
	for (let i=0; i<lines.length; i++) {
		let d = lines[i].split(" ");
		if (d[0] === '') continue;
		let loc = d[1];
		if (loc === "err") {
			loc = NaN;
		}
		sloc[d[0]] = loc;
	}
}

const ri = readline.createInterface({
    input: process.stdin,
    output: null,
    console: false
});

const tbl = {};
function parse_line(line) {
	const rtn = [];
	let token = "", s = 0;;
	for (let i=0; i<line.length; i++) {
		if (s === 0) {
			if (line[i] === " ") {
				if (token !== "") rtn[rtn.length] = token;
				token = "";
				continue;
			}
			if (line[i] === '"') {
				s = 1;
				continue;
			}
		} else if (s === 1) {
			if (line[i] === '\\') {
				s = 2;
				continue;
			}
			if (line[i] === '"') {
				if (token !== "") rtn[rtn.length] = token;
				token = "";
				s = 0;
				continue;
			}
		} else if (s === 2) {
			s = 1;
		}
		token += line[i];
	}
	if (token !== "") rtn[rtn.length] = token;
	return rtn;
}

ri.on('line', function(line) {
	const o = parse_line(line);
	try {
		if (!(o[0] in tbl)) tbl[o[0]] = {};
		tbl[o[0]][o[1]] = {time: o[2], alarm: o[3]};
	} catch (e) {
		console.error(`Failed to parse: ${line}`);
	}
});

const alignMap = {'left': fmt.alignLeft, 'right': fmt.alignRight, 'center': fmt.alignCenter};
function markdown(o) {
	let cols = o.cols;
	o = o.data;
	// rows
	const head = [{name: "Program"}];
	for (let i=0; i<cols.length; i++) {
		head[head.length] = {name: cols[i], align: "right"};
	}

	// pre-process
	// 1. link
	for (let i=0; i<o.length; i++) {
		let link;
		if (group_mode) {
			link = `${reports}/${o[i][0]}.g.txt`;
		} else {
			link = `${reports}/${o[i][0]}.txt`;
		}
		o[i][0] = `[${o[i][0]}](${link})`;
	}
	// 2. no result yet.
	for (let i=0; i<o.length; i++) {
		for (let j=0; j<head.length; j++) {
			if (o[i][j] === undefined) o[i][j] = 'Yet.';
		}
	}

	// calculate the column size
	for (let i=0; i<o.length; i++) {
		for (let j=0; j<head.length; j++) {
			let len = (""+o[i][j]).length;
			head[j].length = Math.max(head[j].length || head[j].name.length, len);
		}
	}

	// head
	let row;
	row = [];
	for (let i=0; i<head.length; i++) {
		row[i] = fmt.alignLeft(head[i].name, head[i].length);
	}
	console.log("|", row.join(" | "), "|");
	// hl
	row = [];
	let alignstr;
	for (let i=0; i<head.length; i++) {
		alignstr = head[i].align;
		if (alignstr === 'left') {
			row[i] = ':-' + '-'.repeat(head[i].length - 2);
		} else if (alignstr === 'right') {
			row[i] = '-'.repeat(head[i].length - 2) + '-:';
		} else if (alignstr === 'center') {
			row[i] = ':' + '-'.repeat(head[i].length - 2) + ':';
		} else {
			row[i] = '-'.repeat(head[i].length);
		}
	}
	console.log("|", row.join(" | "), "|");

	// body
	let align;
	for (let i=0; i<o.length; i++) {
		row = [];
		for (let j=0; j<head.length; j++) {
			align = alignMap[head[j].align || 'left'];
			row[j] = align(o[i][j], head[j].length);
		}
		console.log("|", row.join(" | "), "|");
	}
}

function transform(tbl) {
	/* { col1: { col2: { time: col3, alarm: col4 }}, ... } */
	/* { data: [[col1, col3 (col4)], ...], cols: col2 } */
	/* { stats: { col2: { time: total#, alarm: total#, count: cnt# }, ... } }*/
	const cols = [], statistics = {};
	let total_alarms = 0, total_entries = 0, total_time = 0;
	if (sloc !== null) cols[0] = "LOC"
	const data = [];
	const alarm_map = {};
	const time_map = {};
	for (let col1 in tbl) {
		let i = data.findIndex(x => x[0] === col1);
		if (i < 0) data[i = data.length] = [col1];
		if (sloc !== null) {
			data[i][1] = sloc[col1];
		}
		for (let col2 in tbl[col1]) {
			if (statistics[col2] === undefined)
				statistics[col2] = {time: 0, alarm: 0, count: 0};
			let stat = statistics[col2];
			let o = tbl[col1][col2];
			let j = cols.indexOf(col2);
			if (j < 0) cols[j = cols.length] = col2;
			let col3 = o.time;
			let col4 = o.alarm;
			let t = +col3;
			let a = +col4;
			if (!isNaN(t) && !isNaN(a)) {
				stat.time += t;
				stat.alarm += a;
				stat.count++;
				total_time += t;
				total_alarms += a;
				total_entries ++;
			}
			if (!(col1 in alarm_map)) alarm_map[col1] = 0;
			if (!(col1 in time_map)) time_map[col1] = 0;
			alarm_map[col1] += +col4;
			time_map[col1] += +col3;
			data[i][j+1] = `${fmt.alignRight(col3, 6)} ${fmt.alignRight('('+col4+')', 7)}`;
		}
	}
	if (sortby === 0)
		data.sort((x,y) => time_map[y[0]] - time_map[x[0]]);
	else if (sortby === 1)
		data.sort((x,y) => y[0] < x[0]? 1:y[0] > x[0]? -1 : 0);

	return {data, cols, statistics, total_entries, total_time, total_alarms};
}
ri.on('close', function() {
	let obj = transform(tbl);
	/* stats */
	if (stats) {
		let x = obj.statistics;
		let elems = Object.keys(x);
		elems.sort((x,y) => {
			let xx = x.split(" ")[2];
			let yy = y.split(" ")[2];
			return xx-yy;
		});
		console.log(` * Analysis time statistics (Total ${obj.total_time} seconds from ${obj.total_entries} results)`);
		for (let i=0; i<elems.length; i++) {
			let elem = elems[i];
			console.log(`	* ${elem}: ${x[elem].time} (avg. ${(x[elem].time / x[elem].count).toFixed(1)}} (from ${x[elem].count} results)`);
		}
		console.log("");
	}
	markdown(obj);
});
