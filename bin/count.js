#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');

process.argv.shift();
process.argv.shift();

const name = process.argv[0];
let outname = undefined;
if (process.argv[1] === '-o')
	outname = process.argv[2];

var appendOut;
var closeStream;
if (outname === undefined) {
	appendOut = (text) => console.log(text);
	closeStream = () => {};
} else {
	let outStream = fs.createWriteStream(outname);
	appendOut = (text) => { outStream.write(text); outStream.write('\n'); };
	closeStream = () => outStream.end();
}
if (name !== undefined) {
	const rl = readline.createInterface({input: fs.createReadStream(name), terminal: false});
	let block = "";
	let mode = 0;
	rl.on('line', d => {
		if (mode === 0 && d[0] === '{' && d[2] === '{') {
			mode = 1;
			block += d;
		} else if (mode === 1 && d[0] === ' ' && d[1] === '}') {
			mode = 0;
			block += d;
			appendOut(block);
			block = "";
		} else {
			block += d;
		}
	});
	rl.on('close', () => {
		closeStream();
	});
}

