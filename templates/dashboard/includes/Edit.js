export default {
	Title: "Edit Client",
	Table: "client",
	Fields: [
		{
			name: 'name',
			type: 'string',
			rules: { required: true, message: 'Please input name'}
		},
		{
			label: 'Phone Number',
			name: 'tel',
			type: 'text',
			rules: { required: true, message: 'Please input tel no.'}
		},
		{
			name: 'email',
			type: 'string',
			rules: { required: true, email: true, message: 'Please input email'}
		},
		{
			label: 'Password',
			name: 'password',
			type: 'reset_password'
		}
	]
}