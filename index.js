const http = require('http');
const lineReader = require('line-reader');
const fs = require('fs-extra')
const { fileReader, fileWriter } = require('./testo.js');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

fileReader('testing.txt', processFile, async () => {
	fileWriter('schema.sql', genSql());
	console.log('Finished writing schema!')
	console.log('Importing database from schema...')
	await exec('mysql -u root -p < schema.sql');
	console.log('Finished importing schema!')
});

let database,
	tables = [];

function processFile(line) {
	if(line.trim() == '') return;
	if(line[0] == '$') {
		database = line.slice(1, line.length)
		return;
	}

	// table field
	if(line[0] == '-') {
		tables.length > 0 && tables[tables.length-1].fields.push(line.slice(1, line.length).trim());
		return;
	}

	// table backend controller
	if(line[0] == '@') {
		tables.length > 0 && tables[tables.length-1].controller.push(line.slice(1, line.length).trim());
		return;
	}

	// table dashboard route
	if(line[0] == '$') {
		tables.length > 0 && tables[tables.length-1].dashboard.push(line.slice(1, line.length).trim());
		return;
	}

	// foreign key
	if(line[0] == '#') {
		tables.length > 0 && tables[tables.length-1].foriegnKeys.push(line.slice(1, line.length).trim());
		return;
	}	

	// create table
	tables.push({
		name: line.trim(),
		fields: [], //-
		controller: '', //@
		dashboard: '', //$
		foriegnKeys: [] //#
	});
}

function genSql() {
	let sql;

	sql = `CREATE DATABASE IF NOT EXISTS ${database}; \nUSE ${database};\n\n`;

	tables.forEach(table => {
		let fieldStr = `${table.name}_id INT NOT NULL AUTO_INCREMENT,\n`;
		table.fields.forEach(field => {
			let fieldProps = field.split(' '),
				type = fieldType(fieldProps[1]),
				nullable = fieldProps.length <= 2 ? 'NOT NULL' : 'NULL';

			fieldStr += `\t${fieldProps[0]} ${type} ${nullable},\n`;
		});

		fieldStr += `\tdeleted BOOLEAN DEFAULT 0,\n`;
		fieldStr += `\tPRIMARY KEY (${table.name}_id)`;

		sql += `CREATE TABLE IF NOT EXISTS ${table.name} (\n\t${fieldStr}\n);\n\n`;
	});

	// add foreign keys only when all tables have been created
	tables.forEach(table => {
		table.foriegnKeys.forEach(fk => {
			let names = fk.match(/name[:]\s?(\w+\s*\w*)/),
				onDelete = fk.match(/delete[:]\s?(\w+)/),
				onUpdate = fk.match(/update[:]\s(\w+)/);

			if(names !== null) names = names[1].split(' ');
			let name = names[0],
				type = names[1];

			if(onDelete !== null) onDelete = onDelete[1].toUpperCase();
			if(onUpdate !== null) onUpdate = onUpdate[1].toUpperCase();

			sql += `ALTER TABLE ${table.name} ADD ${name} ${fieldType(type)} NOT NULL AFTER ${table.name}_id, ADD INDEX (${name});`;
			sql += `
				ALTER TABLE ${table.name} 
				ADD CONSTRAINT fk_${table.name}_${name}
				FOREIGN KEY (${name})
				REFERENCES ${name} (${name}_id)
				ON DELETE ${onDelete}
				ON UPDATE ${onUpdate};
			`;
		});

		
	})

	// implementation for generation of backend routes
	// if a single table is found to have a controller
	if(tables.find(table => table.controller != '').length > 0) {
		// begin by Cloning the Backend Template Folder
		fs.copy('../backend-template', './server')
		  .then(() => console.log('success!'))
		  .catch(err => console.error(err))
	}

	tables.forEach(table => {

	});

	return sql;
}

function fieldType(type) {
	if(/s\d+/.test(type) === true) {
		let count = type.match(/\d+/);

		return `VARCHAR (${count})`;
	}

	if(type == 'i') return 'INTEGER';
	if(type == 'b')	return 'BOOLEAN';
	if(type == 'time') return 'TIMESTAMP';
	if(type == 'date') return 'DATE';
	if(type == 'dt') return 'DATETIME';

	if(/c\d+/.test(type) === true) {
		let count = type.match(/\d+/);

		return `CHAR (${count})`;
	}

	if(/f\d+,\d+/.test(type)) {
		// let values = type.match(/\d+/g); // extract number values
		return `FLOAT(${type.slice(1, type.length)})`;
	}

	if(/d\d+,\d+/.test(type)) {
		// let values = type.match(/\d+/g); // extract number values
		return `DECIMAL(${type.slice(1, type.length)})`;
	}

	if(type == 'e')  {
		return `ENUM(${type.slice(1, type.length)})`;
	}

	return type.toUpperCase();
}