const http = require('http');
const lineReader = require('line-reader');
const fs = require('fs-extra')
const { fileReader, fileWriter } = require('./testo.js');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const prependFile = require('prepend-file');
const readline = require('readline');

// Create a readline interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Welcome message and prompts for input/output file names
console.log('Welcome to the Mysql Schema Generation Utility');
rl.question('Please enter the input file name to be transpiled to schema: ', (sourceFile) => {
  rl.question('Please enter the output file name: ', (destinationFile) => {
  	rl.question('Do you want the schema to be imported directly into your mysql databases? (y/n): ', (answer) => {
	    // start here supposedly
	    fileReader(sourceFile, processFile, async () => {
	    	fileWriter(`${destinationFile}.sql`, genSql());
	    	// genSql();
	    	const importIntoDB = answer.toLowerCase() === 'y';

	    	if(importIntoDB) {
		    	console.log('Finished writing schema!');
		    	console.log('Importing database from schema...');
	    		await exec(`mysql -u root -p < ${destinationFile}.sql`);
	    		console.log('Finished importing schema!');
	    	}
	    });

	    copyFile(sourceFile, destinationFile);
	    rl.close();
		});
  });
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
	if(line[0] == '%') {
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
		controller: [], //@
		dashboard: [], //$
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
				nullable = fieldProps[fieldProps.length-1] == 'n' ? 'NULL' : 'NOT NULL'; //fieldProps.length <= 2 ? 'NOT NULL' : 'NULL';

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
	/* *** if(tables.filter(table => table.controller != '').length > 0) {
		// begin by Cloning the Backend Template Folder
		const folder = `./generated/${database}/server`;
		// console.log('folder is ' + folder)
		console.log('copying folder ' + folder + '...')
		fs.copySync('../backend-template', folder)
		console.log('Finished copying folder!')

		tables.filter(table => table.controller != '').forEach(table => {
			console.log('found controller: ' + table.controller)
			// then 
			fs.copySync('./templates/backend/route.js', folder + '/routes/' + table.name + '.js'); // create the route file

			console.log(table.fields)
			const fields = table.fields.map(field => field.split(' ')[0]);

			fs.ensureDirSync(folder + '/routes/' + table.name); // create props folder
			fileWriter(folder + '/routes/' + table.name + '/createProps.js', 'export default "' + fields + '"')
			fileWriter(folder + '/routes/' + table.name + '/udpateProps.js', 'export default "' + fields + '"')
		});
	} *** */

	// implementation for generation of dashboard pages
	// if a single table is found to have a controller
	/* *** if(tables.filter(table => table.dashboard != '').length > 0) {
		// begin by Cloning the Dashboard Template Folder
		const folder = `./generated/${database}/server/client`;
		console.log('Copying folder...');
		fs.copySync('../dashboard-template', folder)
		console.log('Finished copying folder!');

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
						title: fieldProps1[0],
						dataIndex: fieldProps1[0].toLowerCase(),
						key: fieldProps1[0].toLowerCase()
					},
					{
						title: fieldProps2[0],
						dataIndex: fieldProps2[0].toLowerCase(),
						key: fieldProps2[0].toLowerCase()
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
	} *** */

	return sql;
}

// for dashboard page generation
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

	if(type == 'i') return 'INT'; // was integer
	if(type == 'ti') return 'TINYINT';
	if(type == 'si') return 'SMALLINT';
	if(type == 'b')	return 'BOOLEAN';
	if(type == 'time') return 'TIMESTAMP';
	if(type == 'date') return 'DATE';
	if(type == 'dt') return 'DATETIME';
	if(type == 't') return 'TEXT';

	if(/c\d+/.test(type) === true) {
		let count = type.match(/\d+/);

		return `CHAR (${count})`;
	}

	if(/f\d+,\d+/.test(type)) {
		// let values = type.match(/\d+/g); // extract number values
		return `FLOAT(${type.slice(1/*, type.length*/)})`;
	}

	if(/d\d+,\d+/.test(type)) {
		// let values = type.match(/\d+/g); // extract number values
		return `DECIMAL(${type.slice(1, /*type.length*/)})`;
	}

	if(type[0] == 'e')  {
		return `ENUM(${type.slice(2, /*type.length*/).replace(/_/g, ' ').replace(/([a-zA-Z0-9-\s]+)/g, "'$1'")}`;
	}

	if(type.slice(0,3) == 'set')  {
		return `SET(${type.slice(4, /*type.length*/).replace(/_/g, ' ').replace(/([a-zA-Z0-9-\s]+)/g, "'$1'")}`;
	}

	console.log('Got a weird one: ', type)

	process.exit();

	return type.toUpperCase();
}