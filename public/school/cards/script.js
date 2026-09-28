const {
	useEffect,
	useReducer,
	useRef,
	useState,
} = React;

const PHASES = {
	INIT: 'INIT',
	MODE: 'MODE',
	QUESTION: 'QUESTION',
	CHECK: 'CHECK',
	ANSWER: 'ANSWER',
	DONE: 'DONE',
};

const ACTIONS = {
	MODE: 'MODE',
	QUESTION: 'QUESTION',
	CHECK: 'CHECK',
	ANSWER: 'ANSWER',
	RESET: 'RESET',
};

class MockSpeechRecognition {
	async start() {
		await new Promise((resolve) => setTimeout(resolve, 1));
		const answer = prompt();
		const result = {
			results: [
				[
					{ transcript: answer },
				],
			],
		};
		this.onresult(result);
	}
	stop() {}
}

const SpeechRecognitionClass =  location.search.includes('mock_speech_recognition=1')
	? MockSpeechRecognition
	: (window.SpeechRecognition || window.webkitSpeechRecognition);

const defaultCardsText = document.querySelector('#cards-data').textContent.trim();
const defaultCards = parseCards(defaultCardsText);

const legacyStorageKey = 'cards-data';
const legacyCardsData = localStorage.getItem(legacyStorageKey);
if (legacyCardsData) {
	localStorage.setItem(appSettings.storageKey, legacyCardsData);
	localStorage.removeItem(legacyStorageKey);
}

const initialCardsText = (localStorage.getItem(appSettings.storageKey) ?? defaultCardsText).trim();

function parseCards(cardsText) {
	return cardsText
		.split('\n')
		.filter(line => line.trim())
		.map((line) => {
			const firstSeparatorIndex = line.indexOf(':');
			const title = line.slice(firstSeparatorIndex + 1).trim();

			const author = firstSeparatorIndex === -1
				? title
				: line.slice(0, firstSeparatorIndex).trim();

			return { author, title };
		})
		.sort(() => Math.random() - 0.5);
}

function useCompareSpeech({ enabled, correctAnswer, onResult }) {
	useEffect(() => {
		if (!enabled) {
			return;
		}

		if (!SpeechRecognitionClass) {
			return;
		}

		const recognition = new SpeechRecognitionClass();
		recognition.lang = 'ru-RU';
		recognition.interimResults = false;
		recognition.continuous = false;

		let timeoutId = null;
		let cancelled = false;

		function cancel() {
			cancelled = true;
			timeoutId && clearTimeout(timeoutId);

			recognition.onresult = null;
			recognition.onerror = null;
			recognition.onend = null;

			try {
				recognition.stop();
			} catch {}
		}

		function normalize(text) {
			for (const {find, replace } of appSettings.replacements) {
				text = text.replaceAll(find, replace);
			}

			return text
				.toLowerCase()
				.replace(/ё/g, 'е')
				.replace(/[^\p{L}\p{N}\s]/gu, ' ')
				.replace(/\s\S\s/g, ' ')
				.replace(/\s+/g, '')
				.trim()
				.split('')
				.sort()
				.join('')
				.trim();
		}

		new Promise(resolve => {
			timeoutId = setTimeout(() => {
				resolve({ isCorrect: false });
			}, appSettings.questionTimeout);

			recognition.onresult = (event) => {
				const answer = event.results[0][0].transcript;
				const distance = getStringDistance(normalize(answer), normalize(correctAnswer));
				const isCorrect = distance <= appSettings.maxStringDistance;
				resolve({ isCorrect, answer });
			};

			recognition.onerror = (error) => {
				console.error(error);
				resolve({ isCorrect: false, error });
			};

			recognition.onend = () => {
				resolve({ isCorrect: false });
			};

			recognition.start();
		}).then((result) => {
			if (!cancelled) {
				onResult(result);
				cancel();
			}
		});

		return cancel;
	}, [enabled, correctAnswer, onResult]);
}

function createInitialState() {
	const initialCards = parseCards(initialCardsText);

	return {
		phase: PHASES.INIT,
		initialCards,
		activeCards: initialCards,
		currentCard: null,
		useSpeechRecognition: false,
		isCorrect: undefined,
		answer: undefined,
		error: undefined,
	};
}

function reducer(state, action) {
	switch (action.type) {
		case ACTIONS.MODE: {
			return {
				...state,
				phase: PHASES.MODE,
			}
		}
		case ACTIONS.QUESTION: {
			if (state.activeCards.length > 0) {
				const currentIndex = state.activeCards.findIndex(card => card.author === state.currentCard?.author);
				const nextIndex = (currentIndex + 1) % state.activeCards.length;

				return {
					...state,
					phase: PHASES.QUESTION,
					useSpeechRecognition: action.useSpeechRecognition ?? state.useSpeechRecognition,
					currentCard: state.activeCards[nextIndex],
				};
			}

			return {
				...state,
				phase: PHASES.DONE,
				currentCard: null,
			};
		}
		case ACTIONS.CHECK: {
			return {
				...state,
				phase: PHASES.CHECK,
			}
		}
		case ACTIONS.ANSWER: {
			const nextActiveCards = state.activeCards.filter(card => card.author !== state.currentCard?.author);

			if (!action.isCorrect && state.currentCard) {
				nextActiveCards.push(state.currentCard);
			}

			return {
				...state,
				phase: PHASES.ANSWER,
				activeCards: nextActiveCards,
				isCorrect: action.isCorrect,
				answer: action.answer,
				error: action.error,
			};
		}
		case ACTIONS.RESET: {
			const initialCards = action.initialCards ?? state.initialCards;

			return {
				...state,
				phase: PHASES.INIT,
				initialCards: initialCards,
				activeCards: initialCards,
				currentCard: null,
			};
		}
		default: {
			return state;
		}
	}
}

function useCountdown({ enabled, duration, onExpire }) {
	const [countdown, setCountdown] = useState(duration);

	const frameRef = useRef();
	const startRef = useRef();

	useEffect(() => {
		if (!enabled) {
			setCountdown(duration);
			return;
		}

		startRef.current = performance.now();

		function update(now) {
			const elapsed = now - startRef.current;
			const remaining = Math.max(duration - elapsed, 0);
			setCountdown(remaining);

			if (remaining > 0) {
				frameRef.current = requestAnimationFrame(update);
			} else {
				onExpire();
			}
		}

		frameRef.current = requestAnimationFrame(update);
		return () => cancelAnimationFrame(frameRef.current);
	}, [enabled, duration]);

	return countdown;
}

function Content({ state }) {
	const { phase, currentCard, answer, error, useSpeechRecognition } = state;

	function getContent() {
		switch (phase) {
			case PHASES.INIT:
			case PHASES.MODE:
				return <>
					<div className="emoji">🐱</div>
					<div className="title">{appSettings.title}:<br /><strong>{appSettings.subtitle}</strong></div>
				</>;
			case PHASES.QUESTION:
				return <>
					<div className="author">{currentCard.author}</div>
					<div className="title"></div>
					{ useSpeechRecognition && <div className="speech-desc">Слушаю...</div> }
				</>;
			case PHASES.CHECK:
			case PHASES.ANSWER:
				return <>
					<div className="author">{currentCard.author}</div>
					<div className="title">{currentCard.title}</div>
					{ useSpeechRecognition && answer && <div className="speech-desc error">{ 'Твой ответ: ' + answer }</div> }
				</>;
			case PHASES.DONE:
				return <>
					<div className="emoji">🎉</div>
					<div className="title">Все карточки выучены!</div>
				</>;
			default:
				return null;
		}
	}

	return (
		<div className="content">
			{ getContent() }
		</div>
	);
}

function Timer({ state, dispatch }) {
	const { phase, useSpeechRecognition } = state;

	const countdown = useCountdown({
		enabled: phase === PHASES.QUESTION,
		duration: appSettings.questionTimeout,
		onExpire: useSpeechRecognition
			? () => {}
			: () => dispatch({ type: ACTIONS.ANSWER }),
	});

	if (phase !== PHASES.QUESTION) {
		return null;
	}

	return (
		<div className="timer">
			<div className="timer-bar" style={{ width: `${(countdown / appSettings.questionTimeout) * 100}%` }}></div>
		</div>
	);
}

function Buttons({ state, dispatch }) {
	const { phase, useSpeechRecognition } = state;

	function getButtons() {
		switch (phase) {
			case PHASES.INIT:
				return <button className="neutral" onClick={() => dispatch({ type: SpeechRecognitionClass ? ACTIONS.MODE : ACTIONS.QUESTION })}>Начать</button>;
			case PHASES.MODE:
				return <>
					<button className="success" onClick={() => dispatch({ type: ACTIONS.QUESTION, useSpeechRecognition: true })}>Есть микрофон</button>
					<button className="fail" onClick={() => dispatch({ type: ACTIONS.QUESTION, useSpeechRecognition: false })}>Нет микрофона</button>
				</>;
			case PHASES.QUESTION:
				return useSpeechRecognition
					? null
					: <button className="neutral" onClick={() => dispatch({ type: ACTIONS.CHECK })}>Проверить</button>;
			case PHASES.CHECK:
				return <>
					<button className="success" onClick={() => dispatch({ type: ACTIONS.ANSWER, isCorrect: true })}>Знаю</button>
					<button className="fail" onClick={() => dispatch({ type: ACTIONS.ANSWER, isCorrect: false })}>Не знаю</button>
				</>;
			case PHASES.ANSWER:
				return <button className="neutral" onClick={() => dispatch({ type: ACTIONS.QUESTION })}>Дальше</button>;
			case PHASES.DONE:
				return <button className="neutral" onClick={() => dispatch({ type: ACTIONS.RESET })}>Ура!</button>;
			default:
				return null;
		}
	}

	return (
		<div className="buttons">
			{ getButtons() }
		</div>
	);
}

function Card({ state, dispatch }) {
	const { phase, currentCard, isCorrect, useSpeechRecognition } = state;

	useCompareSpeech({
		enabled: useSpeechRecognition && phase === PHASES.QUESTION,
		correctAnswer: currentCard?.title ?? '',
		onResult: ({ isCorrect, answer, error}) => dispatch({ type: ACTIONS.ANSWER, isCorrect, answer, error }),
	});

	const cardClass = useSpeechRecognition && phase === PHASES.ANSWER ? (isCorrect ? 'correct' : 'incorrect') : '';

	return (
		<div className={ `box card ${cardClass}` }>
			<Content state={state} />
			<Timer state={state} dispatch={dispatch} />
			<Buttons state={state} dispatch={dispatch} />
		</div>
	);
}

function Stats({ state }) {
	const { phase, initialCards, activeCards } = state;

	if (phase === PHASES.INIT) {
		return;
	}

	const totalCount = initialCards.length;
	const finishedCount = initialCards.length - activeCards.length;

	return (
		<div className="stats">
			<div className="stats-finished" style={{ width: `${(finishedCount / totalCount) * 100}%` }} />
			<div className="stats-value">{finishedCount} / {totalCount}</div>
		</div>
	);
}

function Editor({ dispatch }) {
	const [ editorValue, setEditorValue ] = useState(initialCardsText);
	const [ isEditorOpen, setIsEditorOpen ] = useState(false);

	function editCards() {
		if (!confirm('Весь прогресс будет утерян. Продолжить?')) {
			return;
		}

		dispatch({ type: ACTIONS.RESET });
		setIsEditorOpen(v => !v);
	}

	function saveCards() {
		const parsedCards = parseCards(editorValue);

		if (parsedCards.length === 0) {
			alert('Список карточек пуст');
			return;
		}

		localStorage.setItem(appSettings.storageKey, editorValue);
		dispatch({ type: ACTIONS.RESET, initialCards: parsedCards });
		setIsEditorOpen(false);
	}

	function resetCards() {
		if (!confirm('Все карточки будут возвращены к первоначальному списку. Продолжить?')) {
			return;
		}

		localStorage.setItem(appSettings.storageKey, defaultCardsText);
		setEditorValue(defaultCardsText);
		dispatch({ type: ACTIONS.RESET, initialCards: defaultCards });
	}

	const buttons = isEditorOpen
		? <>
			<button className="success" onClick={saveCards}>Сохранить</button>
			<button className="fail" onClick={resetCards} disabled={editorValue === defaultCardsText}>Вернуть как было</button>
		</>
		: <button className="neutral" onClick={editCards}>Редактировать карточки</button>

	return (
		<div className="box">
			{ isEditorOpen && <textarea value={editorValue} onChange={e => setEditorValue(e.target.value)} /> }
			<div className="buttons">
				{buttons}
			</div>
		</div>
	);
}

function App() {
	const [ state, dispatch ] = useReducer(reducer, undefined, createInitialState);
	const { phase, useSpeechRecognition } = state;

	useEffect(() => {
		if (!useSpeechRecognition && phase === PHASES.ANSWER) {
			dispatch({ type: ACTIONS.QUESTION });
		}
	}, [phase, useSpeechRecognition]);

	return (
		<div className="app" data-phase={phase.toLowerCase()}>
			<Editor state={state} dispatch={dispatch} />
			<Card state={state} dispatch={dispatch} />
			<Stats state={state} />
		</div>
	);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
