import * as THREE from 'three'; 
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene(); 

const canvas = document.getElementById("canvas");
const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 1000 ); 

const renderer = new THREE.WebGLRenderer({
	canvas
}); 
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 2, 5 );
controls.update();
renderer.setClearColor(0x8afff7);

const onResize = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	camera.aspect = canvas.width / canvas.height;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
window.onresize = onResize
onResize()

const floorWidth = 20;
const floorHeight = 40;
const boxWidth = .9;
const boxHeight = 2;
const boxDepth = .2;

// Load Textures
let textureLoader = new THREE.TextureLoader();

let grass = textureLoader.load('metal.png');
grass.wrapS = THREE.RepeatWrapping;
grass.wrapT = THREE.RepeatWrapping;
grass.repeat.set(floorWidth / 2, floorHeight / 2);

let stone = textureLoader.load('metal.png');
stone.wrapS = THREE.RepeatWrapping;
stone.wrapT = THREE.RepeatWrapping;
stone.repeat.set(boxWidth / 2, boxHeight / 2);
  
// Add a floor to the scene
let floorGeometry = new THREE.PlaneGeometry(floorWidth, floorHeight);
let floorMaterial = new THREE.MeshStandardMaterial({ 
	map: grass,
	metalness: 0.25,
	roughness: 0.75
});
// let floorMaterial = new THREE.MeshStandardMaterial( { color: 0x009900 } );
let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

// A Plane is created standing vertically.
// Let's rotate it so that is lays flat.
floorMesh.position.set( 0, -1, -3 );
floorMesh.rotation.set( -Math.PI/2, 0, 0 );
scene.add(floorMesh);

// Add a box to the scene
let boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
// let boxMaterial = new THREE.MeshStandardMaterial( { color: 0x00ffff });
let boxMaterial = new THREE.MeshStandardMaterial({
	map: stone,
	metalness: 0,
	roughness: 1
  });
  
let boxes = [];
for (let i = 0; i < 14; i++) {
	let boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
	boxMesh.position.set(i - 7, 1, -5);
	boxMesh.receiveShadow = true;
	boxMesh.castShadow = true;
	scene.add(boxMesh);
	boxes.push(boxMesh);
}

var ambient = new THREE.AmbientLight(0x333333);
scene.add(ambient);

// A point light acts like a light bulb, sending light
// in all directions.
var lightIntensity = 10;
var pointLight = new THREE.PointLight(0xffffff, lightIntensity);
pointLight.position.set(-2, 2, -2);
scene.add(pointLight);

// Enable Shadows
// The floor will only receive shadows, but the box can both
// cast and receive shadows.
renderer.shadowMap.enabled = true;
floorMesh.receiveShadow = true;
pointLight.castShadow = true;

function animate() {
	requestAnimationFrame( animate );
	
	for(let i = 0; i < boxes.length; i++) {
		boxes[i].rotateX(Math.PI/(10+i));
	}
   
	controls.update();
	renderer.render( scene, camera );
}

animate();
  
