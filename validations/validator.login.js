const { validationResult } = require('express-validator')

const validate = (req, res, next) => {
	const errors = validationResult(req)
	if (errors.isEmpty()) {
		return next()
	}
	console.log('Err >>>', errors)
	let extractedErrors = ''
	errors.array({ onlyFirstError: true }).forEach((err, index) => {
		let str = err.msg
		str += ', '
		extractedErrors += str
		// extractedErrors.push({ [err.param]: err.msg })
	})

	extractedErrors = extractedErrors.substring(0, extractedErrors.length - 2)

	return res.status(422).json({
		type: 'error',
		error: extractedErrors + '.',
	})
}

module.exports = validate
