#!/usr/bin/env node

const fs = require('fs');
const pp = require("json-beautify");

const reports = {};
const table = {};
let group_mode = false;

const files = [];
for (let i=2; i<process.argv.length; i++) {
	let filename = process.argv[i];
	if (filename === '-g') {
		group_mode = true;
		continue;
	}
	files.push(filename);
}
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

const stat = {};
for (let i=0; i<files.length; i++) {
	let filename = files[i];
	let txt = filename.replace('.json', '').replace(/.*\//, '').split('_');
	// txt[0]: name, [1]: k, [2]: ML (optional)
	if (table[txt[1]] === undefined) {
		table[txt[1]] = {};
		stat[txt[1]] = 0;
	}
	stat[txt[1]]++;
	const raw = fs.readFileSync(filename);
	const json = JSON.parse(raw);
	for (let j=0; j<json.length; j++) {
		const uid = hash(json[j]);
		let bt = json[j].bug_type;
		if (bt === undefined) continue;
		if (reports[bt] === undefined) {
			reports[bt] = {};
		}
		reports[bt][uid] = true;
		table[txt[1]][uid] = true;
	}
}

const ks = Object.keys(table);
ks.sort((x,y) => (+x) - (+y));

if (Object.keys(reports).length > 0) {
	if (group_mode) {
		console.log(" * Alarm stats (by group):");
	} else {
		console.log(" * Alarm stats:");
	}
	console.log("	* For each kind:");
	for (let i in reports) {
		console.log(`		- ${i} : ${Object.keys(reports[i]).length}`);
	}
	console.log("	* For each `k`:");
	for (let i in ks) {
		let k = ks[i];
		let cnt = stat[k];
		let c = Object.keys(table[k]).length;
		console.log(`		- k = ${k}: ${c} (avg ${(c/cnt).toFixed(1)}) (from ${cnt} results)`);
	}
	
}
