import React, { PureComponent } from 'react';
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import 'materialize-css';
import { SyncLoader } from 'react-spinners';
import IoNaviconRound from 'react-icons/lib/io/navicon-round';
import classNames from 'classnames';
import Button from './components/button';
import DropdownButton from './components/dropdown-button';
import Flashcard from './components/flash-card';
import Divider from './components/divider';
import CardList from './components/card-list';
import { shuffle } from './utility/shuffle';
import { getNextFlashcard, getPreviousFlashcard } from './utility/navigation';
import { copyToClipboard } from './utility/copy';
import { flashcardStatus } from './constants';
import { flashcardManager, stateManager } from './flashcard-db';
import './App.css';

const initialState = {
	flashcards: null,
	currentFlashcard: null,
	indexOfNextReviewCard: 0
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

		const shuffledFlashcards =
			shuffledFlashcardIds.length && savedFlashcards.length
				? shuffleSavedFlashcards(savedFlashcards, shuffledFlashcardIds)
				: await getAndSaveFlashcards();

		const indexOfCurrentFlashcard = shuffledFlashcards.findIndex(
			x => x.id === currentFlashcardId
		);
		const indexOfNextReviewCard = shuffledFlashcards.findIndex(
			x => x.id === nextReviewCardId
		);
		this.setState({
			flashcards: shuffledFlashcards,
			currentFlashcard: getNextFlashcard(
				shuffledFlashcards,
				indexOfCurrentFlashcard !== -1 ? indexOfCurrentFlashcard : 0
			),
			indexOfNextReviewCard:
				indexOfNextReviewCard !== -1 ? indexOfNextReviewCard : 0
		});
	}

	handleGoToNextCard = () => {
		this.setState(prevState => {
			const { flashcards, currentFlashcard } = prevState;
			const nextFlashcard = getNextFlashcard(
				flashcards,
				flashcards.findIndex(x => x.id === currentFlashcard.id) + 1
			);

			stateManager.setCurrentFlashcardId(nextFlashcard.id);

			return { currentFlashcard: nextFlashcard };
		});
	};

	handleGoToPreviousCard = () => {
		this.setState(prevState => {
			const { flashcards, currentFlashcard } = prevState;
			const previousFlashcard = getPreviousFlashcard(
				flashcards,
				flashcards.findIndex(x => x.id === currentFlashcard.id) - 1
			);

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
				stateManager.setShuffledFlashcardIds(null)
			]);

			this.setState(initialState, this.initializeState);
		}
	};

	updateCard = ({ card, shouldSetCurrentFlashcard = true }) => {
		flashcardManager.putFlashcard(card);

		this.setState(prevState => {
			const { flashcards } = prevState;
			const updatedCards = [...flashcards];
			const cardIndex = updatedCards.findIndex(x => x.id === card.id);
			updatedCards[cardIndex] = card;

			return shouldSetCurrentFlashcard
				? { flashcards: updatedCards, currentFlashcard: card }
				: { flashcards: updatedCards };
		});
	};

	copyAsJson = () => {
		const mappedCards = this.state.flashcards.map(x => {
			const mappedCard = { ...x };

			delete mappedCard.isEdited;
			delete mappedCard.status;
			return mappedCard;
		});

		copyToClipboard(JSON.stringify(mappedCards));
	};

	mergeNewCards = async () => {
		this.setState({ flashcards: null });
		const newShuffledCards = await mergeNewCardsIntoLocalState(
			this.state.flashcards
		);
		this.setState({
			flashcards: newShuffledCards,
			currentFlashcard: getNextFlashcard(newShuffledCards, 0)
		});
	};

	renderMenu = isMovingIn => {
		const containerClasses = {
			'hamburger-menu-animation-container': true,
			'hamburger-menu-in': isMovingIn,
			'hamburger-menu-out': this.isShowingMenu && !isMovingIn
		};

		this.isShowingMenu = isMovingIn;

		return (
			<div className={classNames(containerClasses)}>
				<div className="menu-item">
					<Link to="/">Home</Link>
				</div>
				<div className="menu-item">
					<Link to="/known">Known cards</Link>
				</div>
				<div className="menu-item">
					<Link to="/unknown">Unknown cards</Link>
				</div>
				<div className="menu-item">
					<Link to="/reviewSoon">Cards to review</Link>
				</div>
				<div className="menu-item">
					<Link to="/hidden">Hidden cards</Link>
				</div>
				<div className="menu-item">
					<Link to="/edited">Edited cards</Link>
				</div>
				<Button className="menu-button" onClick={this.copyAsJson}>
					Copy cards as JSON
				</Button>
				<Button className="menu-button" onClick={this.mergeNewCards}>
					Merge new cards
				</Button>
				<Divider />
				<Button
					className="red darken-1 refresh-button"
					onClick={this.handleResetState}
				>
					Reset
				</Button>
			</div>
		);
	};

	render() {
		const { flashcards, currentFlashcard } = this.state;
		const isLoading = !flashcards || !flashcards.length;
		const cardFilters = {
			known: {
				header: 'Known cards',
				getCards: () =>
					flashcards.filter(x => x.status === flashcardStatus.known)
			},
			unknown: {
				header: 'Unknown cards',
				getCards: () =>
					flashcards.filter(x => x.status === flashcardStatus.unknown)
			},
			reviewSoon: {
				header: 'Cards to review',
				getCards: () =>
					flashcards.filter(x => x.status === flashcardStatus.reviewSoon)
			},
			hidden: {
				header: 'Hidden cards',
				getCards: () =>
					flashcards.filter(x => x.status === flashcardStatus.dontShow)
			},
			edited: {
				header: 'Edited cards',
				getCards: () => flashcards.filter(x => x.isEdited)
			}
		};

		return (
			<Router>
				<div className="app-container">
					<SyncLoader color="#36D7B7" loading={isLoading} />
					{!isLoading && (
						<React.Fragment>
							<div className="menu-button-container">
								<DropdownButton
									className="deep-orange darken-2 hamburger-button"
									dropdownContainerClassName="menu-container z-depth-2"
									renderDropdownContents={this.renderMenu}
									horizontalPosition="left"
									floating
									large
								>
									<IoNaviconRound size={24} />
								</DropdownButton>
							</div>
							<Route
								exact
								path="/"
								render={() => (
									<div className="home-card-container">
										<Flashcard
											id={currentFlashcard.id}
											card={currentFlashcard}
											onGoToNextCard={this.handleGoToNextCard}
											onGoToPreviousCard={this.handleGoToPreviousCard}
											updateCard={card => this.updateCard({ card })}
										/>
										<div className="current-card-index">
											{`${flashcards.findIndex(
												x => x.id === currentFlashcard.id
											) + 1}/${flashcards.length}`}
										</div>
									</div>
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
											updateCard={card =>
												this.updateCard({
													card,
													shouldSetCurrentFlashcard: false
												})
											}
										/>
									) : (
										<div>Card not found</div>
									);
								}}
							/>
							{Object.keys(cardFilters).map(path => (
								<Route
									key={path}
									path={`/${path}`}
									render={() => (
										<CardList
											key={path}
											header={cardFilters[path].header}
											cards={cardFilters[path].getCards()}
										/>
									)}
								/>
							))}
						</React.Fragment>
					)}
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

async function mergeNewCardsIntoLocalState(existingFlashcards) {
	// merge card updates by adding cards from flashcards.json that are not in the local db
	const uneditedCards = await import('./flashcards.json');
	const existingFlashcardsMap = existingFlashcards.reduce((map, card) => {
		map[card.id] = card;
		return map;
	}, {});

	for (let i = 0; i < uneditedCards.length; i++) {
		const uneditedCard = uneditedCards[i];
		if (!existingFlashcardsMap[uneditedCard.id]) {
			await flashcardManager.putFlashcard({ ...uneditedCard, status: null });
		}
	}

	const allCards = await flashcardManager.getFlashcards();
	const shuffledFlashcards = shuffle(allCards);
	await stateManager.setShuffledFlashcardIds(shuffledFlashcards.map(x => x.id));
	return shuffledFlashcards;
}

async function getAndSaveFlashcards() {
	const [flashcards] = await Promise.all([
		import('./flashcards.json'),
		flashcardManager.clearAll()
	]);

	// don't insert shuffled flashcards since the IndexedDB will sort them by id anyways
	for (let i = 0; i < flashcards.length; i++) {
		await flashcardManager.putFlashcard({ ...flashcards[i], status: null });
	}

	const shuffledFlashcards = shuffle(flashcards);
	await stateManager.setShuffledFlashcardIds(shuffledFlashcards.map(x => x.id));
	return shuffledFlashcards;
}
