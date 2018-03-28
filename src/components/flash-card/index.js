import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ActionButtons from '../action-buttons';
import DoubleTap from '../double-tap';
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
		parsedContent: splitOnNewlines(this.props.card.back),
		showAnswer: false,
		isEditing: false,
		editedContent: '',
	};

	componentWillReceiveProps(nextProps) {
		if (this.props.card.id !== nextProps.card.id) {
			this.setState({ parsedContent: splitOnNewlines(nextProps.card.back), showAnswer: false });
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (!prevState.isEditing && this.state.isEditing) {
			this.editor.focus();
		} else if (prevState.isEditing && !this.state.isEditing) {
			const updatedCard = {
				...this.props.card,
				isEdited: true
			};

			const editedContent = this.state.editedContent.trim();
			if (this.state.showAnswer) {
				updatedCard.back = editedContent;
				this.setState({ parsedContent: splitOnNewlines(editedContent) })
			} else {
				updatedCard.front = editedContent;
			}

			this.props.updateCard(updatedCard);
		}
	}

	handleFlipCard = () => {
		this.setState(prevState => ({ showAnswer: !prevState.showAnswer }));
	};

	handleEditCard = e => {
		this.setState({ editedContent: e.target.value });
	};

	render() {
		const { card, onGoToNextCard, onGoToPreviousCard, updateCard } = this.props;
		const { parsedContent, showAnswer, isEditing, editedContent } = this.state;
		const { front, back, status } = card;

		return (
			<div className="flashcard-container">
				<div className="flashcard-content-container">
					{!isEditing ?
						<DoubleTap
							className="flashcard-content"
							onDoubleTap={() => {
								this.setState({
									isEditing: true,
									editedContent: showAnswer ? back : front,
								});
							}}
						>
							{showAnswer ? parsedContent.map((line, i) => <span key={i}>{line}<br /></span>) : front}
						</DoubleTap> :
						<textarea
							className="editor"
							ref={e => {
								this.editor = e;
							}}
							value={editedContent}
							onChange={this.handleEditCard}
							onBlur={() => {
								this.setState({ isEditing: false });
							}}
						/>}
				</div>
				<ActionButtons
					cardStatus={status}
					onGoToNextCard={onGoToNextCard}
					onGoToPreviousCard={onGoToPreviousCard}
					onFlipCard={this.handleFlipCard}
					updateCardStatus={newStatus => {
						updateCard({ ...card, status: newStatus });
					}}
				/>
			</div>
		);
	}
}

function splitOnNewlines(str) {
	return str.split(/\n/);
}
