/*
 * CSCI-712 Assignment #0: Framework
 * Michael Walia - mpw2217
 */

/*As per instructions of assignment #0, the duration is 20 seconds.
Furthermore, rotation around the Y-axis is 18t [t meaning seconds] in degrees.
Therefore, the cube will rotate 18 degrees per 1 second. Because the animation
is 20 seconds, the cube will rotate a full 360 degrees. It rotates once.

You don't need to generate transformation matrix.
Camera is straight on.
t is gametime, this example it coressponds to clock time. you have to get time in miliseconds.
and you need to know how much time has progressed since last frame.
Complete rotation in 20 seconds.
you need to know how much time has progressed since the last frame.
-Don't repeat the animation
*/

const OUTPUT_CANVAS_SIZE = 600;
// Creating the scene, camera, and renderer.
// Some of this boilerplate code is from the ThreeJS tutorial at
// https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
// renderer.setSize(SCREEN_SIZE, SCREEN_SIZE);
renderer.setSize( OUTPUT_CANVAS_SIZE,OUTPUT_CANVAS_SIZE);
document.body.appendChild(renderer.domElement);
//end of boilerplate code

const geometry = new THREE.BoxGeometry(); // Defaults to 1
const material = new THREE.MeshPhongMaterial({color: 0xffd700});
// const material = new THREE.MeshPhongMaterial({color: 0xff0000});
// const material = new THREE.MeshPhongMaterial({color: 0xff0000});
const boxObject = new THREE.Mesh(geometry, material);


//Need to add a light for Phong Material Box to Display
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 2, 4); //Moving the light from it's original position (0,0,0)
scene.add(light);

boxObject.scale.normalize()
scene.add(boxObject);

camera.position.z = 6;
// camera.position.z = 6;

const clock = new THREE.Clock();
document.write("Hello world");
function renderingBox(object) {
    function render() {
        const time = clock.getElapsedTime();
        console.log(time);
        if (time > 20) {
            return; // stop the animation after 20 seconds
        }
        object.position.x = time / 5;
        object.position.y = time / 5;

        if (object.rotation.y <= (2 * Math.PI)) {
            object.rotation.y = (2 * Math.PI) * time / 18;
        }

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    // Here I'm trying to influence the shape stretching.
    // const canvas = renderer.domElement;
    // camera.aspect = canvas.clientWidth / canvas.clientHeight;
    // camera.updateProjectionMatrix();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    requestAnimationFrame(render);
}

renderingBox(boxObject);