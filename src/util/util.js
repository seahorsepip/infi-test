const fromEntries = require('fromentries');

// Capitalize first character of string
const capitalize = str => str.replace(/^\w/, c => c.toUpperCase());

// Pad every property of each object in the array to match the maximum length found of the property in the array
const padAllValuesToMaxLength = array => {
	if (!array.length) return array;
	const maxLengths = fromEntries(Object.keys(array[0]).map(key => [key, Math.max(...array.map(o => o[key].length))]));
	return array.map(o => fromEntries(Object.entries(o).map(([key, value]) => [key, value.padEnd(maxLengths[key], ' ')])));
};

module.exports = {capitalize, padAllValuesToMaxLength};
