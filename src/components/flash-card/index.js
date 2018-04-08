import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
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
		showAnswer: null,
		isEditing: false,
		editedContent: '',
	};

	componentWillReceiveProps(nextProps) {
		if (this.props.card.id !== nextProps.card.id) {
			this.setState(prevState => ({
				parsedContent: splitOnNewlines(nextProps.card.back),
				showAnswer: prevState.showAnswer !== null ? false : null,
			}));
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

	componentWillUnmount() {
		clearTimeout(this.navigateTimeout);
	}

	handleFlipCard = () => {
		this.setState(prevState => ({ showAnswer: !prevState.showAnswer }));
	};

	handleEditCard = e => {
		this.setState({ editedContent: e.target.value });
	};

	handleNavigate = (doNavigate, ...args) => {
		if (this.state.showAnswer) {
			// wait for the card to slide down before navigating
			this.setState({ showAnswer: false });
			this.navigateTimeout = setTimeout(() => {
				doNavigate(...args);
			}, 300);
		} else {
			doNavigate(...args);
		}
	};

	render() {
		const { card, onGoToNextCard, onGoToPreviousCard, updateCard } = this.props;
		const { parsedContent, showAnswer, isEditing, editedContent } = this.state;
		const { front, back, status } = card;

		const cardBackClasses = {
			'flashcard-back': true,
			'z-depth-2': showAnswer,
			'slide-down': showAnswer !== null && !showAnswer,
			'slide-up': showAnswer,
		};
		const cardFrontClasses = {
			'flashcard-front': true,
			'show-front-animation': showAnswer !== null && !showAnswer,
			'hide-front-animation': showAnswer,
		};

		return (
			<div className="flashcard-container">
				<div className="flashcard-content-container">
					<DoubleTap
						onDoubleTap={() => {
							this.setState({
								isEditing: true,
								editedContent: showAnswer ? back : front,
							});
						}}
					>
						<div className={classNames(cardFrontClasses)}>
							<span className="flashcard-content">{front}</span>
						</div>
						<div className={classNames(cardBackClasses)}>
							<span className="flashcard-content">
								{parsedContent.map((line, i) => <span key={i}>{line}<br /></span>)}
							</span>
						</div>
					</DoubleTap>
					<textarea
						className="editor"
						style={{ display: isEditing ? 'block' : 'none' }}
						ref={e => {
							this.editor = e;
						}}
						value={editedContent}
						onChange={this.handleEditCard}
						onBlur={() => {
							this.setState({ isEditing: false });
						}}
					/>
				</div>
				<ActionButtons
					cardStatus={status}
					onGoToNextCard={(...args) => this.handleNavigate(onGoToNextCard, ...args)}
					onGoToPreviousCard={(...args) => this.handleNavigate(onGoToPreviousCard, ...args)}
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
