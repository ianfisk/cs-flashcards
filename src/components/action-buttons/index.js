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

export default class ActionButtons extends PureComponent {
	static propTypes = {
		onFlipCard: PropTypes.func.isRequired,
		updateCardStatus: PropTypes.func.isRequired,
		cardStatus: PropTypes.string,
		onGoToNextCard: PropTypes.func,
		onGoToPreviousCard: PropTypes.func,
	};

	renderStatusDropdown = () => {
		return (
			<React.Fragment>
				{Object.keys(flashcardStatus).map(status =>
					<button
						key={status}
						className="btn btn-no-styling status-dropdown-item"
						onClick={() => this.props.updateCardStatus(status)}
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
		const { onGoToNextCard, onGoToPreviousCard, onFlipCard, cardStatus } = this.props;

		return (
			<div className="action-button-container">
				{onGoToPreviousCard ?
					<button className="btn btn-primary action-button-margin" onClick={onGoToPreviousCard}>
						<GoArrowLeft size={24} />
					</button> : null}
				<button className="btn btn-primary action-button-margin" onClick={onFlipCard}>
					<IoArrowSwap size={24} />
				</button>
				<DropdownButton
					className="btn btn-success action-button-margin status-button"
					dropdownContainerClassName="status-dropdown-container"
					renderDropdownContents={this.renderStatusDropdown}
					verticalPosition="above"
				>
					{flashcardStatusLabel[cardStatus] || 'Set status'}
				</DropdownButton>
				{onGoToNextCard ?
					<button className="btn btn-primary action-button-margin" onClick={onGoToNextCard}>
						<GoArrowRight size={24} />
					</button> : null}
			</div>
		);
	}
}
