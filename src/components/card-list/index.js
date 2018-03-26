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
					{cards.map(card => (
						<CardPreview
							key={card.id}
							card={card}
						/>
					))}
				</div>
			</div>
		);
	}
}

const CardPreview = ({ card }) => {
	const { id, front, status } = card;

	return (
		<Link to={`/card/${id}`} className="card-preview text-overflow">
			{front}
		</Link>
	);
};
