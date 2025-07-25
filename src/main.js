import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );
// control camara
const controlesCamara = new OrbitControls( camera, renderer.domElement );


// camara
camera.position.z = 2.5;
camera.position.y = 2;
camera.position.x = 8;


// Luz
const luzAmbiente = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( luzAmbiente );

// Ver grid

const gridHelper = new THREE.GridHelper( 30, 130 );
//scene.add( gridHelper );

// cielo
const cielo = new Sky();
        
        cielo.scale.setScalar( 10000 );

				const cieloParametro = cielo.material.uniforms;

				cieloParametro[ 'turbidity' ].value = 10;
				cieloParametro[ 'rayleigh' ].value = 1.5;
				cieloParametro[ 'mieCoefficient' ].value = 0.005;
				cieloParametro[ 'mieDirectionalG' ].value = 0.8;

scene.add( cielo );

// Mar
let mar;
      //      const texturaMar = new THREE.TextureLoader().load('/mar.png');
      //      texturaMar.wrapS = THREE.RepeatWrapping;
      //      texturaMar.wrapT = THREE.RepeatWrapping;
      //      texturaMar.repeat.set(30, 30); 
      //      
      //      const mar = new THREE.Mesh(
      //        new THREE.BoxGeometry(300, 1, 300),
      //        new THREE.MeshBasicMaterial({ map: texturaMar })
      //      );
      //      mar.position.y = -1;
      //      scene.add( mar );

const marGeometria = new THREE.PlaneGeometry( 10000, 10000 );

				mar = new Water(
					marGeometria,
					{
						textureWidth: 32,
						textureHeight: 32,
						waterNormals: new THREE.TextureLoader().load( '/mar.png', function ( texture ) {

							texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

						} ),
						sunDirection: new THREE.Vector3(),
						sunColor: 0xffffff,
						waterColor: 0x245ff0,
						distortionScale: 1.5,
						fog: scene.fog !== undefined
					}
				);

				mar.rotation.x = - Math.PI / 2;
        mar.position.y = -0.5;
        mar.material.uniforms.size.value = 5.0; 
        mar.material.uniforms.distortionScale.value = 5.5; 
				scene.add( mar );


// Luz del sol

const luzSol = new THREE.DirectionalLight( 0xffffff, 1.5 );
luzSol.castShadow = true;
scene.add( luzSol );

const parametrosSol = {
  elevacion: -1,
  azimut: 270
};

function actualizarSol() {
  const phi = THREE.MathUtils.degToRad(90 - parametrosSol.elevacion);
  const theta = THREE.MathUtils.degToRad(parametrosSol.azimut);
  luzSol.position.setFromSphericalCoords(10, phi, theta);
  const sol = new THREE.Vector3();
  sol.setFromSphericalCoords(10, phi, theta);

  cielo.material.uniforms['sunPosition'].value.copy(sol);
}
actualizarSol();


// cargar modelo de Lapras en el objeto Lapras
const loader = new GLTFLoader();
loader.load( '/lapras_shiny.glb', ( gltf ) => {
  const modeloLapras = gltf.scene;
  modeloLapras.scale.set(0.01, 0.01, 0.01); 
  modeloLapras.position.set(0, -0.95, 0); 
  modeloLapras.rotation.y = Math.PI / 1; 
  scene.add( modeloLapras );
  lapras.add(modeloLapras); 
});


// Lapras
const lapras = new THREE.Mesh(
  
);
 scene.add( lapras );
// velociad de flotar
let tiempoFlotar = 0;


// control tecla

const teclas = {};

window.addEventListener("keydown", (event) => {
  teclas[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  teclas[event.key] = false;
});



function animate() {

  tiempoFlotar += 0.02; 
  lapras.rotation.x = Math.sin(tiempoFlotar) * 0.1; 

  const velocidadLapras = 0.03;
  if (teclas["ArrowUp"]) {
    lapras.position.x -= Math.sin(lapras.rotation.y) * velocidadLapras;
    lapras.position.z -= Math.cos(lapras.rotation.y) * velocidadLapras;
  }
  if (teclas["ArrowDown"]) {
    lapras.position.x += Math.sin(lapras.rotation.y) * velocidadLapras;
    lapras.position.z += Math.cos(lapras.rotation.y) * velocidadLapras;
  }
  if (teclas["ArrowLeft"]) {
    lapras.rotation.y -= velocidadLapras;
  }
  if (teclas["ArrowRight"]) {
    lapras.rotation.y += velocidadLapras;
  }

  camera.lookAt( lapras.position ); 
  renderer.render( scene, camera );

  mar.material.uniforms[ 'time' ].value += 1.0 / 60.0;


}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

