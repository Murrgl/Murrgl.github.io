var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
const screenSize = 475;
var renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize(screenSize,screenSize);
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;


const clock = new THREE.Clock();
const timeSoFar = clock.getElapsedTime();

// Let clock
// document.getElementById("demo").innerHTML = 5 + 6;
// document.writeln("Clock is "+timeSoFar)


var animate = function (obj) {
    const timeSoFar = clock.getElapsedTime();
    console.log(timeSoFar)
    //Will stop the animation once the 20 seconds are elapsed.
    if (timeSoFar>1){
        return;
    }
    obj.position.x = timeSoFar / 5;
    obj.position.y = timeSoFar / 5;

    requestAnimationFrame( animate );

    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
};

animate(obj);