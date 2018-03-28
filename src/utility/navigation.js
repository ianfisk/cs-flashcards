import { flashcardStatus } from '../constants';

// Search from startIndex (inclusive) to the end of the array for the first card
// that is not hidden. Loop to the front if necessary.
export function getNextFlashcard(flashcards, startIndex) {
	let flashcardIndex = startIndex % flashcards.length;
	for (let i = 1; i < flashcards.length; i++) {
		if (flashcards[flashcardIndex].status !== flashcardStatus.dontShow) {
			break;
		}

		flashcardIndex = (flashcardIndex + 1) % flashcards.length;
	}

	return flashcards[flashcardIndex];
}

// Search from startIndex (inclusive) to the beginning of the array for the first card
// that is not hidden. Loop to the end if necessary.
export function getPreviousFlashcard(flashcards, startIndex) {
	if (startIndex < 0) {
		startIndex = flashcards.length - 1;
	}

	let flashcardIndex = startIndex;
	for (let i = 1; i < flashcards.length; i++) {
		if (flashcards[flashcardIndex].status !== flashcardStatus.dontShow) {
			break;
		}

		flashcardIndex -= 1;
		if (flashcardIndex < 0) {
			flashcardIndex = flashcards.length - 1;
		}
	}

	return flashcards[flashcardIndex];
}
