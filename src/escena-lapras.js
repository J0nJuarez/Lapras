import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export function crearEscenaLapras() {
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camara.position.set(3, 1, 1);

  const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.5);
  escena.add(luzAmbiente);

  const cielo = new Sky();
  cielo.scale.setScalar(10000);
  const cieloParametro = cielo.material.uniforms;
  cieloParametro['turbidity'].value = 10;
  cieloParametro['rayleigh'].value = 1.5;
  cieloParametro['mieCoefficient'].value = 0.005;
  cieloParametro['mieDirectionalG'].value = 0.8;
  escena.add(cielo);

  const marGeometria = new THREE.PlaneGeometry(10000, 10000);
  const mar = new Water(
    marGeometria,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('/mar.png', texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x245ff0,
      distortionScale: 5.5,
      fog: false
    }
  );
  mar.rotation.x = -Math.PI / 2;
  mar.position.y = -0.5;
  mar.material.uniforms.size.value = 5.0;
  escena.add(mar);

  const luzSol = new THREE.DirectionalLight(0xffffff, 1.5);
  luzSol.castShadow = true;
  escena.add(luzSol);

  const parametrosSol = { elevacion: -1, azimut: 270 };
  function actualizarSol() {
    const phi = THREE.MathUtils.degToRad(90 - parametrosSol.elevacion);
    const theta = THREE.MathUtils.degToRad(parametrosSol.azimut);
    const posicionSol = new THREE.Vector3().setFromSphericalCoords(10, phi, theta);
    luzSol.position.copy(posicionSol);
    cielo.material.uniforms['sunPosition'].value.copy(posicionSol);
  }
  actualizarSol();

  const lapras = new THREE.Group();
  escena.add(lapras);

  const loader = new GLTFLoader();
  loader.load('/lapras_shiny.glb', gltf => {
    const modeloLapras = gltf.scene;
    modeloLapras.scale.set(0.01, 0.01, 0.01);
    modeloLapras.position.set(0, -1.05, 0);
    modeloLapras.rotation.y = Math.PI;
    lapras.add(modeloLapras);
  });


function moverLapras(direccion) {
  const velocidad = 0.02;
  if (direccion === 'arriba') {
    lapras.position.x -= Math.sin(lapras.rotation.y) * velocidad;
    lapras.position.z -= Math.cos(lapras.rotation.y) * velocidad;
  }
  if (direccion === 'abajo') {
    lapras.position.x += Math.sin(lapras.rotation.y) * velocidad;
    lapras.position.z += Math.cos(lapras.rotation.y) * velocidad;
  }
  if (direccion === 'izquierda') {
    lapras.rotation.y -= velocidad;
  }
  if (direccion === 'derecha') {
    lapras.rotation.y += velocidad;
  }
}


  
  let tiempoFlotar = 0;
  const update = (teclas) => {
    tiempoFlotar += 0.02;
    lapras.rotation.x = Math.sin(tiempoFlotar) * 0.1;

    if (teclas["ArrowUp"]) {
      moverLapras('arriba');
    }
    if (teclas["ArrowDown"]) {
        moverLapras('abajo');
    }
    if (teclas["ArrowLeft"]) {
       moverLapras('izquierda');    
    }
    if (teclas["ArrowRight"]) {
       moverLapras('derecha');
    }

    camara.lookAt(lapras.position);
    mar.material.uniforms['time'].value += 1 / 60;
  };

  return { escena, camara, update,moverLapras  };
}
