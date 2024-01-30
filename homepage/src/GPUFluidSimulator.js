/*
http://graphics.cs.cmu.edu/nsp/course/15-464/Fall09/papers/StamFluidforGames.pdf
https://matthias-research.github.io/pages/tenMinutePhysics/17-fluidSim.pdf
*/

import FullScreenQuad from './Quad';
import Shaders from './Shaders.js';

import TEXTURE_VERTEX_SOURCE from "./shaders/fluid/textureVertex.js";
import ADD_SOURCE_FRAGMENT_SOURCE from "./shaders/fluid/addSource.js";
import DIFFUSE_FRAGMENT_SOURCE from "./shaders/fluid/diffuse.js";
import ADVECT_FRAGMENT_SOURCE from "./shaders/fluid/advect.js";
import PROJECT_FRAGMENT_SOURCE from "./shaders/fluid/project.js";

const DENS_DIFF = 0.0001;
const VEL_DIFF = 0.0;
const K = 16;

const hslToRgb = (h, s, v) => {
	h *= 6;
	return [0, 2, 4].map((i) => {
		const d = Math.min(Math.abs(h - i), Math.abs(h - (i+6)));
		const x = 1 - Math.min(1, Math.max(0, d - 1));
		return v * ((1 - s) + x * s);
	});
}

const getRandomFluidColor = () => hslToRgb(Math.random(), 1, 1);

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
var addSourceProgram, diffuseProgram, advectProgram, projectProgram;
function initialize(gl) {
	addSourceProgram = Shaders.compileProgram(gl, TEXTURE_VERTEX_SOURCE, ADD_SOURCE_FRAGMENT_SOURCE);
	diffuseProgram = Shaders.compileProgram(gl, TEXTURE_VERTEX_SOURCE, DIFFUSE_FRAGMENT_SOURCE);
	advectProgram = Shaders.compileProgram(gl, TEXTURE_VERTEX_SOURCE, ADVECT_FRAGMENT_SOURCE);
	projectProgram = Shaders.compileProgram(gl, TEXTURE_VERTEX_SOURCE, PROJECT_FRAGMENT_SOURCE);

	initialized = true;
}

class GPUFluidSimulator {
	constructor(gl, w, h) {
		if (!initialized) {
			initialize(gl);
		}

		this.gl = gl;
		this.init = 1
		this.t = 0;
		this.n = 0;
		this.color = getRandomFluidColor();
		
		this.mouseVel = [0, 1];
		this.mousePos = [0, 0];
		this.mouseDown = false;

		this.dens = [
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
		];
		this.densIndex = 0;

		this.vel = [
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
		];
		this.velIndex = 0;

		this.divp = [
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
			createTextureFramebuffer(gl),
		];
		this.divpIndex = 0;

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
		
		for (let arr of [this.dens, this.vel, this.divp]) {
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

		this.init = 1;
		this.w = w;
		this.h = h;
	}

	_renderToTargetAndCycle(target, targetIndexName) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, target[(this[targetIndexName] + 2) % 3][1]);
		FullScreenQuad.renderGeometry(this.gl);
		this[targetIndexName] = (this[targetIndexName] + 2) % 3;
	}

	_diffuse(dt, target, targetIndexName, diff) {
		if (diff <= 0) {return;}

		const gl = this.gl;
		
		gl.useProgram(diffuseProgram);
		this._setFluidUniforms(diffuseProgram);
		gl.uniform1f(gl.getUniformLocation(diffuseProgram, "a"), dt * diff * this.w * this.h);
		gl.uniform1i(gl.getUniformLocation(diffuseProgram, "current"), 0);
		gl.uniform1i(gl.getUniformLocation(diffuseProgram, "prev"), 1);

		for (let i = 0; i < K; i++) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, target[(this[targetIndexName] + 0) % 3][0]);

			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, target[(this[targetIndexName] + 1) % 3][0]);
			
			this._renderToTargetAndCycle(target, targetIndexName);
		}
			
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	_advect(dt, target, targetIndexName) {
		const gl = this.gl;
		const dt0 = dt * Math.min(this.w, this.h);

		gl.useProgram(advectProgram);
		this._setFluidUniforms(advectProgram);
		gl.uniform1i(gl.getUniformLocation(advectProgram, "current"), 0);
		gl.uniform2f(gl.getUniformLocation(advectProgram, "dt0"), dt0, dt0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, target[(this[targetIndexName] + 0) % 3][0]);
		
		this._renderToTargetAndCycle(target, targetIndexName);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	_addSource(dt, target, targetIndexName, mode, enabled, r, sourcePos, value) {
		const gl = this.gl;
		
		gl.useProgram(addSourceProgram);
		this._setFluidUniforms(addSourceProgram);
		this._setFluidTextures();
		gl.uniform2fv(gl.getUniformLocation(addSourceProgram, "sourcePos"), sourcePos);
		gl.uniform4fv(gl.getUniformLocation(addSourceProgram, "sourceValue"), value);
		gl.uniform1i(gl.getUniformLocation(addSourceProgram, "addSource"), enabled);
		gl.uniform1f(gl.getUniformLocation(addSourceProgram, "r"), r);
		gl.uniform1i(gl.getUniformLocation(addSourceProgram, "init"), this.init);
		gl.uniform1i(gl.getUniformLocation(addSourceProgram, "target"), 0);
		gl.uniform1i(gl.getUniformLocation(addSourceProgram, "mode"), mode);
		gl.uniform1f(gl.getUniformLocation(addSourceProgram, "t"), this.t / 10);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, target[(this[targetIndexName] + 0) % 3][0]);

		this._renderToTargetAndCycle(target, targetIndexName);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
	}

	_addDensitySource(dt) {
		this._addSource(dt, this.dens, "densIndex", 1, this.mouseDown, 4.0, this.mousePos, [
			this.color[0], this.color[1], this.color[2], 1
		]);
	}

	_diffuseDensity(dt) {
		this._diffuse(dt, this.dens, "densIndex", DENS_DIFF);
	}

	_advectDensity(dt) {
		this._advect(dt, this.dens, "densIndex");
	}

	_addVelocitySource(dt) {
		this._addSource(dt, this.vel, "velIndex", 0, this.mouseDown, 4.0, this.mousePos, [
			this.mouseVel[0] * dt, 
			this.mouseVel[1] * dt,
			0, 1
		]);
	}

	_diffuseVelocity(dt) {
		this._diffuse(dt, this.vel, "velIndex", VEL_DIFF);
	}

	_advectVelocity(dt) {
		this._advect(dt, this.vel, "velIndex");
	}

	_project(dt) {
		const gl = this.gl;

		gl.useProgram(projectProgram);
		this._setFluidTextures();
		this._setFluidUniforms(projectProgram);
		gl.uniform1f(gl.getUniformLocation(projectProgram, "h"), 1 / Math.min(this.w, this.h));
		gl.uniform1i(gl.getUniformLocation(projectProgram, "pass"), 0);

		this._renderToTargetAndCycle(this.divp, "divpIndex");

		gl.uniform1i(gl.getUniformLocation(projectProgram, "pass"), 1);
		gl.uniform1i(gl.getUniformLocation(projectProgram, "inputTexture"), 4);
		for (let i = 0; i < K; i++) {
			gl.activeTexture(gl.TEXTURE4);
			gl.bindTexture(gl.TEXTURE_2D, this.divp[this.divpIndex][0]);

			this._renderToTargetAndCycle(this.divp, "divpIndex");
		}

		gl.uniform1i(gl.getUniformLocation(projectProgram, "pass"), 2);
		
		gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, this.divp[this.divpIndex][0]);

		this._renderToTargetAndCycle(this.vel, "velIndex");

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	update(dt) {
		const gl = this.gl;

		if (this.mouseDown) {
			if (!this.wasMouseDown) {
				this.color = getRandomFluidColor();
			}
		}
		this.wasMouseDown = this.mouseDown;

		this.t += dt;
		const n = Math.ceil(this.t / 2);
		if (this.n < n) {
			this.n = n;

			this.addColor = getRandomFluidColor();
			
			const side = Math.round(Math.random());
			if (Math.round(Math.random()) == 0) {
				this.addPos = [
					side * this.w,
					Math.random() * this.h
				];
			} else {
				this.addPos = [
					Math.random() * this.w,
					side * this.h
				];
			}
			
			this.addVel = [
				(this.w / 2) - this.addPos[0],
				(this.h / 2) - this.addPos[1]
			];
			this.addVel = [
				Math.random(),
				Math.random()
			];
			const l = Math.sqrt(Math.pow(this.addVel[0], 2) + Math.pow(this.addVel[1], 2));
			const m = .3 + Math.random() * .4;
			this.addVel = [(this.addVel[0] / l) * m, (this.addVel[1] / l) * m];
		}

		gl.viewport(0, 0, this.w, this.h);
		this._addDensitySource(dt);
		this._diffuseDensity(dt);
		this._advectDensity(dt);
		
		this._addVelocitySource(dt);
		this._diffuseVelocity(dt);
		this._advectVelocity(dt);
		this._project(dt);

		this.init = 0
	}

	render() {
		const gl = this.gl;

		this._setFluidTextures();

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.getDensityTexture());
		// gl.bindTexture(gl.TEXTURE_2D, this.getVelocityTexture());

		FullScreenQuad.render(gl);
	}

	getDensityTexture() {
		return this.dens[this.densIndex][0];
	}

	getVelocityTexture() {
		return this.vel[this.velIndex][0];
	}
}

export default GPUFluidSimulator;