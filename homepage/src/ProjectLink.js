import './css/ProjectLink.css'

function ProjectLink(props) {
	return (
		<li className='projectLink'>
			<p>
			<a href={props.link}>{props.name}</a>
			</p>
		</li>
	)
}

export default ProjectLink;
