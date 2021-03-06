import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import GoChevronLeft from 'react-icons/lib/go/chevron-left';
import GoChevronRight from 'react-icons/lib/go/chevron-right';
import IoArrowSwap from 'react-icons/lib/io/arrow-swap';
import classNames from 'classnames';
import Button from '../button';
import DropdownButton from '../dropdown-button';
import { flashcardStatus } from '../../constants';
import './styles.css';

const flashcardStatusLabel = {
	[flashcardStatus.known]: 'Known',
	[flashcardStatus.unknown]: 'Unknown',
	[flashcardStatus.reviewSoon]: 'Review soon',
	[flashcardStatus.dontShow]: `Don't show`
};

export default class ActionButtons extends PureComponent {
	static propTypes = {
		onFlipCard: PropTypes.func.isRequired,
		updateCardStatus: PropTypes.func.isRequired,
		cardStatus: PropTypes.string,
		onGoToNextCard: PropTypes.func,
		onGoToPreviousCard: PropTypes.func
	};

	renderStatusDropdown = isMovingIn => {
		const containerClasses = {
			'status-menu': true,
			'status-menu-in': isMovingIn,
			'status-menu-out': this.isShowingMenu && !isMovingIn
		};

		this.isShowingMenu = isMovingIn;

		return (
			<div className={classNames(containerClasses)}>
				{Object.keys(flashcardStatus).map(status => (
					<Button
						key={status}
						className="blue-text status-dropdown-item"
						waveColor="default"
						onClick={() => this.props.updateCardStatus(status)}
						flat
					>
						{flashcardStatusLabel[status]}
					</Button>
				))}
				<Button
					className="blue-text status-dropdown-item"
					waveColor="default"
					onClick={() => this.props.updateCardStatus(null)}
					flat
				>
					None
				</Button>
			</div>
		);
	};

	render() {
		const {
			onGoToNextCard,
			onGoToPreviousCard,
			onFlipCard,
			cardStatus
		} = this.props;

		return (
			<div className="action-button-container">
				{onGoToPreviousCard ? (
					<Button
						className="icon-button action-button-margin"
						onClick={onGoToPreviousCard}
					>
						<GoChevronLeft size={24} />
					</Button>
				) : null}
				<Button
					className="icon-button action-button-margin"
					onClick={onFlipCard}
				>
					<IoArrowSwap size={24} />
				</Button>
				<DropdownButton
					className="grey lighten-3 black-text action-button-margin status-button"
					waveColor="default"
					dropdownContainerClassName="z-depth-2 status-dropdown-container"
					renderDropdownContents={this.renderStatusDropdown}
					verticalPosition="above"
				>
					{flashcardStatusLabel[cardStatus] || 'Set status'}
				</DropdownButton>
				{onGoToNextCard ? (
					<Button
						className="icon-button action-button-margin"
						onClick={onGoToNextCard}
					>
						<GoChevronRight size={24} />
					</Button>
				) : null}
			</div>
		);
	}
}
