import * as THREE from './three.module.js';

window.THREE = THREE

const terminal = new Terminal()
const fitAddon = new FitAddon.FitAddon();

terminal.loadAddon(fitAddon)

terminal.open(document.querySelector('main'))

fitAddon.fit()

window.terminal = terminal

const localEcho = new LocalEchoController(terminal);

async function repl() {
	try {
		const input = await localEcho.read('> ')
		const result = eval(input)
		localEcho.println(result)
		console.log({input, result})
	} catch(e) {
		console.error(e)
		localEcho.println(e.message)
	}
	repl()
}
localEcho.println("Hello World!")

repl()

var container;
var camera, scene, renderer;
var controller;

var reticle;

const textLayer = document.querySelector('.xterm-text-layer')
terminal.onRender(() => {
	textLayerTexture.needsUpdate = true
})
const textLayerTexture = new THREE.CanvasTexture(textLayer)

const screenGeometry = new THREE.PlaneGeometry(8, 4)

var material = new THREE.MeshBasicMaterial( { map: textLayerTexture } );
var screen = new THREE.Mesh( screenGeometry, material );

screen.position.z = -4
screen.position.y = 2

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 70, 1, 0.01, 20 );

renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( 256, 128 );
renderer.xr.enabled = true;
document.querySelector('#preview').appendChild( renderer.domElement );

renderer.setClearColor(0xEEEEEE, 1)

scene.add( screen );

controller = renderer.xr.getController( 0 );
// controller.addEventListener( 'select', onSelect );
scene.add( controller );

renderer.setAnimationLoop( render );

let currentSession = null;
function onSessionStarted(session) {
  session.addEventListener('end', onSessionEnded);

  renderer.xr.setSession(session);

  currentSession = session;
}
function onSessionEnded() {
  currentSession.removeEventListener('end', onSessionEnded);

  currentSession = null;
}

navigator.xr && navigator.xr.requestSession('immersive-vr', {
  optionalFeatures: [
    'local-floor',
    'bounded-floor',
  ],
}).then(onSessionStarted);

function render( timestamp, frame ) {
	renderer.render( scene, camera );
}
