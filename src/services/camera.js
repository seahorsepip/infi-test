const fs = require('fs');
const {promisify} = require('util');
const readFile = promisify(fs.readFile);

const getCameras = async () => (await readFile(__dirname + '/../data/cameras-defb.csv', 'utf8'))
	.trimEnd()
	.split('\n')
	.slice(1)
	.map(line => {
		const [name, latitude, longitude] = line.split(';');
		return {number: name.replace(/\D/g, ''), name, latitude, longitude};
	});

module.exports = getCameras;
