const moment = require('moment')

const genShortCode = (str, type, expiry) => {
	str = str.trim()
	const initCharsArr = []
	for (let i = 0; i < str.length; i += 1) {
		str[i] === ' ' && initCharsArr.push(str[i + 1])
	}

	const typeCode = type.toLowerCase() === 'non-vegetarian' ? 'NV' : '0V'
	const expiryCode = moment(expiry).format('MMYY')

	const code =
		(str[0] + initCharsArr.join('') + str[str.length - 1]).padEnd(4, '0') +
		typeCode +
		'-' +
		expiryCode

	return code.toUpperCase()
}

module.exports = genShortCode
