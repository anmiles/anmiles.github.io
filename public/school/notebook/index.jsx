const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
	<React.StrictMode>
		<App data={ data } />
	</React.StrictMode>
);

function App({ data }) {
	React.useEffect(() => {
		document.title = data.title;
	}, []);

	const pages = [
		<IndexPage key={ 1 } title={ data.title } />,
		<Page key={ 2 } />,
		...data.pages.map((page, index) => <ContentPage key={ index + 3 } sections={ page.sections } />),
		<Page key={ 16 } />,
	];

	const pageOrder = [ 16, 1, 14, 3, 2, 15, 4, 13, 12, 5, 10, 7, 6, 11, 8, 9 ]
		.reduce((obj, order, index) => { obj[order] = index; return obj }, {});

	pages.sort((page1, page2) => pageOrder[page1.key] - pageOrder[page2.key]);

	const book = [];

	for (let i = 0; i < pages.length; i+= 4) {
		book.push(
			<div key={ i } className="book">
				{ pages.slice(i, i + 4) }
			</div>
		)
	}

	return book;
}

function Page({ children }) {
	return (
		<div className="page">
			{ children }
		</div>
	);
}

function IndexPage({ title }) {
	return (
		<Page>
			<div>
				<h1>{ title }</h1>
				<div class="actions">
					<Action />
					<Action />
				</div>
			</div>
		</Page>
	);
}

function ContentPage({ sections }) {
	return (
		<Page>
			{ sections.map((section) => <Item key={ section.id } section={ section } />) }
		</Page>
	);
}

function Item({ section }) {
	return (
		<div className="section">
			<div class="title">
				<span className="number">{section.id}.</span>
				<span><span className="text">{ section.title }</span></span>
			</div>
			<ul className="steps">
				{ section.steps.map((step, index) => <li key={ index }>{ step }</li>) }
			</ul>
			<div class="actions">
				<Action>Делай так:</Action>
				<Action />
			</div>
		</div>
	)
}

function Action({ children }) {
	return (
		<div className="action">
			{ children && <span class="text">{ children }</span> }
			<span class="border"></span>
		</div>
	);
}
