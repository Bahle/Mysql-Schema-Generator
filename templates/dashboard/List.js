import React, { Component } from 'react';
import List from '../../../components/List';
import props from './includes/List'

class Element extends Component {
	index = 1;

	render() {
		return (
			<List Root='' {...props} />
		)
	}
}

export default Element;