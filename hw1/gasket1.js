"use strict";

var gl;
var points;

function getRandomArbitrary(min, max) { 
	return Math.random() * (max - min) + min; 
}

window.onload = function init() {
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert( "WebGL isn't available" ); }


    var corners = [
        vec2(-1, -1), // bottom left
        vec2(0, 1), // top
        vec2(1, -1) // bottom right
    ];

	var u = add(corners[0], corners[1]);
    var v = add(corners[0], corners[2]);
    points = [scale(0.25, add(u, v))];

    for (var i = 0; i < 5000; ++i) {
        var j = Math.floor(Math.random() * 3);
        let p = add(points[i], corners[j]);
        p = scale(getRandomArbitrary(.5, 1), p);
        points.push(p);
    }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, points.length );
}
