#!/usr/bin/env node

const fs = require('fs');
const name = process.argv[2];
const raw = fs.readFileSync(name);
const json = JSON.parse(raw);

console.log(json.length);
