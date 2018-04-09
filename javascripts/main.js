'use strict';

var container;

var contactButton = document.getElementById("contactButton");
var backButton = document.getElementById("backButton");

var lookAtHome = true;
var lookAtContact = false;
var lookAtAbout = false;
var lookAtPortfolio = false;

var camera, scene, renderer;

var ship, aboutDestination, contactDestination, portfolioDestination;
var group, shipGroup, destinationGroup;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;

var SEPARATION = 60;
var AMOUNTX = 50;
var AMOUNTY = 50;
var particle;

init();
animate();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);


  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x4C8BA8);
  scene.fog = new THREE.FogExp2(0xB3937D, 0.0018);


  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1200);
  camera.position.set(0, 150, 500);
  camera.lookAt(scene.position);

  scene.add(camera);

  var light = new THREE.PointLight(0xffffff, 0.8);
  camera.add(light);

  group = new THREE.Group();
  group.position.y = -300;
  scene.add(group);

  shipGroup = new THREE.Group();
  scene.add(shipGroup);

  destinationGroup = new THREE.Group();
  scene.add(destinationGroup);


  // FLOOR OF PARTICLES
  var floorMaterial = new THREE.SpriteMaterial();
  for (var ix = 0; ix < AMOUNTX; ix++) {
    for (var iy = 0; iy < AMOUNTY; iy++) {
      particle = new THREE.Sprite(floorMaterial);
      particle.scale.y = 7;
      particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
      particle.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
      group.add(particle);
    }
  }

  // ISLAND LAYER
  var landGeometry = new THREE.BoxGeometry(90, 550, 90);
  var landMaterial = new THREE.MeshBasicMaterial({ color: 0xCF6A48 });
  var cube = new THREE.Mesh(landGeometry, landMaterial);
  group.add(cube);
  // END ISLAND LAYER

  // SHIP LAYER
  var shipGeometry = new THREE.BoxGeometry(20, 10, 10);
  var shipMaterial = new THREE.MeshBasicMaterial({ color: 0x4D63DB });
  ship = new THREE.Mesh(shipGeometry, shipMaterial);
  ship.position.set(100, 0, 100);
  shipGroup.add(ship);
  // END SHIP LAYER

  // CONTACT LAYER
  var contactEmpty = new THREE.BoxGeometry(10,10,10);
  contactDestination = new THREE.Mesh(contactEmpty);
  contactDestination.position.set(-200, 50, 0);
  destinationGroup.add(contactDestination);
  // END CONTACT LAYER

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);


  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);

  contactButton.addEventListener('click', onContactButtonClick, false);
  backButton.addEventListener('click', onBackButtonClick, false);

  window.addEventListener('resize', onWindowResize, false);

}
// EVENT LISTENERS

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {

  event.preventDefault();

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('mouseup', onDocumentMouseUp, false);
  document.addEventListener('mouseout', onDocumentMouseOut, false);

  mouseXOnMouseDown = event.clientX - windowHalfX;
  targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove(event) {

  mouseX = event.clientX - windowHalfX;
  targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;

}

function onDocumentMouseUp(event) {

  document.removeEventListener('mousemove', onDocumentMouseMove, false);
  document.removeEventListener('mouseup', onDocumentMouseUp, false);
  document.removeEventListener('mouseout', onDocumentMouseOut, false);

}

function onDocumentMouseOut(event) {

  document.removeEventListener('mousemove', onDocumentMouseMove, false);
  document.removeEventListener('mouseup', onDocumentMouseUp, false);
  document.removeEventListener('mouseout', onDocumentMouseOut, false);

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

function onContactButtonClick(event) {
  lookAtHome = false;
  lookAtContact = true;
  animate();
}

function onBackButtonClick(event) {
  lookAtHome = true;
  lookAtAbout = false;
  lookAtContact = false;
  lookAtPortfolio = false;
  animate();
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

function goToContactDestination() {

  group.rotation.y = 0;
  var x = contactDestination.position.x;
  var y = contactDestination.position.y;
  var z = contactDestination.position.z;

  ship.position.x = 55 + x;
  ship.position.y = -45 + y;
  ship.position.z = z;

  ship.rotation.y = 0;

  camera.position.x = 250 + x;
  camera.position.y = 50 + y;
  camera.position.z =  z;

  camera.lookAt(contactDestination.position);

  camera.updateMatrixWorld();
}


// ACTIVATION
function animate() {

  requestAnimationFrame(animate);
  render();

}

function render() {

  if (lookAtHome) {
    rotateCamera();
    rotateShipGroup();
    group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
    shipGroup.rotation.y += (targetRotation - group.rotation.y) * 0.05;
  } 
  else if (lookAtContact) {
    goToContactDestination();
  }

  renderer.render(scene, camera);

}
