import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { flashcardPropTypes } from '../../constants';
import './styles.css';

export default class CardList extends PureComponent {
	static propTypes = {
		cards: PropTypes.arrayOf(flashcardPropTypes).isRequired,
		header: PropTypes.string.isRequired,
	};

	render() {
		const { cards, header } = this.props;

		return (
			<div className="card-list">
				<h3>{header}</h3>
				<div className="card-list-container">
					{cards.map((card, i) => (
						<CardPreview
							key={card.id}
							card={card}
							animationDelayMs={100 + i * 20}
						/>
					))}
				</div>
			</div>
		);
	}
}

const CardPreview = ({ card, animationDelayMs }) => {
	const { id, front } = card;
	const animationStyle = {
		animationDelay: `${animationDelayMs}ms`,
		animationDuration: '0.3s',
		animationName: 'animateListItemIn',
		animationTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
		animationFillMode: 'forwards',
	};

	return (
		<Link
			to={`/card/${id}`}
			className="card-preview text-overflow"
			style={animationStyle}
		>
			{front}
		</Link>
	);
};
