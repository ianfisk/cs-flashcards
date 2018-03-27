export function copyToClipboard(value) {
	const isIos = deviceIsIos();
	const el = document.createElement(isIos ? 'textarea' : 'input');
	el.style.position = 'absolute';
	el.style.top = '100%';
	el.value = value;
	document.body.appendChild(el);

	if (isIos) {
		const range = document.createRange();
		range.selectNodeContents(el);

		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);

		el.setSelectionRange(0, value.length);
	} else {
		el.select();
	}

	document.execCommand('copy');
	document.body.removeChild(el);
}

function deviceIsIos() {
	return navigator.userAgent.match(/ipad|ipod|iphone/i);
}
