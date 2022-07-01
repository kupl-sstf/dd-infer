#!/usr/bin/env node

const fs = require('fs');
const fmt = require('./formating.js');
const pp = require("json-beautify");

const table = {};

const set = new Set();

function hash(obj) {
	return JSON.stringify(obj);
}

let name;
let md_mode = false;
const index = process.argv[2];
const sig = process.argv[3];

for (let i=4; i<process.argv.length; i++) {
	let filename = process.argv[i];
	if (filename.startsWith("-")) {
		if (filename === '-md') md_mode = true;
		continue;
	}
	let txt = filename.replace('.json', '').replace(/.*\//, '').split('_');
	name = `${txt[0]}`;
	let k = +txt[1];
	let raw = ""
	try {
		raw = fs.readFileSync(filename);
	} catch {
		process.exit(1);
	}
	const json = JSON.parse(raw);
	const items = new Set();
	for (let j=0; j<json.length; j++) {
		const uid = hash(json[j]);
		set.add(uid);
		items.add(uid);
	}
	table[k] = items;
}

const keys = Object.keys(table).sort((a,b) => a-b);

// simple two-pass algorithm for standard deviation.
let sum = 0;
let N = keys.length;
for (let i=0; i < N; i++) {
	sum += table[keys[i]].size;
}
let m = sum / N;
sum = 0;
for (let i=0; i < N; i++) {
	sum += Math.pow(table[keys[i]].size - m, 2);
}
let V = sum / N;
let sigma = Math.sqrt(V,2);

// 
if (set.size >= index && sigma > sig) process.exit(0);
else process.exit(1);
