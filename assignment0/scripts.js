/*
 * CSCI-712 Assignment #0: Framework
 * Michael Walia - mpw2217
 */

//As per instructions of assignment #0, the duration is 20 seconds.
//Furthermore, rotation around the Y-axis is 18t [t meaning seconds] in degrees.
const CANVAS_SIZE = 500;
const DURATION = 20;
const ROTATION = 2 * Math.PI;

// Creating the scene, camera, and renderer.
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(CANVAS_SIZE, CANVAS_SIZE);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 2, 4);
scene.add(light);

cube.scale.normalize()
scene.add( cube );

camera.position.z = 6;

const clock = new THREE.Clock();

function main(obj) {
    function render(now) {
        const time = clock.getElapsedTime();
        console.log(time);
        if (time > 20) {
            return;
        }
        obj.position.x = time / 5;
        obj.position.y = time / 5;
        if (obj.rotation.y <= (2 * Math.PI)) {
            obj.rotation.y = (2 * Math.PI) * time / 18;
        }
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    // Here I'm trying to influence the shape stretching.
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    requestAnimationFrame(render);
}

main(cube);