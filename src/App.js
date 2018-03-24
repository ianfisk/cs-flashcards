import React, { PureComponent } from 'react';
import shuffle from './utility/shuffle';
import { flashcardStatus } from './constants';
import { flashcardManager, stateManager } from './flashcard-db';
import './App.css';

class App extends PureComponent {
	state = {
		flashcards: null,
	};

	componentDidMount() {
		this.initializeFlashcards();
	}

	async initializeFlashcards() {
		const [shuffledFlashcardIds, savedFlashcards] = await Promise.all([
			stateManager.getShuffledFlashcardIds(),
			flashcardManager.getFlashcards()
		]);

		const shuffledFlashcards = shuffledFlashcardIds.length && savedFlashcards.length
			? shuffleSavedFlashcards(savedFlashcards, shuffledFlashcardIds)
			: await getAndSaveFlashcards();
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload.
				</p>
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

export default App;
