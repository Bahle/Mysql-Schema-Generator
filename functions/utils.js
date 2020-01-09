function stringify() {
	let res = [];

	for(k in this) {
		res.push(`'${k}' = '${this[k]}',`);
	}

	return res.join(',');
}

module.exports = { stringify };