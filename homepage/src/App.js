import './css/App.css';

import Canvas  from './Canvas';
import ProjectLink from './ProjectLink';

function App() {
	return (<div className="App">
		<div className='top'>
			<div className='top-container acrylic'>
				<div className='title'>
					<h1>Damien Afienko CIS367</h1>
					<h2>Computer Graphics</h2>
				</div>

				<div className='credits'>
					<p>
						<a href='http://graphics.cs.cmu.edu/nsp/course/15-464/Fall09/papers/StamFluidforGames.pdf' target='_blank'>Real-Time Fluid Dynamics for Games</a>
					</p>
					<p>Inspired by Apple <i>Drift</i></p>
				</div>
			
			</div>
		</div>
		
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
