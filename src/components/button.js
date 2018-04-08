import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import 'materialize-css';
import classNames from 'classnames';
import { buttonTypes } from '../constants';

export default class Button extends PureComponent {
	static propTypes = {
		disabled: PropTypes.bool,
		waveColor: PropTypes.oneOf(['default', 'light', 'red', 'yellow', 'orange', 'purple', 'green', 'teal']),
		floating: PropTypes.bool,
		flat: PropTypes.bool,
		large: PropTypes.bool,
		small: PropTypes.bool,
	};

	static defaultProps = {
		waveColor: 'light',
	};

	render() {
		const { children, className, disabled, waveColor, ...rest } = this.props;
		const classes = {
			btn: true,
			disabled,
			'waves-effect': true,
			[`waves-${waveColor}`]: !!waveColor,
		};

		if (waveColor !== 'default') {
			classes[`waves-${waveColor}`] = waveColor;
		}

		buttonTypes.forEach(type => {
			if (rest[type]) {
				rest[type] = null;
				classes[`btn-${type}`] = true;
				classes.btn = false;
			}
		});

		return (
			<button {...rest} className={classNames(classes, className)} disabled={!!disabled}>
				{children}
			</button>
		);
	}
}
