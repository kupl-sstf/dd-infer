"use strict";

function alignLeft(s, size) {
	s = ""+s;
	let len = Math.max(0,size - s.length);
	return s + " ".repeat(len);
}
function alignRight(s, size) {
	s = ""+s;
	let len = Math.max(0,size - s.length);
	return " ".repeat(len) + s;
}
function alignCenter(s, size) {
	s = ""+s;
	let len = Math.max(0,size - s.length);
	let start = " ".repeat(Math.floor(len))
	let end = " ".repeat(Math.ceil(len))
	return start + s + end;
}

module.exports = { alignLeft, alignCenter, alignRight };

