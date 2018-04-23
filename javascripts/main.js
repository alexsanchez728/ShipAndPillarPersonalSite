'use strict';

var container;

var lookAtHome = true;
var lookAtContact = false;
var lookAtAbout = false;
var lookAtPortfolio = false;

var loader = new THREE.TextureLoader();
var texture = loader.load('textures/sprites/disc.png');


var id;
var floorMaterial;

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
  group.add(destinationGroup);


  // FLOOR OF PARTICLES
  floorMaterial = new THREE.SpriteMaterial();
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
  var contactEmpty = new THREE.BoxGeometry(10, 10, 10);
  contactDestination = new THREE.Mesh(contactEmpty);
  // contactDestination.transparent = true;
  // contactDestination.opacity = 0;
  contactDestination.position.set(-200, 300, 0);
  destinationGroup.add(contactDestination);
  // END CONTACT LAYER

  // PORTFOLIO LAYER
  var portfolioEmpty = new THREE.BoxGeometry(10, 10, 10);
  portfolioDestination = new THREE.Mesh(contactEmpty);
  portfolioDestination.position.set(200, 300, 0);
  destinationGroup.add(portfolioDestination);
  // END PORTFOLIO LAYER

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);


  $(document).on('mousedown', onDocumentMouseDown);
  $(document).on('touchstart', onDocumentTouchStart);
  $(document).on('touchmove', onDocumentTouchMove);

  $('#contact-button').click(onContactButtonClick);
  $('#portfolio-button').click(onPortfolioButtonClick);
  $('#back-button').click(onBackButtonClick);

  $(window).on('resize', onWindowResize);

}

function Sea() {

  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  var cylinderGeom = new THREE.CylinderGeometry(450, 450, 1000, 20, 20);

  var vertices = cylinderGeom.vertices;

  cylinderGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  this.waves = [];

  for (var i = 0; i < vertices.length; i++) {
    var v = vertices[i];
    this.waves.push({
      y: v.y,
      x: v.x,
      z: v.z,
      ang: Math.random() * Math.PI * 2,
      amp: 30 + Math.random() * 15,
      speed: 0.0016 + Math.random() * 0.001
    });
  }

  var pointsMaterial = new THREE.PointsMaterial({
    color: 0x0080ff,
    map: texture,
    size: 16,
    alphaTest: 0.5
  });

  this.mesh = new THREE.Points(cylinderGeom, pointsMaterial);
}


Sea.prototype.moveWaves = function () {
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;

  for (var i = 0; i < l; i++) {
    var v = verts[i];
    var vprops = this.waves[i];

    v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;

    vprops.ang += vprops.speed;

    this.mesh.geometry.verticesNeedUpdate = true;

    sea.mesh.rotation.z += -0.00003;
  }
};

var sea;

function createSea() {
  sea = new Sea();

  // push it a little bit at the bottom of the scene
  sea.mesh.position.y = -350;
  sea.mesh.position.x = -120;

  // add the mesh of the sea to the scene
  contactDestination.add(sea.mesh);
}

function Land() {

  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  var geom = new THREE.CylinderGeometry(250, 250, 1000, 20, 10);

  // rotate the geometry on the x axis
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  geom.mergeVertices();
  var l = geom.vertices.length;

  this.mountains = [];

  for (var i = 0; i < l; i++) {
    var v = geom.vertices[i];
    this.mountains.push({
      y: v.y,
      x: v.x,
      z: v.z,
      ang: Math.random() * Math.PI * 2,
      amp: 3 + Math.random() * 15,
      speed: 0.0016 + Math.random() * 0.001
    });
  }

  // create the material 
  var mat = new THREE.MeshPhongMaterial({
    color: 0x68c3c0,
    transparent: true,
    opacity: 1,
    flatShading: true,
  });

  this.mesh = new THREE.Mesh(geom, mat);
  // Allow the sea to receive shadows
  // this.mesh.receiveShadow = true;
}

Land.prototype.moveMountains = function () {
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;

  for (var i = 0; i < l; i++) {
    var v = verts[i];
    var vprops = this.mountains[i];

    v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;

    vprops.ang += vprops.speed;

    this.mesh.geometry.verticesNeedUpdate = true;

    land.mesh.rotation.z += -0.00003;
  }
};

var land;

function createLand() {
  land = new Land();

  // push it a little bit at the bottom of the scene
  land.mesh.position.y = -100;
  land.mesh.position.x = 180;

  // add the mesh of the sea to the scene
  contactDestination.add(land.mesh);
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

function onContactButtonClick(event) {
  lookAtHome = false;
  lookAtContact = true;
  createSea();
  loopSea();
}
function onPortfolioButtonClick(event) {
  lookAtHome = false;
  lookAtPortfolio = true;
  createLand();
  loopLand();
}

function onBackButtonClick(event) {
  lookAtAbout = false;
  lookAtContact = false;
  lookAtPortfolio = false;
  lookAtHome = true;
  $('#about-blurb').css('display', 'none');

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
  ship.position.y = -40 + y;
  ship.position.z = z;

  ship.rotation.y = 0;

  camera.position.x = 250 + x;
  camera.position.y = 20 + y;
  camera.position.z = z;

  camera.lookAt(contactDestination.position);

  camera.updateMatrixWorld();

  $('#about-blurb').css('display', 'block');

}

function goToPortfolioDestination() {

  group.rotation.y = 0;
  var x = portfolioDestination.position.x;
  var y = portfolioDestination.position.y;
  var z = portfolioDestination.position.z;

  ship.position.x = 55 + x;
  ship.position.y = -45 + y;
  ship.position.z = z;

  ship.rotation.y = 0;

  camera.position.x = 250 + x;
  camera.position.y = 50 + y;
  camera.position.z = z;

  camera.lookAt(portfolioDestination.position);

  camera.updateMatrixWorld();

  $('#portfolio-blurb').css('display', 'block');

}


// ACTIVATION
function animate() {

  requestAnimationFrame(animate);
  render();

}

function loopSea() {

  sea.moveWaves();
  renderer.render(scene, camera);
  // save the result to more easily break the loop later
  id = requestAnimationFrame(loopSea);
  render();
}
function loopLand() {

  land.moveMountains();
  renderer.render(scene, camera);

  id = requestAnimationFrame(loopLand);
  render();
}
function render() {

  if (lookAtHome) {

    cancelAnimationFrame(id);

    rotateCamera();
    rotateShipGroup();
    group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
    renderer.render(scene, camera);
  }
  else if (lookAtContact) {
    goToContactDestination();
  }
  else if (lookAtPortfolio) {
    goToPortfolioDestination();
  }


}
