import React, { PureComponent } from 'react';
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';
import IoNaviconRound from 'react-icons/lib/io/navicon-round';
import DropdownButton from './components/dropdown-button';
import Flashcard from './components/flash-card';
import Divider from './components/divider';
import CardList from './components/card-list';
import { shuffle } from './utility/shuffle';
import { copyToClipboard } from './utility/copy';
import { flashcardStatus } from './constants';
import { flashcardManager, stateManager } from './flashcard-db';
import './App.css';

const initialState = {
	flashcards: null,
	currentFlashcard: 0,
	indexOfNextReviewCard: 0,
	isLoading: true,
};

export default class App extends PureComponent {
	state = initialState;

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
			currentFlashcard: getNextFlashcard(shuffledFlashcards, indexOfCurrentFlashcard !== -1 ? indexOfCurrentFlashcard : 0),
			indexOfNextReviewCard: indexOfNextReviewCard !== -1 ? indexOfNextReviewCard : 0,
		});
	}

	handleGoToNextCard = () => {
		this.setState(prevState => {
			const { flashcards, currentFlashcard } = prevState;
			const nextFlashcard = getNextFlashcard(flashcards, flashcards.findIndex(x => x.id === currentFlashcard.id) + 1);

			stateManager.setCurrentFlashcardId(nextFlashcard.id);

			return { currentFlashcard: nextFlashcard };
		});
	};

	handleGoToPreviousCard = () => {
		this.setState(prevState => {
			const { flashcards, currentFlashcard } = prevState;
			const previousFlashcard = getPreviousFlashcard(flashcards, flashcards.findIndex(x => x.id === currentFlashcard.id) - 1);

			stateManager.setCurrentFlashcardId(previousFlashcard.id);

			return { currentFlashcard: previousFlashcard };
		});
	};

	handleResetState = async e => {
		e.preventDefault();
		if (window.confirm('Are you sure you want to reset all state?')) {
			await Promise.all([
				flashcardManager.clearAll(),
				stateManager.setCurrentFlashcardId(null),
				stateManager.setNextReviewCard(null),
				stateManager.setShuffledFlashcardIds(null),
			]);

			this.setState(initialState, this.initializeState);
		}
	};

	updateCard = card => {
		flashcardManager.putFlashcard(card);

		this.setState(prevState => {
			const { flashcards } = prevState;
			const updatedCards = [...flashcards];
			const cardIndex = updatedCards.findIndex(x => x.id === card.id);
			updatedCards[cardIndex] = card;

			return { flashcards: updatedCards, currentFlashcard: card };
		});
	};

	copyAsJson = () => {
		const mappedCards = this.state.flashcards.map(x => {
			const mappedCard = { ...x };
			delete mappedCard.isEdited;
			return mappedCard;
		});

		copyToClipboard(JSON.stringify(mappedCards));
	};

	renderMenu = () => {
		return (
			<React.Fragment>
				<div className="menu-item"><Link to="/">Home</Link></div>
				<div className="menu-item"><Link to="/known">Known cards</Link></div>
				<div className="menu-item"><Link to="/unknown">Unknown cards</Link></div>
				<div className="menu-item"><Link to="/reviewSoon">Cards to review</Link></div>
				<div className="menu-item"><Link to="/hidden">Hidden cards</Link></div>
				<button className="btn btn-primary" onClick={this.copyAsJson}>Copy cards as JSON</button>
				<Divider />
				<button className="btn btn-danger refresh-button" onClick={this.handleResetState}>Reset</button>
			</React.Fragment>
		);
	};

	render() {
		const { flashcards, currentFlashcard } = this.state;
		const isLoading = !flashcards || !flashcards.length;

		return (
			<Router>
				<div className="app-container">
					<SyncLoader color="#36D7B7" loading={isLoading} />
					{!isLoading &&
						<React.Fragment>
							<div className="menu-button-container">
								<DropdownButton
									className="btn btn-default menu-button"
									dropdownContainerClassName="menu-container"
									renderDropdownContents={this.renderMenu}
									horizontalPosition="left"
								>
									<IoNaviconRound size={30} />
								</DropdownButton>
							</div>
							<Route
								exact
								path="/"
								render={() => (
									<Flashcard
										id={currentFlashcard.id}
										card={currentFlashcard}
										onGoToNextCard={this.handleGoToNextCard}
										onGoToPreviousCard={this.handleGoToPreviousCard}
										updateCard={this.updateCard}
									/>
								)}
							/>
							<Route
								exact
								path="/card/:cardId"
								render={({ match }) => {
									const cardId = parseInt(match.params.cardId, 10);
									const card = flashcards.find(x => x.id === cardId);

									return card ? (
										<Flashcard
											id={card.id}
											card={card}
											updateCard={this.updateCard}
										/>
									) : <div>Card not found</div>;
								}}
							/>
							<Route
								path="/known"
								render={() => (
									<CardList
										header="Known cards"
										cards={flashcards.filter(x => x.status === flashcardStatus.known)}
									/>
								)}
							/>
							<Route
								path="/unknown"
								render={() => (
									<CardList
										header="Unknown cards"
										cards={flashcards.filter(x => x.status === flashcardStatus.unknown)}
									/>
								)}
							/>
							<Route
								path="/hidden"
								render={() => (
									<CardList
										header="Hidden cards"
										cards={flashcards.filter(x => x.status === flashcardStatus.dontShow)}
									/>
								)}
							/>
							<Route
								path="/reviewSoon"
								render={() => (
									<CardList
										header="Cards to review"
										cards={flashcards.filter(x => x.status === flashcardStatus.reviewSoon)}
									/>
								)}
							/>
						</React.Fragment>}
				</div>
			</Router>
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

// Search from startIndex (inclusive) to the end of the array for the first card
// that is not hidden. Loop to the front if necessary.
function getNextFlashcard(flashcards, startIndex) {
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
function getPreviousFlashcard(flashcards, startIndex) {
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
