'use strict';

var container;

var lookAtHome = true;
var lookAtAbout = false;
var lookAtPortfolio = false;

var id;

var camera, scene, renderer;

var ambientLight, shadowLight;

var ship, aboutDestination, portfolioDestination;
var group, shipGroup, destinationGroup;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;

var SEPARATION = 60;
var AMOUNTX = 50;
var AMOUNTY = 50;

var fast = 15;
var slow = 750;

init();
animate();

function init() {


  container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x4C8BA8);
  scene.fog = new THREE.FogExp2(0xB3937D, 0.0016);


  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1500);
  camera.position.set(0, 150, 500);
  camera.lookAt(scene.position);

  scene.add(camera);

  group = new THREE.Group();
  group.position.y = -300;
  scene.add(group);

  shipGroup = new THREE.Group();
  scene.add(shipGroup);

  destinationGroup = new THREE.Group();
  group.add(destinationGroup);

  // ISLAND LAYER
  var landGeometry = new THREE.BoxGeometry(90, 550, 90);
  var landMaterial = new THREE.MeshPhongMaterial({ color: 0xCF6A48, shininess: 0 });
  var cube = new THREE.Mesh(landGeometry, landMaterial);
  cube.castShadow = true;
  cube.receiveShadow = true;
  group.add(cube);
  // END ISLAND LAYER

  // SHIP LAYER
  var shipGeometry = new THREE.BoxGeometry(20, 10, 10);
  var shipMaterial = new THREE.MeshPhongMaterial({ color: 0x4D63DB });
  ship = new THREE.Mesh(shipGeometry, shipMaterial);
  ship.position.set(100, 0, 100);
  ship.castShadow = true;
  shipGroup.add(ship);
  // END SHIP LAYER

  // PORTFOLIO LAYER
  var portfolioEmpty = new THREE.BoxGeometry(10, 10, 10);
  portfolioDestination = new THREE.Mesh(portfolioEmpty);
  portfolioDestination.position.set(200, 300, 0);
  destinationGroup.add(portfolioDestination);
  // END PORTFOLIO LAYER

  createLights();

  // pass { antialias: true } when ready to ship
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  renderer.shadowMap.Enabled = true;
  renderer.shadowMapSoft = false;

  container.appendChild(renderer.domElement);

  $(document).on('mousedown', onDocumentMouseDown);
  $(document).on('touchstart', onDocumentTouchStart);
  $(document).on('touchmove', onDocumentTouchMove);

  $('#portfolio-button').click(onPortfolioButtonClick);
  $('#about-button').click(onAboutButtonClick);
  $('#back-button').click(onBackButtonClick);

  $(window).on('resize', onWindowResize);

}

function Floor() {

  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  var geom = new THREE.PlaneGeometry(2500, 2500, 45, 45);

  // rotate the geometry on the x axis
  geom.rotateX(-Math.PI / 2);

  var l = geom.vertices.length;

  this.mountains = [];

  for (var i = 0; i < l; i++) {
    var v = geom.vertices[i];
    this.mountains.push({
      y: v.y,
      x: v.x,
      z: v.z,
      ang: Math.random() * Math.PI * 2,
      amp: 3 + Math.random() * 15
      // speed: 0.0016 + Math.random() * 0.001
    });
  }

  // create the material 
  var mat = new THREE.MeshPhongMaterial({
    color: 0x68c3c0,
    transparent: true,
    reflectivity: 0,
    opacity: 1,
    flatShading: true,
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;

}

Floor.prototype.makeMountains = function () {
  var verts = this.mesh.geometry.vertices;
  var vertL = verts.length;

  for (var i = 0; i < vertL; i++) {
    var v = verts[i];
    var vprops = this.mountains[i];

    v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;

    vprops.ang += vprops.speed;
  }
};

var floor;
function createFloor() {
  floor = new Floor();
  floor.makeMountains();
  group.add(floor.mesh);
}
createFloor();

// LIGHTS
function createLights() {

  ambientLight = new THREE.AmbientLight(0xdc8874, 0.3);
  scene.add(ambientLight);

  shadowLight = new THREE.DirectionalLight(0xffffff, 1);
  shadowLight.castShadow = true;
  shadowLight.position.set(-100, 300, 200);
  shadowLight.target = group;

  shadowLight.shadow.camera.left = -200;
  shadowLight.shadow.camera.right = 200;
  shadowLight.shadow.camera.top = 300;
  shadowLight.shadow.camera.bottom = -50;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 800;
  shadowLight.shadow.Darkness = 0.2;

  group.add(shadowLight);

  // // use when you need to see changes to the light
  // // calling CameraHelper on `{light name}.shadow.camera` exposes the area(the camera) of the light that will produce shadows
  //   var ch = new THREE.CameraHelper(shadowLight.shadow.camera);
  //   scene.add(ch);

}

// EVENT LISTENERS

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {

  event.preventDefault();

  $(document).on('mousemove', onDocumentMouseMove);
  $(document).on('mouseup', onDocumentMouseUp);
  $(document).on('mouseout', onDocumentMouseOut);

  mouseXOnMouseDown = event.clientX - windowHalfX;
  targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove(event) {

  mouseX = event.clientX - windowHalfX;
  targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;

}

function onDocumentMouseUp(event) {

  $(document).off('mousemove', onDocumentMouseMove, false);
  $(document).off('mouseup', onDocumentMouseUp, false);
  $(document).off('mouseout', onDocumentMouseOut, false);

}

function onDocumentMouseOut(event) {

  $(document).off('mousemove', onDocumentMouseMove, false);
  $(document).off('mouseup', onDocumentMouseUp, false);
  $(document).off('mouseout', onDocumentMouseOut, false);

}

function onDocumentTouchStart(event) {

  if (event.touches.length == 1) {

    event.preventDefault();

    mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;

  }

}

function onDocumentTouchMove(event) {

  if (event.touches.length == 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;
  }
}

function activateTransition() {

    $('#fader').removeClass('fade-transition');
    // just a short timeout to let it process that a class is being removed before giving it back
    setTimeout(() => {
      $('#fader').addClass('fade-transition');
    }, fast);
}

function onAboutButtonClick(event) {

  activateTransition();

  setTimeout(() => {
    $('#back-button').css('display', 'block');
    $('#about-button').css('display', 'none');
    $('#portfolio-button').css('display', 'none');

    lookAtHome = false;
    lookAtAbout = true;
    goToAboutDestination();

  }, slow);
}

function onPortfolioButtonClick(event) {
  $('#back-button').css('display', 'block');
  $('#about-button').css('display', 'none');
  $('#portfolio-button').css('display', 'none');

  lookAtHome = false;
  lookAtPortfolio = true;
  goToPortfolioDestination();

}

function onBackButtonClick(event) {

  activateTransition();
  setTimeout(() => {
    Reset();
    lookAtAbout = false;
    lookAtPortfolio = false;
    lookAtHome = true;

  }, slow);
}


function rotateCamera() {

  var rotSpeed = 0.0012;
  var x = camera.position.x,
    z = camera.position.z;

  camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
  camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);

  camera.lookAt(scene.position);
  camera.updateMatrixWorld();
}

function rotateShipGroup() {

  var orbitSpeed = 0.01;
  var x = ship.position.x,
    z = ship.position.z;

  ship.position.x = x * Math.cos(orbitSpeed) + z * Math.sin(orbitSpeed);
  ship.position.z = z * Math.cos(orbitSpeed) - x * Math.sin(orbitSpeed);
  ship.lookAt(scene.position);
}

function goToAboutDestination() {
  camera.position.y = 80;
  var aboutScene = scene;
  aboutScene.position.y = scene.position.y += 80;
  camera.lookAt(aboutScene.position);

  $('#about-blurb').css('display', 'block');
}

function landShipGroup() {
  ship.position.set(27, -20, 27);
}

function goToPortfolioDestination() {

  // createRollingHills();

  group.rotation.y = 0;
  var x = portfolioDestination.position.x;
  var y = portfolioDestination.position.y;
  var z = portfolioDestination.position.z;

  ship.position.x = 55 + x;
  ship.position.y = -85 + y;
  ship.position.z = z;

  ship.rotation.y = 0;
  ship.rotation.z = 10;

  camera.position.x = -250 + x;
  camera.position.y = 50 + y;
  camera.position.z = z;


  camera.lookAt(portfolioDestination.position);

  camera.updateMatrixWorld();

  $('#portfolio-blurb').css('display', 'block');

}


// RESET to home
function Reset() {

  // if (rollingHills != undefined) {
  //   console.log('parent?', portfolioDestination.children);
  //   console.log('before attempted deletion', rollingHills);
  //   var toDelete = scene.getObjectByName( "rollingHills" );
  //   console.log('by name', toDelete);

  //   portfolioDestination.remove(toDelete);
  // }
  // console.log('after attempted deletion', rollingHills);

  scene.position.y = 0;

  camera.position.set(0, 150, 500);
  camera.lookAt(scene.position);

  ship.position.set(100, 0, 100);

  $('#about-button').css('display', 'block');
  $('#portfolio-button').css('display', 'block');
  $('#back-button').css('display', 'none');

  $('#about-blurb').css('display', 'none');
  $('#portfolio-blurb').css('display', 'none');
}



// ACTIVATION
function animate() {

  requestAnimationFrame(animate);
  render();

}

function loopHills() {
  // console.log("yikes");
}


function render() {

  if (lookAtHome || lookAtAbout) {
    cancelAnimationFrame(id);
    // ^this stops the mountains rotation, not the amp changes, also won't delete it
    
    // rotateCamera();

    if (lookAtAbout) {
      landShipGroup();
      shipGroup.rotation.y += (targetRotation - shipGroup.rotation.y) * 0.05;
    }
    else if (lookAtHome) {
      rotateShipGroup();
    }
    group.rotation.y += (targetRotation - group.rotation.y) * 0.05;

  } else if (lookAtPortfolio) {
    loopHills();
  }

  renderer.render(scene, camera);

}
