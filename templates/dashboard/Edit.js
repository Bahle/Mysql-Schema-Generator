import React, { Component } from 'react';
import Edit from '../../../components/Edit';
import props from './includes/Edit'

class CustomerEdit extends Component {
	render() {
		return (
			<Edit Root='' {...props} />
		)
	}
}

export default CustomerEdit;