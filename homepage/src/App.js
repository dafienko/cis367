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
						<ProjectLink link="https://student.computing.gvsu.edu/afienkod/cis367/hw2/" name="Interactive Triangles" />
						<ProjectLink link="https://student.computing.gvsu.edu/afienkod/cis367/hw3/" name="Gasket (Extended)" />
						<ProjectLink link="https://student.computing.gvsu.edu/afienkod/cis367/hw4/" name="Three.js" />
						<ProjectLink link="https://student.computing.gvsu.edu/afienkod/cis367/pixi/" name="PixiJS" />
					</ul>
				</div>
			
				
				<div className='credits'>
					<a href="https://github.com/dafienko/cis367">
						<img id="github-icon" src="./github.png" alt="HTML tutorial"/>
					</a>

					<p>Inspired by Apple <i>Drift</i></p>
					<p>
						<a href='http://graphics.cs.cmu.edu/nsp/course/15-464/Fall09/papers/StamFluidforGames.pdf' target='_blank'>Real-Time Fluid Dynamics for Games</a>
					</p>
				</div>

			</div>
		</div>
		

		<Canvas />
	</div>);
}

export default App;
