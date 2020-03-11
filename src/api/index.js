const express = require('express');
const open = require('open');
const getCameras = require('../services/camera');
const app = express();

const api = port => {
	app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
	app.get('/api/cameras', (req, res) => getCameras().then(cameras => res.send(cameras)));

	app.listen(port, () => {
		console.log(`Web server listening on port ${port}!`);
		open(`http://localhost:${port}`);
	});
};

module.exports = api;


