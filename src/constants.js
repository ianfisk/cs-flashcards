import PropTypes from 'prop-types';

export const flashcardStatus = {
	known: 'known',
	unknown: 'unknown',
	reviewSoon: 'reviewSoon',
	dontShow: 'dontShow',
};

export const flashcardPropTypes = PropTypes.shape({
	id: PropTypes.number.isRequired,
	front: PropTypes.string.isRequired,
	back: PropTypes.string.isRequired,
	status: PropTypes.string,
}).isRequired;

export const buttonTypes = [
	'floating',
	'flat',
	'large',
	'small',
];
