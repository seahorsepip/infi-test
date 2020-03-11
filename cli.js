#!/usr/bin/env node
'use strict';
const React = require('react');
const importJsx = require('import-jsx');
const {render} = require('ink');
const meow = require('meow');

const App = importJsx('./src/App');

const cli = meow(`
	Usage
	  $ infi-test

	Options
		--name, -n				(optional) Search camera by name
		--case-sensitive, -c	(optional) Compare with case sensitivity

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
		}
	}
});

console.clear();
render(React.createElement(App, cli.flags));
