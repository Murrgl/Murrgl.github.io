/*
 * CSCI-712 Assignment #2: Billiards
 * Michael Walia - mpw2217
 * Version: Alpha2
 */

const POOLTABLE_SIZE = 800;
const BALL_RADIUS = 0.06;
const BALL_MASS = 170;
let COEFFICIENT_RESTITUTION = 0.90;
let COEFFICIENT_FRICTION = 0.004;

$(document).ready(() => {
    $("#ball-cushion").on("input change", (e) => {
        COEFFICIENT_RESTITUTION = parseFloat(e.target.value);
        $('#restitution-value').text(e.target.value);
    });
    $("#friction").on("input change", (e) => {
        COEFFICIENT_FRICTION = parseFloat(e.target.value);
        $('#friction-value').text(e.target.value);
    });
});

// Here I'm setting up the scene and renderer to generate the pool table & billiards.
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({
    antialias: true,
});

renderer.setSize(POOLTABLE_SIZE, POOLTABLE_SIZE);
renderer.setClearColor(0x7a7a7a);
document.body.appendChild(renderer.domElement);

// Generating the table here...
const TABLE_GEOMETRY = new THREE.BoxGeometry(4, 0.2, 2);
const TABLE_MATERIAL = new THREE.MeshPhongMaterial({ color: 0x00633F }); //Emerald
const TABLE = new THREE.Mesh(TABLE_GEOMETRY, TABLE_MATERIAL);
scene.add(TABLE);

// Next come the cushions for the table.
const cushions = new THREE.Group();

const longCushionGeo = new THREE.BoxGeometry(4.2, 0.2, 0.1);
const shortCushionGeo = new THREE.BoxGeometry(0.1, 0.2, 2);
const cushionMat = new THREE.MeshPhongMaterial({ color: 0x93633F }); //Mahogany

const longCushionFar = new THREE.Mesh(longCushionGeo, cushionMat);
longCushionFar.position.z = -1.05;
const longCushionNear = new THREE.Mesh(longCushionGeo, cushionMat);
longCushionNear.position.z = 1.05;
const shortCushionLeft = new THREE.Mesh(shortCushionGeo, cushionMat);
shortCushionLeft.position.x = -2.05;
const shortCushionRight = new THREE.Mesh(shortCushionGeo, cushionMat);
shortCushionRight.position.x = 2.05;

cushions.add(...[longCushionFar, longCushionNear, shortCushionLeft, shortCushionRight]);
cushions.position.y = 0.15;
scene.add(cushions);

// This creates the numerous balls on the table. These are all
// added to a ball group so I can manipulate them together.
const balls = new THREE.Group();

const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
const cueMat = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
const redMat = new THREE.MeshPhongMaterial({ color: 0xEE1111 });
const blueMat = new THREE.MeshPhongMaterial({ color: 0x1111EE });
const blackMat = new THREE.MeshPhongMaterial({ color: 0x111111 });

const cueBall = new THREE.Mesh(ballGeo, cueMat);
cueBall.position.x = -1;
cueBall.name = 'cueBall';
balls.add(cueBall);

const redBall = new THREE.Mesh(ballGeo, redMat);
redBall.position.x = 1;
redBall.name = 'redBall';
balls.add(redBall);
const blueBall = new THREE.Mesh(ballGeo, blueMat);
blueBall.position.x = 1.12;
blueBall.position.z = 0.1;
blueBall.name = 'blueBall';
balls.add(blueBall);
const blackBall = new THREE.Mesh(ballGeo, blackMat);
blackBall.position.x = -1.2;
blackBall.position.z = 0.05;
blackBall.name = 'blackBall';
balls.add(blackBall);

balls.position.y = 0.1 + BALL_RADIUS;
scene.add(balls);

const pockets = new THREE.Group();
const pocketMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const pocketGeo = new THREE.SphereGeometry(BALL_RADIUS + 0.05, 32, 32);

const backLeft = new THREE.Mesh(pocketGeo, pocketMat);
backLeft.position.x = -1.95;
backLeft.position.z = -0.95;
pockets.add(backLeft);
const backRight = new THREE.Mesh(pocketGeo, pocketMat);
backRight.position.x = 1.95;
backRight.position.z = 0.95;
pockets.add(backRight);
const frontRight = new THREE.Mesh(pocketGeo, pocketMat);
frontRight.position.x = 1.95;
frontRight.position.z = -0.95;
pockets.add(frontRight);
const frontLeft = new THREE.Mesh(pocketGeo, pocketMat);
frontLeft.position.x = -1.95;
frontLeft.position.z = 0.95;
pockets.add(frontLeft);
const backMiddle = new THREE.Mesh(pocketGeo, pocketMat);
backMiddle.position.z = -0.95;
pockets.add(backMiddle);
const frontMiddle = new THREE.Mesh(pocketGeo, pocketMat);
frontMiddle.position.z = 0.95;
pockets.add(frontMiddle);

pockets.position.y = 0.1 + BALL_RADIUS;
scene.add(pockets);

// Setting up the light parameters.
const overheadLight = new THREE.PointLight(0xffffff, 1);
overheadLight.position.set(0, 3.5, 0);
scene.add(overheadLight);

// Setting up the camera parameters.
var camera = new THREE.PerspectiveCamera(65, 1);
camera.position.copy(new THREE.Vector3(0, 3, 3));
camera.lookAt(TABLE.position);

const clock = new THREE.Clock();

class Model {
    constructor(name, model) {
        this.name = name;
        this.model = model;
        this.m = new THREE.Vector3();
    }
}

Model.prototype.equals = function(other) {
    return this.name === other.name;
}

const cueModel = new Model('cueBall', cueBall);
const blueModel = new Model('blueBall', blueBall);
const redModel = new Model('redBall', redBall);
const blackModel = new Model('blackBall', blackBall);
const models = [cueModel, blueModel, redModel, blackModel];
const pocketMeshs = [backLeft, backRight, frontRight, frontLeft, backMiddle, frontMiddle];

// A brief delay, 1 second, then it's time to hit the ball.
setTimeout(() => {
    cueModel.m.x = 1100;
}, 1000);

document.addEventListener('keydown', (e) => {
    const moveAmmt = 200;
    switch(e.key) {
        case 'w': 
            cueModel.m.z -= moveAmmt;
            break;
        case 'd':
            cueModel.m.x += moveAmmt;
            break;
        case 's':
            cueModel.m.z += moveAmmt;
            break;
        case 'a':
            cueModel.m.x -= moveAmmt;
            break;
    }
});


// This function deals with the physics of how the balls & pool table interact.
function playBilliards() {
    const clock = new THREE.Clock();
    let then = 0;
    function render() {
        const delta = clock.getDelta();

        for (model of models) {
            if (!model.model.visible) continue;
            // Adding a model to calculate velocity.
            model.model.position.add(model.m.clone().divideScalar(BALL_MASS).multiplyScalar(delta));

            // Lowering the velocity here to account for gravity.
            let force = new THREE.Vector3();
            const unitVelocity = model.m.clone().divideScalar(BALL_MASS).normalize();
            force = unitVelocity.negate().multiplyScalar(9.8 * BALL_MASS * COEFFICIENT_FRICTION);

            // If the ball hits the sides of the pool table...
            if (model.m.length() !== 0) {
                // when the balls hit the right small wall
                if (model.model.position.x >= (2 - BALL_RADIUS)) {
                    model.model.position.x = 2 - BALL_RADIUS;
                    model.m.multiplyScalar(COEFFICIENT_RESTITUTION);
                    model.m.x = -model.m.x;
                    // when the balls hit the left small wall
                } else if (model.model.position.x <= (-2 + BALL_RADIUS)) {
                    model.model.position.x = -2 + BALL_RADIUS;
                    model.m.multiplyScalar(COEFFICIENT_RESTITUTION);
                    model.m.x = -model.m.x;
                    // when the balls hit the left faraway wall
                } else if (model.model.position.z <= (-1 + BALL_RADIUS)) {
                    model.model.position.z = -1 + BALL_RADIUS;
                    model.m.multiplyScalar(COEFFICIENT_RESTITUTION);
                    model.m.z = -model.m.z;
                    // hit faraway long wall
                } else if (model.model.position.z >= (1 - BALL_RADIUS)) {
                    model.model.position.z = 1 - BALL_RADIUS;
                    model.m.multiplyScalar(COEFFICIENT_RESTITUTION);
                    model.m.z = -model.m.z;
                }
            }
            // If the balls hit each other...
            for (other of models) {
                if (!other.model.visible) continue;
                if (model == other) {
                    continue;
                }
                let dist = model.model.position.distanceTo(other.model.position);
                if (dist < (BALL_RADIUS * 2 - 0.001)) {
                    let error = (BALL_RADIUS * 2) - dist;
                    while (error > 0.001) {
                        const unitMomentum = model.m.clone().negate().normalize().multiplyScalar(error);
                        model.model.position.add(unitMomentum);
                        dist = model.model.position.distanceTo(other.model.position);
                        error = (BALL_RADIUS * 2) - dist;
                    }

                    const n = other.model.position
                        .clone()
                        .sub(model.model.position)
                        .normalize();
                    const impulse = n.multiplyScalar(
                        BALL_MASS * (
                            (other.m.divideScalar(BALL_MASS).dot(n)) -
                            (model.m.divideScalar(BALL_MASS).dot(n))
                        ) / 2
                    );
                    model.m.add(impulse);
                    other.m.sub(impulse);
                }
            }

            for (pocket of pocketMeshs) {
                let dist = model.model.position.distanceTo(pocket.position);
                if (dist < (BALL_RADIUS + BALL_RADIUS + 0.05)) {
                    if (model.model.name === 'cueBall') {
                        model.model.position.x = 0;
                        model.model.position.z = 0;
                        model.m.set(0, 0, 0);
                    } else {
                        const ballObj = scene.getObjectByName(model.model.name);
                        ballObj.visible = false;
                    }
                } 
            }

            model.m = model.m.add(force.multiplyScalar(delta));
        }

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render()
}

playBilliards();
