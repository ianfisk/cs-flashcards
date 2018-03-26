import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import GoArrowLeft from 'react-icons/lib/go/arrow-left';
import GoArrowRight from 'react-icons/lib/go/arrow-right';
import IoArrowSwap from 'react-icons/lib/io/arrow-swap';
import DropdownButton from '../dropdown-button';
import { flashcardStatus } from '../../constants';
import './styles.css';

const flashcardStatusLabel = {
	[flashcardStatus.known]: 'Known',
	[flashcardStatus.unknown]: 'Unknown',
	[flashcardStatus.reviewSoon]: 'Review soon',
	[flashcardStatus.dontShow]: `Don't show`,
};

export default class Flashcard extends PureComponent {
	static propTypes = {
		card: PropTypes.shape({
			id: PropTypes.number.isRequired,
			front: PropTypes.string.isRequired,
			back: PropTypes.string.isRequired,
			status: PropTypes.string,
		}).isRequired,
		onGoToNextCard: PropTypes.func.isRequired,
		onGoToPreviousCard: PropTypes.func.isRequired,
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

	renderStatusDropdown = () => {
		return (
			<React.Fragment>
				{Object.keys(flashcardStatus).map(status =>
					<button
						key={status}
						className="btn btn-no-styling status-dropdown-item"
						onClick={() => {
							const { updateCard, card } = this.props;
							updateCard({
								...card,
								status,
							});
						}}
					>
						{flashcardStatusLabel[status]}
					</button>
				)}
				<button
					className="btn btn-no-styling status-dropdown-item"
					onClick={() => {
						const { updateCard, card } = this.props;
						updateCard({
							...card,
							status: null,
						});
					}}
				>
					None
				</button>
			</React.Fragment>
		);
	};

	render() {
		const { card, onGoToNextCard, onGoToPreviousCard } = this.props;
		const { parsedContent, showAnswer } = this.state;
		const { front, status } = card;

		return (
			<div className="flashcard-container">
				<div className="flashcard-content-container">
					<div className="flashcard-content">
						{showAnswer ? parsedContent.map((line, i) => <span key={i}>{line}<br /></span>) : front}
					</div>
				</div>
				<div className="action-button-container">
					<button className="btn btn-primary action-button-margin" onClick={onGoToPreviousCard}>
						<GoArrowLeft size={24} />
					</button>
					<button className="btn btn-primary action-button-margin" onClick={this.handleFlipCard}>
						<IoArrowSwap size={24} />
					</button>
					<DropdownButton
						className="btn btn-success action-button-margin status-button"
						dropdownContainerClassName="status-dropdown-container"
						renderDropdownContents={this.renderStatusDropdown}
						position="above"
					>
						{flashcardStatusLabel[status] || 'Set status'}
					</DropdownButton>
					<button className="btn btn-primary action-button-margin" onClick={onGoToNextCard}>
						<GoArrowRight size={24} />
					</button>
				</div>
			</div>
		);
	}
}
