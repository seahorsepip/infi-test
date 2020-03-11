#!/usr/bin/env node
'use strict';
const meow = require('meow');

const cli = meow(`
	Usage
	  $ infi-test

	Options
		--name, -n				(optional) Search camera by name
		--case-sensitive, -c	(optional) Compare with case sensitivity
		--web, -w				(optional) Start web server and show cameras in browser

	Examples
	  $ infi-test
	  Search camera by name

	  $ infi-test --name=laan
	  17 cameras found that match laan

	  $ infi-test --name=laan --case-sensitive=false
	  18 cameras found that match laan
`, {
	flags: {
		name: {
			type: 'string',
			alias: 'n'
		},
		caseSensitive: {
			type: 'boolean',
			alias: 'c',
			default: true
		},
		web: {
			type: 'number',
			alias: 'w'
		}
	}
});

console.clear();

if ('web' in cli.flags) {
	require('./src/api')(cli.flags.web || 3000);
} else {
	const React = require('react');
	const importJsx = require('import-jsx');
	const {render} = require('ink');
	const App = importJsx('./src/cli/App');

	render(React.createElement(App, cli.flags));
}
