import React, { PureComponent } from 'react';
import { ClimbingBoxLoader } from 'react-spinners';
import Flashcard from './components/flash-card';
import shuffle from './utility/shuffle';
import { flashcardStatus } from './constants';
import { flashcardManager, stateManager } from './flashcard-db';
import './App.css';

export default class App extends PureComponent {
	state = {
		flashcards: null,
		indexOfCurrentFlashcard: 0,
		indexOfNextReviewCard: 0,
	};

	componentDidMount() {
		this.initializeState();
	}

	async initializeState() {
		const [
			currentFlashcardId,
			nextReviewCardId,
			shuffledFlashcardIds,
			savedFlashcards
		] = await Promise.all([
			stateManager.getCurrentFlashcardId(),
			stateManager.getNextReviewCardId(),
			stateManager.getShuffledFlashcardIds(),
			flashcardManager.getFlashcards()
		]);

		const shuffledFlashcards = shuffledFlashcardIds.length && savedFlashcards.length
			? shuffleSavedFlashcards(savedFlashcards, shuffledFlashcardIds)
			: await getAndSaveFlashcards();

		const indexOfCurrentFlashcard = shuffledFlashcards.findIndex(x => x.id === currentFlashcardId);
		const indexOfNextReviewCard = shuffledFlashcards.findIndex(x => x.id === nextReviewCardId);
		this.setState({
			flashcards: shuffledFlashcards,
			indexOfCurrentFlashcard: getNextFlashcardIndex(shuffledFlashcards, indexOfCurrentFlashcard !== -1 ? indexOfCurrentFlashcard : 0),
			indexOfNextReviewCard: indexOfNextReviewCard !== -1 ? indexOfNextReviewCard : 0,
		});
	}

	handleGoToNextCard = () => {
		this.setState(prevState => ({
			indexOfCurrentFlashcard: getNextFlashcardIndex(prevState.flashcards, prevState.indexOfCurrentFlashcard),
		}));
	};

	handleGoToPreviousCard = () => {
		this.setState(prevState => ({
			indexOfCurrentFlashcard: getPreviousFlashcardIndex(prevState.flashcards, prevState.indexOfCurrentFlashcard),
		}));
	};

	updateCard = card => {
		flashcardManager.putFlashcard(card);

		this.setState(prevState => {
			const { flashcards } = prevState;
			const updatedCards = [...flashcards];
			const cardIndex = updatedCards.findIndex(x => x.id === card.id);
			updatedCards[cardIndex] = card;

			return { flashcards: updatedCards };
		});
	};

	render() {
		const { flashcards, indexOfCurrentFlashcard } = this.state;
		const isLoading = !flashcards || !flashcards.length;

		return (
			<div className="app-container">
				<ClimbingBoxLoader color="#36D7B7" loading={isLoading} />
				{!isLoading &&
					<Flashcard
						id={flashcards[indexOfCurrentFlashcard].id}
						card={flashcards[indexOfCurrentFlashcard]}
						onGoToNextCard={this.handleGoToNextCard}
						onGoToPreviousCard={this.handleGoToPreviousCard}
						updateCard={this.updateCard}
					/>}
			</div>
		);
	}
}

function shuffleSavedFlashcards(savedFlashcards, shuffledFlashcardIds) {
	const savedFlashcardsMap = savedFlashcards.reduce((map, card) => {
		map[card.id] = card;
		return map;
	}, {});
	return shuffledFlashcardIds.map(id => savedFlashcardsMap[id]);
}

async function getAndSaveFlashcards() {
	const flashcards = await import('./flashcards.json');
	const shuffledFlashcards = shuffle(flashcards);

	// don't insert shuffled flashcards since the IndexedDB will sort them by id anyways
	for (let i = 0; i < flashcards.length; i++) {
		await flashcardManager.putFlashcard({...flashcards[i], status: null});
	}

	await stateManager.setShuffledFlashcardIds(shuffledFlashcards.map(x => x.id));
	return shuffledFlashcards;
}

function getNextFlashcardIndex(flashcards, startIndex) {
	let flashcardIndex = startIndex;
	for (let i = 1; i < flashcards.length; i++) {
		flashcardIndex = (flashcardIndex + 1) % flashcards.length;
		if (flashcards[flashcardIndex].status !== flashcardStatus.dontShow) {
			break;
		}
	}

	return flashcardIndex;
}

function getPreviousFlashcardIndex(flashcards, startIndex) {
	let flashcardIndex = startIndex;
	for (let i = 1; i < flashcards.length; i++) {
		flashcardIndex -= 1;
		if (flashcardIndex < 0) {
			flashcardIndex = flashcards.length - 1;
		}

		if (flashcards[flashcardIndex].status !== flashcardStatus.dontShow) {
			break;
		}
	}

	return flashcardIndex;
}
