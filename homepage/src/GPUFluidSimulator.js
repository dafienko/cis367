import FullScreenQuad from './Quad';
import Shaders from './Shaders.js';

import TEXTURE_VERTEX_SOURCE from "./shaders/fluid/textureVertex.js";
import ADD_DENSITY_SOURCE_FRAGMENT_SOURCE from "./shaders/fluid/addDensitySourceFragment.js";
import ADD_VELOCITY_SOURCE_FRAGMENT_SOURCE from "./shaders/fluid/addVelocitySourceFragment.js";
import DIFFUSE_FRAGMENT_SOURCE from "./shaders/fluid/diffuse.js";
import ADVECT_FRAGMENT_SOURCE from "./shaders/fluid/advect.js";

const DENS_DIFF = 0.000;
const VEL_DIFF = 0.001;

function createTextureFramebuffer(gl) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	const fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	return [texture, fb];
}

let initialized = false;
var addDensitySourceProgram, addVelocitySourceProgram, diffuseProgram, advectProgram;
function initialize(gl) {
	addDensitySourceProgram = Shaders.compileProgram(gl, TEXTURE_VERTEX_SOURCE, ADD_DENSITY_SOURCE_FRAGMENT_SOURCE);
	addVelocitySourceProgram = Shaders.compileProgram(gl, TEXTURE_VERTEX_SOURCE, ADD_VELOCITY_SOURCE_FRAGMENT_SOURCE);
	diffuseProgram = Shaders.compileProgram(gl, TEXTURE_VERTEX_SOURCE, DIFFUSE_FRAGMENT_SOURCE);
	advectProgram = Shaders.compileProgram(gl, TEXTURE_VERTEX_SOURCE, ADVECT_FRAGMENT_SOURCE);

	initialized = true;
}

class GPUFluidSimulator {
	constructor(gl, w, h) {
		if (!initialized) {
			initialize(gl);
		}

		this.gl = gl;
		this.init = 1
		
		this.mousePos = [0, 0];
		this.mouseDown = false;

		this.dens = [
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
		]
		this.densIndex = 0;

		this.vel = [
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
		]
		this.velIndex = 0;

		this.setSize(w, h);
	}

	_setFluidTextures() {
		const gl = this.gl;

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.dens[this.densIndex][0]);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.dens[(this.densIndex + 1) % 3][0]);

		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, this.vel[this.velIndex][0]);

		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, this.vel[(this.velIndex + 1) % 3][0]);
	}

	_setFluidUniforms(program) {
		const gl = this.gl;

		gl.uniform1i(gl.getUniformLocation(program, "dens"), 0);
		gl.uniform1i(gl.getUniformLocation(program, "dens_prev"), 1);
		gl.uniform1i(gl.getUniformLocation(program, "vel"), 2);
		gl.uniform1i(gl.getUniformLocation(program, "vel_prev"), 3);

		gl.uniform2f(gl.getUniformLocation(program, "gridSize"), this.w, this.h);
	}

	setSize(w, h) {
		const gl = this.gl;
		
		for (let arr of [this.dens, this.vel]) {
			for (let pair of arr) {
				gl.bindTexture(gl.TEXTURE_2D, pair[0]);
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA32F,
					w, h, 0,
					gl.RGBA,
					gl.FLOAT,
					null
				);
			}
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		this.w = w;
		this.h = h;
	}

	addDensitySource(dt) {
		const gl = this.gl;
		
		gl.useProgram(addDensitySourceProgram);
		gl.uniform2f(gl.getUniformLocation(addDensitySourceProgram, "sourcePos"), this.mousePos[0], this.mousePos[1]);
		gl.uniform1i(gl.getUniformLocation(addDensitySourceProgram, "addSource"), this.mouseDown);
		gl.uniform1i(gl.getUniformLocation(addDensitySourceProgram, "init"), this.init);
		
		this._setFluidUniforms(addDensitySourceProgram);
		this._setFluidTextures();

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.dens[(this.densIndex + 2) % 3][1])
		FullScreenQuad.renderGeometry(gl);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		this.densIndex = (this.densIndex + 2) % 3;
	}

	diffuseDensity(dt) {
		const gl = this.gl;
		
		gl.useProgram(diffuseProgram);
		this._setFluidUniforms(diffuseProgram);
		gl.uniform1f(gl.getUniformLocation(diffuseProgram, "a"), dt * DENS_DIFF * this.w * this.h);
		gl.uniform1i(gl.getUniformLocation(diffuseProgram, "current"), 0);
		gl.uniform1i(gl.getUniformLocation(diffuseProgram, "prev"), 1);

		for (let i = 0; i < 20; i++) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.dens[(this.densIndex + 0) % 3][0]);

			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.dens[(this.densIndex + 1) % 3][0]);
			
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.dens[(this.densIndex + 2) % 3][1]);
			FullScreenQuad.renderGeometry(gl);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);

			this.densIndex = (this.densIndex + 2) % 3;
		}
	}

	advectDensity(dt) {
		const gl = this.gl;
		
		gl.useProgram(advectProgram);
		this._setFluidUniforms(advectProgram);
		gl.uniform1i(gl.getUniformLocation(advectProgram, "current"), 0);
		let dt0 = dt * Math.min(this.w, this.h);
		gl.uniform2f(gl.getUniformLocation(advectProgram, "dt0"), dt0, dt0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.dens[(this.densIndex + 0) % 3][0]);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.dens[(this.densIndex + 2) % 3][1]);
		FullScreenQuad.renderGeometry(gl);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		this.densIndex = (this.densIndex + 2) % 3;
	}

	addVelocitySource(dt) {
		const gl = this.gl;
		
		gl.useProgram(addVelocitySourceProgram);
		gl.uniform2f(gl.getUniformLocation(addVelocitySourceProgram, "sourcePos"), this.mousePos[0], this.mousePos[1]);
		gl.uniform1i(gl.getUniformLocation(addVelocitySourceProgram, "addSource"), this.mouseDown);
		gl.uniform1i(gl.getUniformLocation(addVelocitySourceProgram, "init"), this.init);
		
		this._setFluidUniforms(addVelocitySourceProgram);
		this._setFluidTextures();
		
		gl.activeTexture(gl.TEXTURE5);
		gl.bindTexture(gl.TEXTURE_2D, this.vel[this.velIndex][0]);
		gl.uniform1i(gl.getUniformLocation(addVelocitySourceProgram, "dens"), 5);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.vel[(this.velIndex + 2) % 3][1])
		FullScreenQuad.renderGeometry(gl);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		this.velIndex = (this.velIndex + 2) % 3;
	}

	diffuseVelocity(dt) {
		const gl = this.gl;
		
		gl.useProgram(diffuseProgram);
		this._setFluidUniforms(diffuseProgram);
		gl.uniform1f(gl.getUniformLocation(diffuseProgram, "a"), dt * VEL_DIFF * this.w * this.h);
		gl.uniform1i(gl.getUniformLocation(diffuseProgram, "current"), 0);
		gl.uniform1i(gl.getUniformLocation(diffuseProgram, "prev"), 1);

		for (let i = 0; i < 20; i++) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.vel[(this.velIndex + 0) % 3][0]);

			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.vel[(this.velIndex + 1) % 3][0]);
			
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.vel[(this.velIndex + 2) % 3][1]);
			FullScreenQuad.renderGeometry(gl);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);

			this.velIndex = (this.velIndex + 2) % 3;
		}
	}

	advectVelocity(dt) {
		const gl = this.gl;
		
		gl.useProgram(advectProgram);
		this._setFluidUniforms(advectProgram);
		gl.uniform1i(gl.getUniformLocation(advectProgram, "current"), 0);
		gl.uniform2f(gl.getUniformLocation(advectProgram, "dt0"), this.w * dt, this.h * dt);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.vel[(this.velIndex + 0) % 3][0]);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.vel[(this.velIndex + 2) % 3][1]);
		FullScreenQuad.renderGeometry(gl);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		this.velIndex = (this.velIndex + 2) % 3;
	}

	update(dt) {
		const gl = this.gl;

		gl.viewport(0, 0, this.w, this.h);
		this.addDensitySource(dt);
		this.diffuseDensity(dt);
		this.advectDensity(dt);
		
		this.addVelocitySource(dt);
		this.diffuseVelocity(dt);
		this.advectVelocity(dt);

		this.init = 0
	}

	render() {
		const gl = this.gl;

		this._setFluidTextures();

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.vel[(this.velIndex + 0) % 3][0]);
		gl.bindTexture(gl.TEXTURE_2D, this.dens[(this.densIndex + 0) % 3][0]);

		FullScreenQuad.render(gl);
	}
}

export default GPUFluidSimulator;