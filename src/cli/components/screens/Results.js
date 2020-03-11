'use strict';
const React = require('react');
const {useState, useEffect} = React;
const importJsx = require('import-jsx');
const {Color, Box, useInput} = require('ink');
const open = require('open');
const Table = importJsx('ink-table').default;
const getCameras = require('../../../services/camera');
const {capitalize, padAllValuesToMaxLength} = require('../../../util/util');

// UI elements that can be focused
const BACK_BUTTON = 0;
const RESULTS_TABLE = 1;

const Results = ({query: {keywords, isCaseSensitive}, setQuery}) => {
	const [data, setData] = useState([]);
	const [focus, setFocus] = useState(BACK_BUTTON);
	const [selected, setSelected] = useState(0);
	const [offset, setOffset] = useState(0);
	const rows = Math.min(data.length, 5);

	const filter = cameras => cameras.filter(camera => keywords.some(keyword => compare(camera.name, keyword)));
	const compare = (a, b) => {
		if (!isCaseSensitive) {
			a = a.toLowerCase();
			b = b.toLowerCase();
		}
		return a.includes(b);
	};

	useEffect(() => {
		getCameras().then(padAllValuesToMaxLength).then(filter).then(setData);
	}, [keywords.join(), isCaseSensitive]);
	useEffect(() => {
		setFocus(data.length ? RESULTS_TABLE : BACK_BUTTON);
	}, [data.length]);

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

	let cellRenderCount = 0;
	const renderHeader = ({children}) => <Color cyan>{children.map(capitalize)}</Color>;
	const renderCell = ({children}) => {
		const rowIndex = Math.floor(cellRenderCount++ / Object.keys(data[0]).length);
		if (rowIndex === selected && focus === RESULTS_TABLE) children = <Color black bgCyan>{children}</Color>;
		return children;
	};

	return (
		<Box flexDirection={'column'} paddingX={3} paddingY={2}>
			<Color black bgWhite={focus !== BACK_BUTTON} bgCyan={focus === BACK_BUTTON}> ← Search </Color>
			<Box marginY={1}>{data.length} cameras found that match <Color cyan>{keywords.join(' ')}</Color></Box>
			{!!data.length && (
				<>
					<Table data={data.slice(offset, offset + rows)} header={renderHeader} cell={renderCell}/>
					<Box marginTop={1}>
						Select camera with <Color cyan>↑↓ arrow keys</Color> and
						press <Color cyan>enter</Color> to open in google maps
					</Box>
				</>
			)}
		</Box>
	);
};

module.exports = Results;
