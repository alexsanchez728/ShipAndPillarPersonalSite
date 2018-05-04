'use strict';

var container;

var lookAtHome = true;
var lookAtAbout = false;
var lookAtPortfolio = false;

var id;

var camera, scene, renderer;

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
  // ship.castShadow = true;
  shipGroup.add(ship);
  // END SHIP LAYER

  // PORTFOLIO LAYER
  var portfolioEmpty = new THREE.BoxGeometry(10, 10, 10);
  portfolioDestination = new THREE.Mesh(portfolioEmpty);
  portfolioDestination.position.set(200, 300, 0);
  destinationGroup.add(portfolioDestination);
  // END PORTFOLIO LAYER

  // pass { antialias: true } when ready to ship
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);


  $(document).on('mousedown', onDocumentMouseDown);
  $(document).on('touchstart', onDocumentTouchStart);
  $(document).on('touchmove', onDocumentTouchMove);

  $('#about-button').click(onAboutButtonClick);
  $('#portfolio-button').click(onPortfolioButtonClick);
  $('#back-button').click(onBackButtonClick);

  $(window).on('resize', onWindowResize);

}

function Floor() {

  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  var geom = new THREE.PlaneGeometry(2500, 2500, 45, 45);

  // rotate the geometry on the x axis
  geom.rotateX(- Math.PI / 2);

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
class Land {
  constructor() {
    // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
    var geom = new THREE.CylinderGeometry(250, 250, 1000, 20, 10);
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
        amp: 7 + Math.random() * 15,
        speed: 0.0006 + Math.random() * 0.0005
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
    // this.mesh.receiveShadow = true;
  }
  moveMountains() {
    var verts = this.mesh.geometry.vertices;
    var l = verts.length;
    for (var i = 0; i < l; i++) {
      var v = verts[i];
      var vprops = this.mountains[i];
      v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
      v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
      vprops.ang += vprops.speed;
      this.mesh.geometry.verticesNeedUpdate = true;
      land.mesh.rotation.z += -0.00005;
    }
  }
}

var land;
function createLand() {
  land = new Land();

  land.mesh.position.y = -150;
  land.mesh.position.x = 220;

  scene.add(land.mesh);
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
function onAboutButtonClick(event) {
  $('#back-button').css('display', 'block');
  $('#about-button').css('display', 'none');
  $('#portfolio-button').css('display', 'none');

  lookAtHome = false;
  lookAtAbout = true;
  goToAboutDestination();

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
  lookAtAbout = false;
  lookAtPortfolio = false;
  lookAtHome = true;

  Reset();
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
  var updatedScene = scene;
  updatedScene.position.y = scene.position.y += 80;
  camera.lookAt(updatedScene.position);

  $('#about-blurb').css('display', 'block');
}

function goToPortfolioDestination() {

  createLand();
  // loopLand();

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

// RESET to home
function Reset() {

  scene.position.y = 0;
  camera.position.set(0, 150, 500);
  camera.lookAt(scene.position);

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

function loopLand() {

  land.moveMountains();
  renderer.render(scene, camera);

  id = requestAnimationFrame(loopLand);
  render();
}


function render() {
  console.log(portfolioDestination);

  if (lookAtHome || lookAtAbout) {
    cancelAnimationFrame(id);

    rotateCamera();
    rotateShipGroup();
    group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
    renderer.render(scene, camera);

  }
}
