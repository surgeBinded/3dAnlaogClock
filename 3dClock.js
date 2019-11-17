//  Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setClearColor("white"); // set background color

//  Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
camera.position.set(0, 0, 20);
camera.lookAt(scene.position);

const PANEL_COLOR = "#000";
const OUTER_RING_COLOR = "#718093";
const BLOB_COLOR = "#c23616";

const PANEL_RADIUS = 10;
const PANEL_HEIGHT = 0.9;

const OUTER_RING_RADIUS = PANEL_RADIUS + 0.05;
const OUTER_RING_HEIGHT = 1;

const THETA_SEGMENTS = 64;
const ROTATION = Math.PI / 2;

const TICK_BOX_POSITION = PANEL_RADIUS - 1;
const TICK_BOX_DEPTH = TICK_BOX_POSITION / 9;
const TICK_BOX_WIDTH = 0.1;
const TICK_BOX_HEIGHT = 1.0;
const TICK_BOX_ANGLE = 360 / 60 * Math.PI / 180;

const HOUR_HAND_RADIUS = 0.025;
const MIN_HAND_RADIUS = 0.036;
const HOUR_MIN_HAND_WIDTH = 64;
const HOUR_MIN_HAND_HIGHT = 32;

const SEC_HAND_WIDTH = 0.1;
const SEC_HAND_HEIGHT = 0.015;
const SEC_HAND_DEPTH = 4.5;

const TICKS_AMOUNT = 60;
const SPECIAL_TICKS_ADJUSTMENT = 0.5;
const TICKS_PER_HOUR = 5;

class Cylinder {
  constructor(radiusTop, radiusBottom, height, thetaSegments, color) {
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, thetaSegments),
      new THREE.MeshBasicMaterial({ color: color })
    );
  }
}
const clockBody = new Cylinder(PANEL_RADIUS, PANEL_RADIUS, PANEL_HEIGHT, THETA_SEGMENTS, PANEL_COLOR);

class WatchHand {
  constructor(radius, width, height, color) {
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, width, height),
      new THREE.MeshBasicMaterial({ color: color })
    );
  }
}
const hoursHandFront = new WatchHand(HOUR_HAND_RADIUS, HOUR_MIN_HAND_WIDTH, HOUR_MIN_HAND_HIGHT, "green");
const minutesHandFront = new WatchHand(MIN_HAND_RADIUS, HOUR_MIN_HAND_WIDTH, HOUR_MIN_HAND_HIGHT, "purple");

class Box {
  constructor(width, height, depth, color, tick, doInitialRotation) {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshBasicMaterial({ color: color }));

    if (doInitialRotation) {
      this.mesh.position.x += TICK_BOX_POSITION * Math.cos((-tick * Math.PI) / 30 + ROTATION);
      this.mesh.position.y += TICK_BOX_POSITION * Math.sin((-tick * Math.PI) / 30 + ROTATION);
    }
  }
}
const secondsHandFront = new Box(SEC_HAND_WIDTH, SEC_HAND_HEIGHT, SEC_HAND_DEPTH, "gray", 0, false);

const points = [
  new THREE.Vector3(OUTER_RING_RADIUS, OUTER_RING_HEIGHT, 0),   //  top left
  new THREE.Vector3(OUTER_RING_RADIUS, -OUTER_RING_HEIGHT, 0),  //  top right
  new THREE.Vector3(OUTER_RING_RADIUS, OUTER_RING_HEIGHT, 0),   //  bottom right
  new THREE.Vector3(OUTER_RING_RADIUS, -OUTER_RING_HEIGHT, 0),  //  bottom left
  new THREE.Vector3(OUTER_RING_RADIUS, OUTER_RING_HEIGHT, 0)    //  back to top left - close square path
];

const outerRingGeometry = new THREE.LatheGeometry(points, THETA_SEGMENTS);
const outerRingMaterial = new THREE.MeshBasicMaterial({ color: OUTER_RING_COLOR });
const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);

const blobGeometry = new THREE.SphereGeometry(PANEL_RADIUS / 16, THETA_SEGMENTS, THETA_SEGMENTS);
const blobMaterial = new THREE.MeshBasicMaterial({ color: BLOB_COLOR });
const blob = new THREE.Mesh(blobGeometry, blobMaterial);

function drawTicks() {
  let tickBox;

  for (let tick = 0; tick < TICKS_AMOUNT; tick++) {

    if (tick === 0) {
      tickBox = new Box(TICK_BOX_WIDTH, TICK_BOX_HEIGHT + SPECIAL_TICKS_ADJUSTMENT, TICK_BOX_DEPTH, "red", tick, true);
    } else if (tick % TICKS_PER_HOUR === 0) {
      tickBox = new Box(TICK_BOX_WIDTH, TICK_BOX_HEIGHT, TICK_BOX_DEPTH, "yellow", tick, true);
    } else {
      tickBox = new Box(TICK_BOX_WIDTH, TICK_BOX_HEIGHT - SPECIAL_TICKS_ADJUSTMENT, TICK_BOX_DEPTH, "green", tick, true);
    }
    tickBox.mesh.rotateZ(-tick * TICK_BOX_ANGLE);

    scene.add(tickBox.mesh);
  }
}
drawTicks();

function initWatchFront() {
  hoursHandFront.mesh.scale.set(2, 0.01, 100);
  minutesHandFront.mesh.scale.set(1.5, 0.01, 120);
  secondsHandFront.mesh.scale.set(0.5, 0.01, 2.1);
  hoursHandFront.mesh.position.y = 2;
  minutesHandFront.mesh.position.y = 4;
  secondsHandFront.mesh.position.y = 4.5;
}
initWatchFront();

function initWatchBack() {
  const hoursHandBack = hoursHandFront.mesh.clone();
  const minutesHandBack = minutesHandFront.mesh.clone();
  const secondsHandBack = secondsHandFront.mesh.clone();
  hoursHandFront.mesh.position.z = 0.5;
  minutesHandFront.mesh.position.z = 0.6;
  secondsHandFront.mesh.position.z = 0.61;
  hoursHandBack.position.z = -0.5;
  minutesHandBack.position.z = -0.6;
  secondsHandBack.position.z = -0.61;
  return { hoursHandBack, minutesHandBack, secondsHandBack };
}
const { hoursHandBack, minutesHandBack, secondsHandBack } = initWatchBack();

//  add objects to the scene
[hoursHandBack, minutesHandBack, secondsHandBack, hoursHandFront.mesh, minutesHandFront.mesh, secondsHandFront.mesh, clockBody.mesh, blob, outerRing].forEach(object =>
  scene.add(object)
);

//  change the default perspective of the clock
[hoursHandBack, minutesHandBack, secondsHandBack, hoursHandFront.mesh, minutesHandFront.mesh, secondsHandFront.mesh, clockBody.mesh, blob, outerRing].forEach(
  object => (object.rotation.x = ROTATION)
);

function rotate(obj, angle) //  rotating the object with rotation matrix with the passed angle
{
  const rotMatrix = new THREE.Matrix3().set(Math.cos(angle), -Math.sin(angle), 0, Math.sin(angle), Math.cos(angle), 0, 0, 0, 1);
  obj.position.applyMatrix3(rotMatrix);
  obj.rotateY(angle);
}

//  ---------- Angles of rotation for each hand at every second ----------
const now = new Date();
let seconds = now.getSeconds();
const minutes = now.getMinutes();

const hours = now.getUTCHours() + 1; 		  //  Hamburg time 
const hoursHome = now.getUTCHours() + 2;  //  Chisinau time

const ANGLE_SECONDS = Math.PI / 30;
const ANGLE_MINUTES = ANGLE_SECONDS / 60;
const ANGLE_HOURS = ANGLE_MINUTES / 12;

//  set the initial position of the hands
rotate(secondsHandFront.mesh, -seconds * ANGLE_SECONDS);
rotate(minutesHandFront.mesh, -(minutes * ANGLE_SECONDS + seconds * ANGLE_MINUTES));
rotate(hoursHandFront.mesh, -5 * (hours * ANGLE_SECONDS + minutes * ANGLE_MINUTES + seconds * ANGLE_HOURS));

rotate(secondsHandBack, (seconds + 1) * ANGLE_SECONDS);
rotate(minutesHandBack, minutes * ANGLE_SECONDS + seconds * ANGLE_MINUTES);
rotate(hoursHandBack, 5 * (hoursHome * ANGLE_SECONDS + minutes * ANGLE_MINUTES + seconds * ANGLE_HOURS));

const controls = new THREE.TrackballControls(camera, canvas);
function render() {
  requestAnimationFrame(render);

  let now = new Date();
  let newSeconds = now.getSeconds();
  if (newSeconds != seconds) {
    seconds = newSeconds;
    rotate(secondsHandFront.mesh, -ANGLE_SECONDS);
    rotate(minutesHandFront.mesh, -ANGLE_MINUTES);
    rotate(hoursHandFront.mesh, -ANGLE_HOURS);

    rotate(secondsHandBack, ANGLE_SECONDS);
    rotate(minutesHandBack, ANGLE_MINUTES);
    rotate(hoursHandBack, ANGLE_HOURS);
  }

  controls.update();

  renderer.render(scene, camera);
}
render();