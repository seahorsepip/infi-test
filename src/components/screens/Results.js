'use strict';
const React = require('react');
const {useState} = React;
const importJsx = require('import-jsx');
const {Text, Color, Box, useInput} = require('ink');
const fs = require('fs');
const open = require('open');
const Table = importJsx('ink-table').default;


// Get cameras from CSV file
const csv = fs.readFileSync(__dirname + '/../../data/cameras-defb.csv', 'utf8').trimEnd();
let cameras = csv.split('\n').slice(1).map(line => {
	const [name, latitude, longitude] = line.split(';');
	return {id: name.replace(/\D/g, ''), name, latitude, longitude};
});

// Pad all camera names with spaces to match length from longest camera name
const longestCameraNameLength = Math.max(...cameras.map(({name}) => name.length));
cameras = cameras.map(camera => ({
	...camera,
	name: camera.name.padEnd(longestCameraNameLength, ' ')
}));

// UI elements that can be focused
const BACK_BUTTON = 0;
const RESULTS_TABLE = 1;

const Results = ({query: {keywords, isCaseSensitive}, setQuery}) => {
	const compare = (a, b) => {
		if (!isCaseSensitive) {
			a = a.toLowerCase();
			b = b.toLowerCase();
		}
		return a.includes(b);
	};
	const data = cameras.filter(camera => keywords.some(keyword => compare(camera.name, keyword)));
	const rows = Math.min(data.length, 5);

	const [focus, setFocus] = useState(!!data.length ? RESULTS_TABLE : BACK_BUTTON);
	const [selected, setSelected] = useState(0);
	const [offset, setOffset] = useState(0);

	useInput((input, key) => {
		if (focus === RESULTS_TABLE && key.upArrow) {
			setSelected(Math.max(selected - 1, 0));
			if (selected - 1 < 0) {
				if (offset > 0) setOffset(offset - 1);
				else setFocus(BACK_BUTTON);
			}
		}
		if (focus === BACK_BUTTON && !!data.length && key.downArrow) setFocus(RESULTS_TABLE);
		if (focus === RESULTS_TABLE && key.downArrow) {
			setSelected(Math.min(selected + 1, rows - 1));
			if (selected + 1 > rows - 1 && offset < data.length - rows) setOffset(offset + 1);
		}
		if (focus === BACK_BUTTON && (key.return || input === ' ')) setQuery(prev => ({...prev, keywords: []}));
		if (focus === RESULTS_TABLE && (key.return || input === ' ')) {
			const {latitude, longitude} = data[offset + selected];
			open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
		}
	});

	const capitalize = str => str.replace(/^\w/, c => c.toUpperCase());
	const renderHeader = ({children}) => <Color cyan>{children.map(capitalize)}</Color>;
	let cellRenderCount = 0;
	const renderCell = ({children}) => {
		const rowIndex = Math.floor(cellRenderCount++ / Object.keys(cameras[0]).length);
		if (rowIndex === selected && focus === RESULTS_TABLE) children = <Color black bgCyan>{children}</Color>;
		return children;
	};

	return (
		<Box flexDirection={'column'} paddingX={3} paddingY={2}>
			<Color black bgWhite={focus !== BACK_BUTTON} bgCyan={focus === BACK_BUTTON}> ← Search </Color>
			<Box height={1}/>
			<Text>{data.length} cameras found that match <Color cyan>{keywords.join(' ')}</Color></Text>
			<Box height={1}/>
			{!!data.length && (
				<>
					<Table data={data.slice(offset, offset + rows)} header={renderHeader} cell={renderCell}/>

					<Box height={1}/>
					<Text>
						Select camera with <Color cyan>↑↓ arrow keys</Color> and
						press <Color cyan>enter</Color> to open in google maps
					</Text>
				</>
			)}
		</Box>
	);
};

module.exports = Results;
