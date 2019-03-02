const pug = require('pug');
const path = require('path');
const fs = require('fs');

const src = path.resolve(__dirname, '../src');
const build = path.resolve(__dirname, '../build');

const data = require(`${src}/data.json`);
const compile = pug.compileFile(`${src}/index.html`, {pretty: true});

console.log('Compiling Files.');
const projects = compile(data);

if (!fs.existsSync(build)){
  console.log('Making build directory.');
  fs.mkdirSync(build);
}

console.log('Writing file.');
fs.writeFileSync(`${build}/index.html`, projects);

