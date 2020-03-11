'use strict';
const React = require('react');
const {useState} = React;
const importJsx = require('import-jsx');
const Search = importJsx('./components/screens/search');
const Results = importJsx('./components/screens/results');


const App = ({name, caseSensitive}) => {
	const [query, setQuery] = useState({
		keywords: name === undefined ? [] : name.trim().split(' ').map(k => k.trim()),
		isCaseSensitive: caseSensitive
	});
	return !query.keywords.length ? <Search setQuery={setQuery}/> : <Results query={query} setQuery={setQuery}/>;
};

module.exports = App;
