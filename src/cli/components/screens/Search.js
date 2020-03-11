'use strict';
const React = require('react');
const {useState} = React;
const importJsx = require('import-jsx');
const {Color, Box, Text, useInput} = require('ink');
const TextInput = importJsx('ink-text-input').default;

// UI elements that can be focused
const SEARCH_INPUT = 0;
const CASE_SENSITIVE_CHECKBOX = 1;
const SUBMIT_BUTTON = 2;

const Search = ({setQuery}) => {
	const [focus, setFocus] = useState(SEARCH_INPUT);
	const [keywords, setKeywords] = useState('');
	const [isCaseSensitive, setIsCaseSensitive] = useState(true);
	const inputLength = 32;
	const isValid = !!keywords.trim().length;
	const handleChange = value => focus === SEARCH_INPUT && setKeywords(value.slice(0, inputLength));

	useInput(((input, key) => {
		if (key.upArrow) setFocus(Math.max(focus - 1, 0));
		if (key.downArrow) setFocus(Math.min(focus + 1, isValid ? SUBMIT_BUTTON : CASE_SENSITIVE_CHECKBOX));
		if (focus === CASE_SENSITIVE_CHECKBOX && (input === ' ' || key.return)) setIsCaseSensitive(prevState => !prevState);
		if (((focus === SEARCH_INPUT && key.return) || (focus === SUBMIT_BUTTON && (input === ' ' || key.return))) && isValid)
			setQuery({
				keywords: keywords.trim().split(' ').map(k => k.trim()),
				isCaseSensitive
			});
	}));

	return (
		<Box flexDirection={'column'} paddingX={3} paddingY={2}>
			<Box marginBottom={1}>Search camera by name</Box>
			<Color cyan={focus === SEARCH_INPUT}>
				<Box flexDirection={'column'}>
					<Text>╭{'─'.repeat(inputLength)}╮</Text>
					<Box>
						│
						<Color grey={!isValid} white={isValid}>
							<TextInput value={keywords} onChange={handleChange}
									   placeholder={'Enter keywords...'.padEnd(inputLength, ' ')} showCursor={false}/>
							{' '.repeat(keywords.length ? inputLength - keywords.length : 0)}
						</Color>
						│
					</Box>
					<Text>╰{'─'.repeat(inputLength)}╯</Text>
				</Box>
			</Color>
			<Box marginLeft={1} marginBottom={1}>
				<Color cyan={focus === CASE_SENSITIVE_CHECKBOX}>{isCaseSensitive ? '√' : 'X'} Case sensitive</Color>
			</Box>
			<Color black={isValid} grey={!isValid} bgWhite={focus !== SUBMIT_BUTTON}
				   bgCyan={focus === SUBMIT_BUTTON}> Submit → </Color>
		</Box>
	);
};

module.exports = Search;
