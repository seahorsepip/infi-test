'use strict';
const React = require('react');
const {useState, useEffect} = React;
const importJsx = require('import-jsx');
const open = require('open');
const {Color, Box, Text, useInput, useStdout} = require('ink');
const TextInput = importJsx('ink-text-input').default;
const Table = importJsx('ink-table').default;
const getCameras = require('../services/camera');
const {capitalize, padAllValuesToMaxLength} = require('../util/util');

// UI elements that can be focused
const SEARCH_INPUT = 0;
const CASE_SENSITIVE_CHECKBOX = 1;
const RESULTS_TABLE = 2;

const App = ({name, caseSensitive}) => {
	const [data, setData] = useState([]);
	const [focus, setFocus] = useState(SEARCH_INPUT);
	const [selected, setSelected] = useState(0);
	const [offset, setOffset] = useState(0);
	const {stdout} = useStdout();
	const [{rows, columns}, setSize] = useState({rows: stdout.rows, columns: stdout.columns});
	const verticalLayout = columns < 60;
	const tableRows = Math.min(data.length, Math.max(Math.floor((rows - (verticalLayout ? 20 : 18)) / 2), 5));
	const [keywords, setKeywords] = useState(name || '');
	const [isCaseSensitive, setIsCaseSensitive] = useState(caseSensitive);
	const inputLength = columns - (verticalLayout ? 8 : 26);
	const isValid = !!keywords.trim().length;
	const tableWidth = Object.entries(data[0] || {}).reduce((sum, [key, value]) => sum + Math.max(key.length, value.length) + 3, 0) + 1;

	const handleChange = value => focus === SEARCH_INPUT && setKeywords(value.trimStart().replace(/ +(?= )/g, '').slice(0, inputLength));
	const compare = (a, b) => {
		if (!isCaseSensitive) {
			a = a.toLowerCase();
			b = b.toLowerCase();
		}
		return a.includes(b);
	};
	const results = data
		.filter(camera => keywords.split(' ').filter(Boolean).some(keyword => compare(camera.name, keyword)))
		.map(camera => {
			let {name} = camera;
			const diff = columns - tableWidth - 4;
			if (diff < 0) name = name.slice(0, diff);
			else name += ' '.repeat(diff);
			if (camera.name.trimEnd().length > name.length) name = name.slice(0, -1) + '…';
			return {...camera, name};
		});

	useEffect(() => {
		getCameras().then(padAllValuesToMaxLength).then(setData);
	}, []);
	useEffect(() => {
		!results.length && focus === RESULTS_TABLE && setFocus(SEARCH_INPUT);
	}, [keywords, isCaseSensitive]);
	useEffect(() => {
		stdout.on('resize', () => setSize({rows: stdout.rows, columns: stdout.columns}));
	}, [stdout]);

	useInput((input, key) => {
		if (focus === SEARCH_INPUT && key.rightArrow) setFocus(CASE_SENSITIVE_CHECKBOX);
		if ((focus === SEARCH_INPUT || focus === CASE_SENSITIVE_CHECKBOX) && !!results.length && key.downArrow) setFocus(RESULTS_TABLE);
		if (focus === CASE_SENSITIVE_CHECKBOX && key.leftArrow) setFocus(SEARCH_INPUT);
		if (focus === CASE_SENSITIVE_CHECKBOX && (input === ' ' || key.return)) setIsCaseSensitive(prevState => !prevState);
		if (focus === RESULTS_TABLE && key.upArrow) {
			setSelected(Math.max(selected - 1, 0));
			if (selected - 1 < 0) {
				if (offset > 0) setOffset(offset - 1);
				else setFocus(SEARCH_INPUT);
			}
		}
		if (focus === RESULTS_TABLE && key.downArrow) {
			setSelected(Math.min(selected + 1, tableRows - 1));
			if (selected + 1 > tableRows - 1 && offset < results.length - tableRows) setOffset(offset + 1);
		}
		if (focus === RESULTS_TABLE && (key.return || input === ' ')) {
			const {latitude, longitude} = results[offset + selected];
			open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
		}
	});

	let cellRenderCount = 0;
	const renderHeader = ({children}) => <Color cyan>{children.map(capitalize)}</Color>;
	const renderCell = ({children}) => {
		const rowIndex = Math.floor(cellRenderCount++ / Object.keys(results[0]).length);
		if (rowIndex === selected && focus === RESULTS_TABLE) children = <Color black bgCyan>{children}</Color>;
		return children;
	};

	return (
		<Box flexDirection={'column'} paddingX={2} paddingY={1}>
			<Box marginBottom={1}>Search camera by name</Box>
			<Box alignItems={verticalLayout ? 'flex-start' : 'center'} marginBottom={1}
				 flexDirection={verticalLayout ? 'column' : 'row'}>
				<Color cyan={focus === SEARCH_INPUT} grey={focus !== SEARCH_INPUT}>
					<Box flexDirection={'column'}>
						<Text>╭{'─'.repeat(inputLength + 2)}╮</Text>
						<Box>
							│
							<Box marginX={1}><Color grey={!isValid} white={isValid}>
								<TextInput value={keywords} onChange={handleChange}
										   placeholder={'Enter keywords...'.padEnd(inputLength, ' ')}
										   showCursor={false}/>
								{' '.repeat(keywords.length ? inputLength - keywords.length : 0)}
							</Color></Box>
							│
						</Box>
						<Text>╰{'─'.repeat(inputLength + 2)}╯</Text>
					</Box>
				</Color>
				<Box marginLeft={verticalLayout ? 0 : 2} marginY={1}>
					<Color cyan={focus === CASE_SENSITIVE_CHECKBOX}>{isCaseSensitive ? '√' : 'X'} Case sensitive</Color>
				</Box>
			</Box>
			{!!keywords.length && <Color grey>{'─'.repeat(columns - 4)}</Color>}
			{!!keywords.length && <Box marginY={1}>{results.length} cameras found</Box>}
			{!!results.length && (
				<>
					<Table data={results.slice(offset, offset + tableRows)} header={renderHeader} cell={renderCell}/>
					<Box marginTop={1} textWrap={'truncate-end'}>
						Select camera with <Color cyan>↑↓ arrow keys</Color> and
						press <Color cyan>enter</Color> to open in google maps
					</Box>
				</>
			)}
		</Box>
	);
};

module.exports = App;
