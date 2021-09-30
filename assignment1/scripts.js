/*
 * CSCI-712 Assignment #1: Keyframing
 * Michael Walia - mpw2217
 */

// This KeyFrame class helps us use the time, x, y, xa, ya, za, and theta values to animate the box object.
class Keyframe {
    constructor(time, x, y, z, xa, ya, za, theta) {
        this.time = time;
        this.x = x;
        this.y = y;
        this.z = z;
        this.xa = xa;
        this.ya = ya;
        this.za = za;
        this.theta = theta;
    }
}

// These are the values given from class.
const KEYFRAMES = [
    new Keyframe(0, 0.0, 0.0, 0.0, 1.0, 1.0, -1.0, 0.0),
    new Keyframe(1, 4.0, 0.0, 0.0, 1.0, 1.0, -1.0, 30.0),
    new Keyframe(2, 8.0, 0.0, 0.0, 1.0, 1.0, -1.0, 90.0),
    new Keyframe(3, 12.0, 12.0, 12.0, 1.0, 1.0, -1.0, 180.0),
    new Keyframe(4, 12.0, 18.0, 18.0, 1.0, 1.0, -1.0, 270.0),
    new Keyframe(5, 18.0, 18.0, 18.0, 0.0, 1.0, 0.0, 90.0),
    new Keyframe(6, 18.0, 18.0, 18.0, 0.0, 0.0, 1.0, 90.0),
    new Keyframe(7, 25.0, 12.0, 12.0, 1.0, 0.0, 0.0, 0.0),
    new Keyframe(8, 25.0, 0.0, 18.0, 1.0, 0.0, 0.0, 0.0),
    new Keyframe(9, 25.0, 1.0, 18.0, 1.0, 0.0, 0.0, 0.0),
];

const CANVAS_SIZE = 500;

//Sets up our scene, camera and renderer objects.
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight);
var renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setSize(CANVAS_SIZE, CANVAS_SIZE);
document.body.appendChild(renderer.domElement);

//Sets up the object's shape, it's material,
const geometry = new THREE.BoxGeometry(4, 4, 4);
const material = new THREE.MeshPhongMaterial({color: 0xff0000, wireframe: false});
const boxObject = new THREE.Mesh(geometry, material);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 2, 4);
scene.add(light);

boxObject.scale.normalize()
scene.add(boxObject);

camera.position.copy(new THREE.Vector3(17, 6, 42));

const clock = new THREE.Clock();

function renderingKeyframeBox(object) {
    function render(rendobj) {
        const time = clock.getElapsedTime();
        if (time > KEYFRAMES[KEYFRAMES.length - 1].time) return;

        const prev = KEYFRAMES[Math.floor(time)];
        const next = KEYFRAMES[Math.floor(time) + 1];

        const u = time - prev.time;

        const pZero = new THREE.Vector3(prev.x, prev.y, prev.z);
        const pOne = new THREE.Vector3(next.x, next.y, next.z);

        const pU = pOne.sub(pZero).multiplyScalar(u).add(pZero);

        boxObject.position.copy(pU);

        const aZero = new THREE.Vector3(prev.xa, prev.ya, prev.za);
        const aOne = new THREE.Vector3(next.xa, next.ya, next.za);

        const qZero = new THREE.Quaternion()
            .setFromAxisAngle(aZero, prev.theta * Math.PI/180)
            .normalize();
        const qOne = new THREE.Quaternion()
            .setFromAxisAngle(aOne, next.theta * Math.PI/180)
            .normalize();

        const qU = qZero
            .slerp(qOne, u)
            .normalize();

        const aU = new THREE.Euler().setFromQuaternion(qU);

        boxObject.rotation.copy(aU);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    requestAnimationFrame(render);
}

renderingKeyframeBox(boxObject);
