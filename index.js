const http = require('http');
const lineReader = require('line-reader');
const fs = require('fs-extra')
const { fileReader, fileWriter } = require('./testo.js');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const prependFile = require('prepend-file');

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
		const folder = `./${database}/server`;
		fs.copySync('../backend-template', folder)

		tables.filter(table => table.controller != '').forEach(table => {
			// then 
			fs.copySync('./templates/backend/route.js', folder + '/routes/' + table.name); // create the route file

			fs.ensureDirSync(folder + '/routes/' + table.name); // create props folder
			fileWriter(folder + '/routes/' + table.name + '/createProps.js', 'export default "' + table.fields + '"')
			fileWriter(folder + '/routes/' + table.name + '/udpateProps.js', 'export default "' + table.fields + '"')
		});
	}

	// implementation for generation of dashboard pages
	// if a single table is found to have a controller
	if(tables.find(table => table.dashboard != '').length > 0) {
		// begin by Cloning the Dashboard Template Folder
		const folder = `./${database}/server/client`;
		fs.copySync('../dashboard-template', folder)

		tables.filter(table => table.dashboard != '').forEach(table => {
			let path = folder + '/src/pages/' + table.name;
			// fs.ensureDirSync(path); // create props folder
			fs.ensureDirSync(path + '/includes'); // create both page and includes folder

			// then 
			fs.copySync('./templates/dashboard/List.js', path + '/List.js');
			fs.copySync('./templates/dashboard/Edit.js', path + '/Edit.js');
			fs.copySync('./templates/dashboard/Details.js', path + '/Details.js');
			fs.copySync('./templates/dashboard/New.js', path + '/New.js');

			let fieldProps1 = table.fields[0].split(' ');
			let fieldProps2 = table.fields[1].split(' ');
			
			// List Page
			fs.writeJsonSync(path + '/includes/List.js', {
				 Path: '/',
				 Title: table.name,
				 Table: table.name,
				 Columns: [
					{
						title: fieldProps1,
						dataIndex: fieldProps1.toLowerCase(),
						key: fieldProps1.toLowerCase()
					},
					{
						title: fieldProps2,
						dataIndex: fieldProps2.toLowerCase(),
						key: fieldProps2.toLowerCase()
					}
				]
			});

			let columns = []
			table.fields.forEach(field => {
				let fieldProps = field.split(' '),
					name = fieldProps[0],
					type = fieldType(fieldProps[1]),
					nullable = fieldProps.length <= 2 ? 'NOT NULL' : 'NULL';

				columns.push({
					name: name,
					type: inferType(name, type),
					rules: inferRules(name, nullable)
				})
			})

			/*string s, integer i, boolean b, tel (phone, tel), text, select, 
			password (password), table, tabs, date, reset_password*/

			// Edit Page
			fs.writeJsonSync(path + '/includes/Edit.js', {
				Title: `Edit ${table.name.toUpperCaseFirst()}`,
				Table: table.name,
				Fields: columns
			});

			fs.writeJsonSync(path + '/includes/Details.js', {
			 	Title: `${table.name.toUpperCaseFirst()} details`,
			 	Table: table.name,
			 	Columns: table.fields
			})

			fs.writeJsonSync(path + '/includes/New.js', {
				Title: `New ${table.name.toUpperCaseFirst()}`,
				Table: table.name,
				Fields: columns
			})

			prependFile.sync(path + '/includes/List.js', 'export default ');
			prependFile.sync(path + '/includes/Edit.js', 'export default ');
			prependFile.sync(path + '/includes/Details.js', 'export default ');
			prependFile.sync(path + '/includes/New.js', 'export default ');
		});
	}

	return sql;
}

function inferType(name, type) {
	if(name.indexOf('phone') != -1 || name.indexOf('tel') != -1) return 'tel';
	if(name.indexOf('password') != -1) return 'password';
	
	switch(type) {
		case 's': return 'string';
		case 'i': return 'integer';
		case 'b': return 'boolean';
		case 'date': return 'date';
		case 'time': return 'date';
		case 'c': return 'string';
		case 'f': return 'integer';
		case 'd': return 'integer';
		case 'e': return 'select';
		case 'text': return 'text';
		default: return 'string';
	}
}

// could be a couple of ternary operators
function inferRules(name, nullable) {
	const results = {
		required: nullable == 'NOT NULL',
		message: `Please input ${name}`
	};

	if(name == 'email') results.email = true;

	return results;
}

String.prototype.toUpperCaseFirst = function upperCaseFirst() {
	return this[0].toUpperCase() + this.slice(1);
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