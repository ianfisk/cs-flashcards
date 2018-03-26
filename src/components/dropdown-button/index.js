import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './styles.css';

export default class DropdownButton extends PureComponent {
	static propTypes = {
		className: PropTypes.string.isRequired,
		children: PropTypes.string.isRequired,
		renderDropdownContents: PropTypes.func.isRequired,
		position: PropTypes.string,
		dropdownContainerClassName: PropTypes.string,
	};

	state = {
		showDropdown: false,
	};

	componentDidUpdate(prevProps, prevState) {
		if (!prevState.showDropdown && this.state.showDropdown) {
			document.addEventListener('click', this.handleDocumentClick);
		} else if (!this.state.showDropdown) {
			document.removeEventListener('click', this.handleDocumentClick);
		}
	}

	componentWillUnmount() {
		document.removeEventListener('click', this.handleDocumentClick);
	}

	handleClick = e => {
		e.preventDefault();
		this.setState(prevState => ({ showDropdown: !prevState.showDropdown }));
		if (this.props.onClick) this.props.onClick(e);
	};

	handleDocumentClick = e => {
		e.preventDefault();
		this.setState({ showDropdown: false });
	};

	render() {
		const {
			className,
			children,
			renderDropdownContents,
			position,
			dropdownContainerClassName,
		} = this.props;
		const { showDropdown } = this.state;

		return (
			<div className="dropdown-button-container">
				<button className={className} onClick={this.handleClick}>
					{children}
				</button>
				{showDropdown ?
					<div
						className={`dropdown-container ${position === 'above' ? 'dropdown-container-above' : null} ${dropdownContainerClassName}`}
						onClick={() => this.setState({ showDropdown: false })}
					>
						{renderDropdownContents()}
					</div> : null}
			</div>
		);
	}
}
