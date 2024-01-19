import React, { useEffect } from 'react';

import './Canvas.css';

const render = (gl) => {
	gl.clear(gl.COLOR_BUFFER_BIT);
}

const init = () => {
	const canvas = document.getElementById('mainCanvas');
	const gl = canvas.getContext("webgl");
	if (!gl) { 
		throw new Error('WebGL unavailable'); 
	}
	
	const onResize = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}
	window.onresize = onResize
	onResize()

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	window.requestAnimationFrame(() => {
		render(gl);
	})
}

function Canvas() {
	useEffect(init, []);

	return (<canvas id="mainCanvas">
		HTML5 not enabled!
	</canvas>);
}

export default Canvas;
