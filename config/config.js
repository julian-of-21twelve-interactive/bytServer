const config = {
	client: {
		baseUrl: 'http://localhost:3000',
	},
	server: {
		port: 3001,
		urlPrefix: '/api/v1',
	},
	db: {
		dbUri: 'mongodb://localhost',
		dbName: 'byt-node',
	},
	images: {
		imagePath: 'uploads/images',
		defaultAvatar: '/user/default.png',
	},
	mail: {
		fromMail: '"Byt" <byt.donotreply@gmail.com>',
		host: 'smtp.gmail.com',
		port: '587',
		user: 'byt.donotreply@gmail.com',
		pass: 'oqqfpcluyywreqpq',
	},
	currency: ['KD', 'USD'],
	taxType: ['VAT', 'GST'],
	kioskCustomerId: '6229f48b02ce914545992c12',
}

module.exports = config
