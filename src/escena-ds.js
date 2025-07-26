import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { crearEscenaLapras } from './escena-lapras.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';




// escena
const escenaDs = new THREE.Scene();
const fondoColor = new THREE.Color(0xfffFF1); 
escenaDs.background = fondoColor;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// camara
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const controlesCamara = new OrbitControls( camera, renderer.domElement );
camera.position.y = 1.9;
camera.position.x = 0.5;
camera.position.z = -2;

//animacion camara
const initialZ = -2;
const finalZ = 1.25;
const duration = 1500; 
let startTime = null;

function animateCameraZ(time) {
  if (!startTime) startTime = time;
  const elapsed = time - startTime;
  const t = Math.min(elapsed / duration, 1); 

  camera.position.z = initialZ + (finalZ - initialZ) * t;
  if (t < 1) {
    requestAnimationFrame(animateCameraZ);
  }
}




  

// importar escena lapras
const { escena: escenaLapras, camara: camaraLapras, update: updateLapras, moverLapras } = crearEscenaLapras();
const renderTargetLapras = new THREE.WebGLRenderTarget(512, 512);

const pantallaDS = new THREE.Mesh(
  new THREE.PlaneGeometry(0.52, 0.39),
  new THREE.MeshBasicMaterial({ map: renderTargetLapras.texture })
);
pantallaDS.position.set(0.005, 0.43, -0.3522);
pantallaDS.rotation.x = -0.61;
//new GUI().add(pantallaDS.rotation, 'x', -Math.PI / 2, Math.PI / 2, 0.01).name('Rotación Pantalla DS');
escenaDs.add(pantallaDS);


const gridHelper = new THREE.GridHelper( 30, 130 );
//escenaDs.add( gridHelper );

// Luz
const luzAmbiente = new THREE.AmbientLight( 0xffffff, 5 );
escenaDs.add( luzAmbiente );


// controles DS

const cruzetacolor = new THREE.MeshBasicMaterial({ color: 0x030303, transparent: true, opacity: 0 });


//cruzeta arriba
const cruzetaArriba = new THREE.Mesh(
  new THREE.BoxGeometry(0.05, 0.017, 0.06),
  cruzetacolor.clone()
);
cruzetaArriba.position.set(-0.435, 0.125, -0.01);
escenaDs.add(cruzetaArriba);  

//cruzeta abajo
const cruzetaAbajo = new THREE.Mesh(
  new THREE.BoxGeometry(0.05, 0.017, 0.06),
  cruzetacolor.clone()
);
cruzetaAbajo.position.set(-0.435, 0.125, 0.108);
escenaDs.add(cruzetaAbajo);

//cruzeta izquierda
const cruzetaIzquierda = new THREE.Mesh(
  new THREE.BoxGeometry(0.06, 0.017, 0.055),
  cruzetacolor.clone()
);
cruzetaIzquierda.position.set(-0.495, 0.125, 0.047);
escenaDs.add(cruzetaIzquierda);

//cruzeta derecha
const cruzetaDerecha = new THREE.Mesh(
  new THREE.BoxGeometry(0.06, 0.017, 0.055),
  cruzetacolor.clone()
);
cruzetaDerecha.position.set(-0.378, 0.125, 0.047);
escenaDs.add(cruzetaDerecha);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// PC

// control tecla


const teclas = {};

window.addEventListener("keydown", (event) => {
  teclas[event.key] = true;

  if (teclas["ArrowUp"]) cruzetaArriba.material.opacity = 0.5;
  if (teclas["ArrowDown"]) cruzetaAbajo.material.opacity = 0.5;
  if (teclas["ArrowLeft"]) cruzetaIzquierda.material.opacity = 0.5;
  if (teclas["ArrowRight"]) cruzetaDerecha.material.opacity = 0.5;
});

window.addEventListener("keyup", (event) => {
  teclas[event.key] = false;

  if (event.key === "ArrowUp") cruzetaArriba.material.opacity = 0 ;
  if (event.key === "ArrowDown") cruzetaAbajo.material.opacity = 0;
  if (event.key === "ArrowLeft") cruzetaIzquierda.material.opacity = 0;
  if (event.key === "ArrowRight") cruzetaDerecha.material.opacity = 0;
});

let direccionClic = null;


// ESTO LO HA PUESTO EN CHANTGPT A PARTIR DEL RATON, QUEDA VER SI FUNCIONA BIEN
function detectarDireccionTouch(x, y) {
  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = -(y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const clickCruDer = raycaster.intersectObject(cruzetaDerecha);
  const clickCruIzq = raycaster.intersectObject(cruzetaIzquierda);
  const clickCruArr = raycaster.intersectObject(cruzetaArriba);
  const clickCruAba = raycaster.intersectObject(cruzetaAbajo);

  if (clickCruDer.length > 0) {
    cruzetaDerecha.material.opacity = 0.5;
    return 'derecha';
  }
  if (clickCruIzq.length > 0) {
    cruzetaIzquierda.material.opacity = 0.5;
    return 'izquierda';
  }
  if (clickCruArr.length > 0) {
    cruzetaArriba.material.opacity = 0.5;
    return 'arriba';
  }
  if (clickCruAba.length > 0) {
    cruzetaAbajo.material.opacity = 0.5;
    return 'abajo';
  }

  return null;
}

// Raton
window.addEventListener('mousedown', (event) => {
  direccionClic = detectarDireccionTouch(event.clientX, event.clientY);
});
window.addEventListener('mouseup', () => {
  direccionClic = null;
  cruzetaDerecha.material.opacity = 0;
  cruzetaIzquierda.material.opacity = 0;
  cruzetaArriba.material.opacity = 0;
  cruzetaAbajo.material.opacity = 0;
});

// Táctil
window.addEventListener('touchstart', (event) => {
  if (event.touches.length > 0) {
    const touch = event.touches[0];
    direccionClic = detectarDireccionTouch(touch.clientX, touch.clientY);
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  direccionClic = null;
  cruzetaDerecha.material.opacity = 0;
  cruzetaIzquierda.material.opacity = 0;
  cruzetaArriba.material.opacity = 0;
  cruzetaAbajo.material.opacity = 0;
});




// modelo ds
const loader = new GLTFLoader();
loader.load( '/nintendo_ds_lite.glb', ( gltf ) => {
  const modeloDs = gltf.scene;
  modeloDs.scale.set(0.01, 0.01, 0.01); 
  escenaDs.add( modeloDs );
});





function animate() {



  controlesCamara.update(); 
  renderer.render( escenaDs, camera );

  if (direccionClic) {
  moverLapras(direccionClic);
}

  updateLapras(teclas);

  renderer.setRenderTarget(renderTargetLapras);
  renderer.render(escenaLapras, camaraLapras);
  renderer.setRenderTarget(null);
}
//animaciones
requestAnimationFrame(animateCameraZ);


window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});