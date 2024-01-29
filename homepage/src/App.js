import './css/App.css';

import Canvas  from './Canvas';
import ProjectLink from './ProjectLink';

function App() {
	return (<div className="App">
		{/* <div className='title'>
			<h1>Damien Afienko CIS367</h1>
			<h2>Computer Graphics</h2>
		</div> */}
		
		{/* <div className='projects'>
			<h3>Projects</h3>
			<ul>
				<ProjectLink name="project1" />
				<ProjectLink name="project2" />
				<ProjectLink name="project3" />
			</ul>
		</div> */}

		<Canvas />
	</div>);
}

export default App;
