const router = require('express').Router();
const pool = require('../connection');
const table = require('path').basename(__filename, '.js');
const { viewRecords, insertRecords, updateRecords, removeRecords } = require('../functions/crud.js');

const createProps = require(`./${table}/createProps.js`)
const updateProps = require(`./${table}/updateProps.js`)

async function get(req, res) {
	res.json(await viewRecords(table, req));
}

async function create(req, res) {
	const props = {};
	createProps.split(',').forEach(prop => props[prop] = req.body[prop])
	res.json(await insertRecords(table, props));
}

async function update(req, res) {
	const props = {};
	createProps.split(',').forEach(prop => props[prop] = req.body[prop])
	res.json(await updateRecords(table, props));
}

async function remove(req, res) {
	res.json(await removeRecords(table, req.query.id));
}

router.route( '/' ) // /
       .get( get )
       .post( create )
       .delete( remove )
       .put( update );

module.exports = router;