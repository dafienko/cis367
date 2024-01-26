import FullScreenQuad from './Quad';

const N = 40;
const DIFF = .02;

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

const IX = (x, y) => x + (N + 2) * y;

function setBound(type, d) {
	for (let i = 1; i <= N; i++) {
		d[IX(0, i)] = 0; //d[IX(1, i)] * (type == 1 ? -1 : 1);
		d[IX(N+1, i)] = 0; //d[IX(N, i)] * (type == 1 ? -1 : 1);
		d[IX(i, 0)] = 0; //d[IX(i, 1)] * (type == 2 ? -1 : 1);
		d[IX(i, N+1)] = 0; //d[IX(i, N)] * (type == 2 ? -1 : 1);
	}

	d[IX(0, 0)] = (d[IX(1, 0)] + d[IX(0, 1)]) / 2;
	d[IX(N+1, 0)] = (d[IX(N, 0)] + d[IX(N+1, 1)]) / 2;
	d[IX(0, N+1)] = (d[IX(1, N+1)] + d[IX(0, N)]) / 2;
	d[IX(N+1, N+1)] = (d[IX(N+1, N)] + d[IX(N, N+1)]) / 2;
}

function diffuse(dt, type, diff, next, initial) {
	const a = dt * diff * N * N;
	for (let k = 0; k < 20; k++) {
		for (let x = 1; x <= N; x++) {
			for (let y = 1; y <= N; y++) {
				const up = next[IX(x, y + 1)];
				const down = next[IX(x, y - 1)];
				const left = next[IX(x - 1, y)];
				const right = next[IX(x + 1, y)];
				const init = initial[IX(x, y)];
				next[IX(x, y)] = (init + a * (up + down + left + right)) / (1 + 4 * a);
			}
		}
	}
	setBound(type, next)
}

function advect(dt, type, next, initial, u, v) {
	for (let x = 1; x <= N; x++) {
		for (let y = 1; y <= N; y++) {
			const vel = [u[IX(x, y)], v[IX(x, y)]];
			const p0 = [x - vel[0] * dt, y - vel[1] * dt];
			const i = Math.floor(p0[0]), j = Math.floor(p0[1]);
			const w = p0[0] - i, z = p0[1] - j
			const a = initial[IX(i, j)];
			const b = initial[IX(i + 1, j)];
			const c = initial[IX(i, j + 1)];
			const d = initial[IX(i + 1, j + 1)];
			next[IX(x, y)] = (1 - z)*((1 - w)*a + w*b) + z*((1 - w)*c + w*d);
		}
	}
	setBound(type, next)
}

class FluidSimulator {
	constructor(gl) {
		this.N = N;
		this.gl = gl;
		this.painting = false;
		this.paintAt = [0, 0];

		const size = Math.pow(N + 2, 2);
		this.dens = new Array(size);
		this.prevDens = new Array(size);
		
		this.u = new Array(size);
		this.prevu = new Array(size);
		
		this.v = new Array(size);
		this.prevv = new Array(size);

		this.colors = new Array(size);
		
		for (let i = 0; i < size; i++) {
			this.dens[i] = 0;
			this.prevDens[i] = 0;

			this.u[i] = 0;
			this.prevu[i] = 0;

			this.v[i] = 0;
			this.prevv[i] = 0;

			this.colors[i] = [0, 0, 0];
		}
		
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			N+2, N+2, 0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}

	addDensitySource(dt) {
		this.dens[IX(1, 18)] = 10.0;
		
		if (this.painting) {
			const R = 2;
			for (let x = Math.max(1, this.paintAt[0]-R); x <= Math.min(this.paintAt[0]+R, N); x++) {
				for (let y = Math.max(1, this.paintAt[1]-R); y <= Math.min(this.paintAt[1]+R, N); y++) {
					// this.dens[IX(x, y)] = .5;
				}
			}
		}
	}

	addVelocitySource(dt) {
		this.u[IX(1, 18)] = 200.0;

		if (this.painting) {
			const R = 2;
			const c = this.paintAt;
			const m = 15;
			for (let x = Math.max(1, c[0]-R); x <= Math.min(c[0]+R, N); x++) {
				for (let y = Math.max(1, c[1]-R); y <= Math.min(c[1]+R, N); y++) {
					let delta = [x - c[0], y - c[1]];
					this.u[IX(x, y)] = delta[0] * m;
					this.v[IX(x, y)] = delta[1] * m;
				}
			}
		}
	}

	updateDensity(dt) {
		this.addDensitySource(dt);
		[this.dens, this.prevDens] = [this.prevDens, this.dens];
		diffuse(dt, 0, DIFF, this.dens, this.prevDens); 
		[this.dens, this.prevDens] = [this.prevDens, this.dens];
		advect(dt, 0, this.dens, this.prevDens, this.u, this.v);
	}

	updateVelocity(dt) {
		this.addVelocitySource(dt);

		[this.u, this.prevu] = [this.prevu, this.u];
		[this.v, this.prevv] = [this.prevv, this.v];
		
		diffuse(dt, 1, DIFF, this.u, this.prevu); 
		diffuse(dt, 2, DIFF, this.v, this.prevv); 

		[this.u, this.prevu] = [this.prevu, this.u];
		[this.v, this.prevv] = [this.prevv, this.v];

		advect(dt, 1, this.u, this.prevu, this.prevu, this.prevv)
		advect(dt, 2, this.v, this.prevv, this.prevu, this.prevv)
	}

	getVelocity(x, y) {
		return [this.u[IX(x, y)], this.v[IX(x, y)]];
	}

	getCellData(x, y) {
		return [
			x, y,
			this.prevDens[IX(x, y)].toFixed(2),
			this.dens[IX(x, y)].toFixed(2),
			this.u[IX(x, y)].toFixed(2),
			this.v[IX(x, y)].toFixed(2),
		];
	}

	update(dt) {
		this.updateDensity(dt); 
		this.updateVelocity(dt);
		this.count += 1;
	}

	render() {
		const gl = this.gl;

		let image = new Uint8Array(this.colors.flatMap((_, i) => {
			const normalize = (x) => Math.round(clamp(x, 0, 255));
			const dens = normalize(this.dens[i] * 1000);
			const u = normalize(Math.abs(this.u[i] * 50));
			const v = normalize(Math.abs(this.v[i] * 50));
			return [dens, dens, dens, 255]
		}));

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			N+2, N+2, 0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			image
		);

		FullScreenQuad.render(gl)
	}
}

export default FluidSimulator;