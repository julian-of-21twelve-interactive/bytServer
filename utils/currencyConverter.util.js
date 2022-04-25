const CC = require('currency-converter-lt')
const { ObjectId } = require('mongodb')

const currencyConverter = new CC()

const getCurrencyRate = async (from, to) => {
	return await currencyConverter.from(from).to(to).rates()
}

const convertAmount = async (obj, priceKey, from, to, rate = false) => {
	if (
		obj === null ||
		typeof obj === 'string' ||
		ObjectId.isValid(obj) ||
		obj instanceof Date
	)
		return obj

	if (!rate) rate = await getCurrencyRate(from, to)

	const keyVal = Object.entries(obj).map(async ([key, value]) => {
		const isValidPriceKey = Array.isArray(priceKey)
			? priceKey.includes(key)
			: key === priceKey

		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			value = await convertAmount(value, priceKey, from, to, rate)
		} else if (Array.isArray(value)) {
			value = await Promise.all(
				value.map(
					async (val) => await convertAmount(val, priceKey, from, to, rate),
				),
			)
		} else if (isValidPriceKey) {
			value *= rate
		}

		return [key, value]
	})

	return Object.fromEntries(await Promise.all(keyVal))
}

module.exports = { currencyConverter, convertAmount, getCurrencyRate }
