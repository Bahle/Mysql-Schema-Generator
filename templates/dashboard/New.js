import React, { Component } from 'react';
import New from '../../../components/New';
import props from './includes/New'

class CustomerNew extends Component {
	render() {
		return (
			<New Root='' {...props} />
		)
	}
}

export default CustomerNew;