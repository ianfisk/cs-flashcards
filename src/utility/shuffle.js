export default function shuffle(array) {
	if (!array || array.length === 0) {
		return array;
	}

	const copiedArray = [...array];
	for (let i = copiedArray.length; i > 0; i--) {
		const randomIndex = getRandomInt(0, i);
		const swap = copiedArray[randomIndex];
		copiedArray[randomIndex] = copiedArray[i - 1];
		copiedArray[i - 1] = swap;
	}

	return copiedArray;
}

function getRandomInt(lowerBound, upperBound) {
	return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
}
