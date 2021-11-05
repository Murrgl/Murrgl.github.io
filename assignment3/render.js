/*
 * CSCI-712 Assignment #3: moCap
 * Michael Walia - mpw2217
 */

/*
* Sources to help make this: https://threejs.org/examples/#webgl_loader_bvh
*/

    var clock = new THREE.Clock();

    var camera, controls, scene, renderer;
    var mixer, skeletonCreator;

    init();
    animate();

    var bvhLoader = new THREE.BVHLoader();
    bvhLoader.load( "models/bvh/legs.bvh", function(result ) {

    skeletonCreator = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
    skeletonCreator.skeleton = result.skeleton; // We allow the animation mixer to bind directly to the Skeleton.

    var bonesGroup = new THREE.Group();
    bonesGroup.add( result.skeleton.bones[ 0 ] );

    scene.add( skeletonCreator );
    scene.add( bonesGroup );

    // Plays the animation.
    mixer = new THREE.AnimationMixer( skeletonCreator );
    mixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();

} );

    function init() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 300, 300 );

    controls = new THREE.OrbitControls( camera );
    controls.minDistance = 300;
    controls.maxDistance = 700;

    scene = new THREE.Scene();

    scene.add( new THREE.GridHelper( 300, 5,0x444444,0xC522A9) );

    // Here we create the WebGL Renderer so we can display the skeleton.
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xeeeeee );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

}

    function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

    function animate() {

    requestAnimationFrame( animate );

    var delta = clock.getDelta();

    if ( mixer ) mixer.update( delta );
    if ( skeletonCreator ) skeletonCreator.update();

    renderer.render( scene, camera );

}

