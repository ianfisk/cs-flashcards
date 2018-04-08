import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class DoubleTap extends PureComponent {
	static propTypes = {
		onDoubleTap: PropTypes.func.isRequired,
		className: PropTypes.string
	};

	timeOfLastClick = null;

	handleClick = e => {
		e.preventDefault();

		const now = Date.now();
		if (this.timeOfLastClick && now - this.timeOfLastClick < 500) {
			this.props.onDoubleTap(e);
		}

		this.timeOfLastClick = now;
	};

	render() {
		const { className, children } = this.props;

		return (
			<span className={className} onClick={this.handleClick}>
				{children}
			</span>
		);
	}
}
