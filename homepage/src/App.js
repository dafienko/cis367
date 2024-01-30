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

				<div className='projects'>
					<ul>
						<ProjectLink link="https://student.computing.gvsu.edu/afienkod/cis367/ic1/demo/" name="Triangle" />
						<ProjectLink link="https://student.computing.gvsu.edu/afienkod/cis367/hw1/gasket1.html" name="Gasket" />
					</ul>
				</div>
			
				<div className='credits'>
					<p>
						<a href='http://graphics.cs.cmu.edu/nsp/course/15-464/Fall09/papers/StamFluidforGames.pdf' target='_blank'>Real-Time Fluid Dynamics for Games</a>
					</p>
					<p>Inspired by Apple <i>Drift</i></p>
				</div>
			</div>
		</div>
		

		<Canvas />
	</div>);
}

export default App;
