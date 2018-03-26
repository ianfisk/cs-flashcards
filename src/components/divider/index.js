import React from 'react';
import './styles.css';

const Divider = ({ margin = 8 }) => (
	<div className="divider" style={{ marginTop: margin, marginBottom: margin }} />
);

export default Divider;
