const pool = require('connection');

/*viewRecords('user', 'name,surname,password', 'name="Richard"');
pool.query(`SELECT name,surname,password FROM user WHERE name = 'Richard'`);
insertRecords({table: 'user', values: {name: 'Nini', surname: 'Malek', password: '123456'}});
updateRecords('user', {name='Chad',surname="Boswick"}, {name: "Richard"});*/

// viewRecords({table: 'user', cols: 'name,surname,password', where: 'name="Richard"', limit: 1, orderBy: 'name ASC', groupBy: 'user_id'});
function viewRecords({table, cols = '*', where, limit, order, groupBy}) {
	let query = `SELECT ${cols} FROM ${table}`;

    query += where ? ` WHERE ${where}` : '';
    query += groupBy ? ` GROUP BY ${groupBy}` : '';
    query += orderBy ? ` ORDER BY ${orderBy}` : '';
    query += limit ? ` LIMIT ${limit}` : '';

    return await pool.query(query)[0];
}

// insertRecords({table: 'user', cols: 'name,surname,password', values: 'Nini,Malek,123456']});
function insertRecords({table, values, cols}) {
    let colString = "";
    if( cols ) colString = `(${cols})`;
    
    var [ rows ] = await pool.query(`INSERT INTO ${table} ${colString} VALUES (${columns})`);
	return {
		results: 'success',
		insertId: rows.insertId
	};
}

Object.prototype.stringify = require('utils').stringify;

updateRecords({table: 'user', values: {name:'Chad',surname:"Boswick"}, where: 'name="Richard"'});
function updateRecords({table, values, where}) {
	let query = `UPDATE ${table} SET ${values.stringify()} WHERE ${where}`;
	await pool.query(query);
	return {results: 'success'};
}

// removeRecords({table: 'user', where: {name: 'Orora', surname: 'Storm'}});
function removeRecords({table, where}) {
	return updateRecords({table, values: {deleted: 1}, where});
}

// removeRecords simple overload
// removeRecords('user', {name: 'Orora', surname: 'Storm'});
function removeRecords(table, where) {
	return updateRecords({table, values: {deleted: 1}, where});
}


