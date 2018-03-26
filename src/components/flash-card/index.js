import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ActionButtons from '../action-buttons';
import { flashcardPropTypes } from '../../constants';
import './styles.css';

export default class Flashcard extends PureComponent {
	static propTypes = {
		card: flashcardPropTypes,
		updateCard: PropTypes.func.isRequired,
		onGoToNextCard: PropTypes.func,
		onGoToPreviousCard: PropTypes.func,
	};

	state = {
		parsedContent: this.props.card.back.split('\r\n'),
		showAnswer: false,
	};

	componentWillReceiveProps(nextProps) {
		if (this.props.card.id !== nextProps.card.id) {
			this.setState({ parsedContent: nextProps.card.back.split('\r\n'), showAnswer: false });
		}
	}

	handleFlipCard = () => {
		this.setState(prevState => ({ showAnswer: !prevState.showAnswer }));
	};

	render() {
		const { card, onGoToNextCard, onGoToPreviousCard, updateCard } = this.props;
		const { parsedContent, showAnswer } = this.state;
		const { front, status } = card;

		return (
			<div className="flashcard-container">
				<div className="flashcard-content-container">
					<div className="flashcard-content">
						{showAnswer ? parsedContent.map((line, i) => <span key={i}>{line}<br /></span>) : front}
					</div>
				</div>
				<ActionButtons
					cardStatus={status}
					onGoToNextCard={onGoToNextCard}
					onGoToPreviousCard={onGoToPreviousCard}
					onFlipCard={this.handleFlipCard}
					updateCardStatus={status => {
						updateCard({ ...card, status });
					}}
				/>
			</div>
		);
	}
}
