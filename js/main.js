if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer, controls, raycaster;

var uniforms;

var video, videoTexture;

var ground, width, height;

var dampenedMouse, mouse, pickPoint, dampenedPickpoint, time;

var shaderMaterial;

init();
animate();

function init() {

	dampenedMouse = new THREE.Vector2(0,0);
	mouse = new THREE.Vector2(0,0);
	pickPoint = new THREE.Vector3(0,0,0);
	dampenedPickpoint = new THREE.Vector3(0,0,0);
	time = 0;
  width = window.innerWidth;
  height = window.innerHeight;

	container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
  camera.position.z = 11;

	scene = new THREE.Scene();
  //scene.fog = new THREE.Fog( 0xffffff, 0.015, 20 );

	//var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	var texture = THREE.ImageUtils.loadTexture('../amiga.jpg');
	texture.minFilter = THREE.NearestFilter;

	uniforms = {
			time: { type: "f", value: 1.0 },
			resolution: { type: "v2", value: new THREE.Vector2(width,height) },
			mouse: {type: "v2", value: new THREE.Vector2(mouse.x,mouse.y) },
			dampenedMouse: {type: "v2", value: new THREE.Vector2(mouse.x,mouse.y) },
			scale1: {type: "f", value: .68},
			scale2: {type: "f", value: .85},
			scale3: {type: "f", value: 0.},
			scale4: {type: "f", value: 3},
			time1: {type: "f", value: 1.0},
			mousePullWidth: {type: "f", value: 3.0},
			mousePull: {type: "f", value: .3},
			displace: {type: "f", value: 1.0},
			reflection: {type: "f", value: .5},
			textureSampler: {type: "t", value: texture},
			pickPoint: {type: "v3", value: new THREE.Vector3() },
			size: {type: "f", value: 5},
			specularLight: {type: "f", value: 1},
			u_bump: {type: "f", value: 0.22}
	}


	var shaderMaterial = new THREE.ShaderMaterial( {

		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertex' ).textContent,
		fragmentShader: document.getElementById( 'fragment' ).textContent,
    side: THREE.DoubleSide

	} );


/*
          var floorGeo = new THREE.PlaneGeometry(100,100);
          var floorMat = new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0xffffff, shininess: 0, side: THREE.DoubleSide, map: texture} );
          var floor = new THREE.Mesh(floorGeo, floorMat);
          floor.rotateX(Math.PI / 2);
          floor.position.y = -6;
          floor.receiveShadow = true;
          scene.add( floor );
*/
          var light = new THREE.SpotLight( 0xffffff);
          light.position.set( 40,100,20 );
					/*
          light.castShadow = true;
          light.shadowMapWidth = 1024;
          light.shadowMapHeight = 1024;
          light.shadowCameraFar = 1000;
          light.shadowCameraNear = 1;
          light.shadowCameraFov = 30;
          light.shadowDarkness = 0.2;
          light.penumbra = 1;
          light.decay = 2;
          light.target.x = 0;
          light.target.y = 0;
          light.target.z = 0;
          light.name = "mouselight";
					*/

          scene.add( light );

          //var spotLightHelper = new THREE.SpotLightHelper( light );
          //scene.add( spotLightHelper );

          var geo = new THREE.PlaneGeometry(30,30,512,512);
					var morphingSphere = new THREE.Mesh( geo, shaderMaterial );
					morphingSphere.customDepthMaterial = new THREE.ShaderMaterial({
              vertexShader: document.getElementById('vertex').textContent,
              fragmentShader: THREE.ShaderLib.depthRGBA.fragmentShader,
              uniforms: shaderMaterial.uniforms
          });
					scene.add( morphingSphere );


					var sphereGeo = new THREE.SphereGeometry(2, 32, 32);
					var invisibleSphere = new THREE.Mesh( sphereGeo, new THREE.MeshBasicMaterial() );
					invisibleSphere.transparent = true;
					scene.add( invisibleSphere );

/*
          var icoGeo = new THREE.IcosahedronGeometry(2,6);
					var ico = new THREE.Mesh( icoGeo, floorMat );
          ico.castShadow = true;
          ico.receiveShadow = true;
          ico.customDepthMaterial = new THREE.ShaderMaterial({
              vertexShader: document.getElementById('vertex').textContent,
              fragmentShader: THREE.ShaderLib.depthRGBA.fragmentShader,
              uniforms: shaderMaterial.uniforms
          });
					scene.add( ico );
					*/

					renderer = new THREE.WebGLRenderer();
					renderer.setPixelRatio( window.devicePixelRatio );
          renderer.shadowMapEnabled = true;
          renderer.shadowMapSoft = true;
          renderer.setClearColor(0xffffff);
					container.appendChild( renderer.domElement );

          controls = new THREE.OrbitControls(camera, renderer.domElement);

					raycaster = new THREE.Raycaster();

					stats = new Stats();
					stats.domElement.style.position = 'absolute';
					stats.domElement.style.top = '0px';
					container.appendChild( stats.domElement );

					onWindowResize();

					window.addEventListener( 'resize', onWindowResize, false );
					window.addEventListener( 'mousemove', onMouseMove, false );
					window.addEventListener( 'mousedown', onMouseDown, false );
					window.addEventListener( 'mouseup', onMouseUp, false );

					var gui = new dat.GUI();
	        gui.add(shaderMaterial.uniforms.time1, 'value', 0, 4).name('time').step(0.05);
					gui.add(shaderMaterial.uniforms.mousePull, 'value', 0, 1).name('mousepull height').step(0.05);
					gui.add(shaderMaterial.uniforms.mousePullWidth, 'value', .25, 5).name('mousepull width').step(0.05);
					gui.add(shaderMaterial.uniforms.specularLight, 'value', 0, 1.5).name('specular light').step(0.05);
					gui.add(shaderMaterial.uniforms.reflection, 'value', 0, 1).name('reflection').step(0.05);
					gui.add(shaderMaterial.uniforms.u_bump, 'value', 0.02, .8).name('bump').step(0.02);
					gui.add(shaderMaterial.uniforms.scale1, 'value', 0.1, 5).name('bump smoothing').step(0.02);
					gui.add(shaderMaterial.uniforms.scale3, 'value', 0, .05).name('grain').step(.02);
					gui.add(shaderMaterial.uniforms.scale4, 'value', 2, 30).name('grainsize').step(.02);
}

function onWindowResize( event ) {
	width = window.innerWidth;
	height = window.innerHeight;

	renderer.setSize( width, height );
	uniforms.resolution.value.x = width;
	uniforms.resolution.value.y = height;



}

function onMouseMove( event ) {

	mouse.x = event.clientX;
	mouse.y = event.clientY;

	var timeout;
	var oldmouse = mouse.clone();

	var mousevec = mouse.clone();

	mousevec.x = mousevec.x / window.innerWidth * 2 - 1;
	mousevec.y = (1.- mousevec.y / window.innerHeight) * 2 - 1;
	oldmouse.x = oldmouse.x / window.innerWidth * 2 - 1;
	oldmouse.y = oldmouse.y / window.innerHeight * 2 - 1;

	raycaster.setFromCamera( mousevec, camera );
	var intersects = raycaster.intersectObjects( scene.children );
	if (intersects.length > 0) {
      pickPoint = intersects[0].point;
  }


}

function onMouseDown( event ) {

}

function onMouseUp( event ) {

}

var timeout;
/*
function onMouseDown( event ) {
	clearInterval(timeout);
	timeout = window.setInterval(function(){
			uniforms.scale.value += 0.03;
			if(uniforms.scale.value > 1) {
					uniforms.scale.value = 1;
					window.clearInterval(timeout);
			}
	}, 50); // Run each 50ms
}
function onMouseUp( event ) {
	clearInterval(timeout);
	timeout = window.setInterval(function(){
			uniforms.scale.value -= 0.11;
			if(uniforms.scale.value < 0) {
					uniforms.scale.value = 0;
					window.clearInterval(timeout);
			}
	}, 50); // Run each 50ms

}
*/

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {
	uniforms.time.value = time;
	time += 0.02;

	dampenedMouse.x += (mouse.x - dampenedMouse.x)*0.05;
	dampenedMouse.y += (mouse.y  - dampenedMouse.y)*0.05;
	uniforms.mouse.value.copy(mouse);
	uniforms.dampenedMouse.value.copy(dampenedMouse);

	dampenedPickpoint.x += (pickPoint.x - dampenedPickpoint.x)*0.3;
	dampenedPickpoint.y += (pickPoint.y - dampenedPickpoint.y)*0.3;
	dampenedPickpoint.z += (pickPoint.z - dampenedPickpoint.z)*0.3;
	uniforms.pickPoint.value = dampenedPickpoint;

	renderer.render( scene, camera );

}
