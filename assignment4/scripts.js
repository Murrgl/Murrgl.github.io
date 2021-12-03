//CSCI-712 Assignment #4a: Particles
//Michael Walia - mpw2217


const particlesNumberPerFrame = 7;
const particlesLifetimeSeconds = 0.4;
const cometRadius = 0.6;
let controlsOn = false;
let previousPosition = new THREE.Vector3();

// Starts the scene
var scene = new THREE.Scene();

const documentWidth = window.innerWidth;
const documentHeight = window.innerHeight;
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(documentWidth, documentHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);


var camera = new THREE.PerspectiveCamera(70, documentWidth / documentHeight);
camera.position.copy(new THREE.Vector3(0, 0, 10));

//Need to add a light for Phong Material Box to Display
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 2, 4); //Moving the light from it's original position (0,0,0)
scene.add(light);

const cometGeometry = new THREE.SphereGeometry(cometRadius, 30, 30);
const cometColor = new THREE.Color("rgb(100%, 0%, 0%)");
const cometMaterial = new THREE.MeshPhongMaterial();
cometMaterial.color=cometColor;

const comet = new THREE.Mesh(cometGeometry, cometMaterial);
comet.position.copy(new THREE.Vector3(-4, 0, 0));
scene.add(comet);

const clock = new THREE.Clock();

const particleGroup = new THREE.Group();

const particleGeometry = new THREE.SphereGeometry(cometRadius / 7);


scene.add(particleGroup);

scene.scale.normalize();


let t = 0;
function main() {
    function render() {
        const time = clock.getElapsedTime();

        if (!controlsOn) {
            t += 0.007;
            previousPosition.copy(comet.position);
            comet.position.x = 14 * Math.cos(t) + 0;
            comet.position.y = 8 * Math.sin(t) + 0;
        }

        for (const particle of particleGroup.children) {
            // When the particle group's lifetime is finished, remove it.
            const age = time - particle.birthtime;
            if (age > particlesLifetimeSeconds) {
                particleGroup.remove(particle);
            }

            // Update the particle's position.
            const velocity = particle.velocity.clone().multiplyScalar(0.2);
            particle.position.add(velocity);
            particle.material.opacity = 1.0 - age / particlesLifetimeSeconds;
        }
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
        }

        // Generate a new particle group.
        for (let i = 0; i < particlesNumberPerFrame; i++) {
            //Picks a color between red and yellow.
            randomYellowOrange = getRandomInt(0,60);
            const particleMesh = new THREE.Mesh(
                particleGeometry,
                new THREE.MeshBasicMaterial({
                    color: `hsl(${randomYellowOrange}, 100%, 50%)`,
                    transparent: true,
                    opacity: 1.0
                })
            );

            const particlePosition = comet.position.clone();
            particlePosition.x +=
                (Math.random() > 0.5 ? -1 : 1) *
                Math.random() *
                (cometRadius * 0.5);
            particlePosition.y +=
                (Math.random() > 0.5 ? -1 : 1) *
                Math.random() *
                (cometRadius * 0.5);

            particleMesh.position.copy(particlePosition);

            particleMesh.birthtime = time;

            const cometDirection = comet.position.clone().sub(previousPosition);

            cometDirection.x *= Math.random();
            cometDirection.y *= Math.random();
            cometDirection.normalize();
            const particleVelocity = cometDirection.negate();
            particleMesh.velocity = particleVelocity;
            particleGroup.add(particleMesh);
        }

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    // Fits the canvas to the proper size on the screen.
    const canvas = renderer.domElement;

    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    requestAnimationFrame(render);
}

main();
