import idb from 'idb';

// Each flashcard in the flashcards object store should have the shape
// {
//		id: integer,
//		front: string,
//		back: string,
//		status: flashcardStatus | null
// }
//
// The currentState object store maintains this data:
// {
//		currentCardId: integer,
//		nextReviewCardId: integer,
//		shuffledIds: array
// }
const dbPromise = idb.open('flashcard-db', 2, upgradeDB => {
	let flashcardsObjectStore;
	if (upgradeDB.oldVersion < 1) {
		upgradeDB.createObjectStore('currentState');
		flashcardsObjectStore = upgradeDB.createObjectStore('flashcards', { keyPath: 'id' });
		flashcardsObjectStore.createIndex('status', 'status', { unique: false });
	}
	if (upgradeDB.oldVersion < 2) {
		flashcardsObjectStore = upgradeDB.transaction.objectStore('flashcards');
		flashcardsObjectStore.createIndex('isEdited', 'isEdited', { unique: false });
	}
});

export const flashcardManager = {
	async getFlashcards() {
		const db = await dbPromise;
		const tx = db.transaction('flashcards');
		const store = tx.objectStore('flashcards');

		return getValuesFromCursor(tx, store, reverseMapCard);
	},

	async putFlashcard(flashcard) {
		const db = await dbPromise;
		const tx = db.transaction('flashcards', 'readwrite');
		const store = tx.objectStore('flashcards');

		store.put(mapCard(flashcard));

		return tx.complete;
	},

	async clearAll() {
		const db = await dbPromise;
		const tx = db.transaction('flashcards', 'readwrite');
		const store = tx.objectStore('flashcards');

		store.clear();

		return tx.complete;
	}
};

export const stateManager = {
	getCurrentFlashcardId() {
		return getCurrentState('currentCardId');
	},

	setCurrentFlashcardId(id) {
		return setCurrentState('currentCardId', id);
	},

	getNextReviewCardId() {
		return getCurrentState('nextReviewCardId');
	},

	setNextReviewCard(id) {
		return setCurrentState('nextReviewCardId', id);
	},

	async getShuffledFlashcardIds() {
		return await getCurrentState('shuffledIds') || [];
	},

	setShuffledFlashcardIds(ids) {
		return setCurrentState('shuffledIds', ids);
	},
};

async function getValuesFromCursor(tx, objectWithCursor, mapper) {
	const values = [];
	objectWithCursor.iterateCursor(cursor => {
		if (!cursor) return;
		values.push(mapper(cursor.value));
		cursor.continue();
	});

	await tx.complete;
	return values;
}

async function getCurrentState(key) {
	const db = await dbPromise;
	const value = await db
		.transaction('currentState')
		.objectStore('currentState')
		.get(key);

	return value;
}

async function setCurrentState(key, value) {
	const db = await dbPromise;
	const tx = db.transaction('currentState', 'readwrite');
	const store = tx.objectStore('currentState');
	store.put(value, key);
	return tx.complete;
}

function mapCard(card) {
	const dbCard = { ...card };
	if (card.isEdited) {
		dbCard.isEdited = 1;
	}

	return dbCard;
}

function reverseMapCard(dbCard) {
	return { ...dbCard, isEdited: !!dbCard.isEdited };
}
