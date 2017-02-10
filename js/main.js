if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer, controls, raycaster;

var uniforms;

var video, videoTexture;

var ground, width, height;

var dampenedMouse, mouse, pickPoint, dampenedPickpoint, time;

var shaderMaterial, texture, texture2;

var particleSystem, particleContainer, particleCount;

var composer, clock;

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

	clock = new THREE.Clock();

	container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
  camera.position.z = 12.5;//13.75;

	scene = new THREE.Scene();
  //scene.fog = new THREE.Fog( 0xffffff, 0.015, 20 );

	//var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	texture = THREE.ImageUtils.loadTexture('amiga4.jpg');
	//texture.minFilter = THREE.NearestFilter;

	// texture2 = THREE.ImageUtils.loadTexture('brushedMetal.jpg');
	// texture2.minFilter = THREE.NearestFilter;

	uniforms = {
			textureSampler: { type: "t", value: texture},
			time: {type: "f", value: 0},
			vEyePosition: {type: "v3", value: camera.position},
			refSampler: {type: "t", value: texture},
			//cameraPosition: {type: "v3", value: new THREE.Vector3()},
			mouse: {type: "v2", value: new THREE.Vector2()},
			pickPoint: {type: "v3", value: new THREE.Vector3()},
			resolution: {type: "v2", value: new THREE.Vector2(width, height)},
			gravityScale: {type: "f", value: 0},
			time1: {type: "f", value: 1},
			time2: {type: "f", value: 1.5},
			time3: {type: "f", value: .2},
			time4: {type: "f", value: .2},
			displace: {type: "f", value: .19},
			scale1: {type: "f", value: .75},
			scale2: {type: "f", value: 1},
			scale3: {type: "f", value: 1},
			scale4: {type: "f", value: 0},
			scale5: {type: "f", value: 0},
			scale6: {type: "f", value: .5},
			scale7: {type: "f", value: 0},
			scale8: {type: "f", value: 2},
			scale9: {type: "f", value: 0.7},
			size: {type: "f", value: 5},
			reflection: {type: "f", value: 0},
			specularLight: {type: "f", value: 0},
			detail: {type: "f", value: .5},
			octaves: {type: "f", value: 2},
			u_bump: {type: "f", value: 1}
	}

	var shaderMaterial = new THREE.ShaderMaterial( {

		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertex' ).textContent,
		fragmentShader: document.getElementById( 'fragment' ).textContent
	} );
	shaderMaterial.backFaceCulling = false;


/*
          var floorGeo = new THREE.PlaneGeometry(100,100);
          var floorMat = new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0xffffff, shininess: 0, side: THREE.DoubleSide, map: texture} );
          var floor = new THREE.Mesh(floorGeo, floorMat);
          floor.rotateX(Math.PI / 2);
          floor.position.y = -6;
          floor.receiveShadow = true;
          scene.add( floor );
*/
          // var light = new THREE.SpotLight( 0xffffff);
          // light.position.set( 40,100,20 );
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

          //scene.add( light );
					var spotlight = new THREE.SpotLight(0xeeeeff);
					spotlight.position.set(0,0,200);
					spotlight.decay = 2;
					spotlight.intensity = 1.2;
					spotlight.target.z = -200;
					spotlight.target.x = 0;
					spotlight.target.y = 0;
					spotlight.penumbra = 1;
					scene.add(spotlight);
					//
					// var spotlight2 = new THREE.SpotLight(0xeeefff);
					// spotlight2.position.set(0,-300,0);
					// spotlight2.decay = 2;
					// spotlight2.intensity = 2.2;
					// spotlight2.target.z = -200;
					// spotlight2.target.x = 0;
					// spotlight2.target.y = 0;
					// spotlight2.penumbra = 1;
					// scene.add(spotlight2);

          //var spotLightHelper = new THREE.SpotLightHelper( light );
          //scene.add( spotLightHelper );

          // var geo = new THREE.PlaneGeometry(32,32,400,400);
					// var geo = new THREE.PlaneBufferGeometry(32,32,400,400);
					// var geo = new THREE.SphereBufferGeometry(32,8,8);
					var paraSphere = function(u, v) {
						return new THREE.Vector3(4.5*Math.sin(u)*Math.cos(v), 4.5*Math.sin(u)*Math.sin(v), 4.5*Math.cos(u));
					};
					var geo = new THREE.ParametricBufferGeometry( paraSphere, 400, 400 );
					var morphingSphere = new THREE.Mesh( geo, shaderMaterial );
					// morphingSphere.rotation.y = Math.PI/2;
					// morphingSphere.customDepthMaterial = new THREE.ShaderMaterial({
          //     vertexShader: document.getElementById('vertex').textContent,
          //     fragmentShader: THREE.ShaderLib.depthRGBA.fragmentShader,
          //     uniforms: shaderMaterial.uniforms
          // });
					scene.add( morphingSphere );

					var sphereGeo = new THREE.SphereGeometry(25, 32, 32);
					var room = new THREE.Mesh( sphereGeo, new THREE.MeshLambertMaterial({color: 0xffffff, side: THREE.BackSide}) );
					scene.add(room);


					// var sphereGeo = new THREE.SphereGeometry(2, 32, 32);
					// var invisibleSphere = new THREE.Mesh( sphereGeo, new THREE.MeshBasicMaterial() );
					// invisibleSphere.transparent = true;
					// scene.add( invisibleSphere );

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

					createParticleSystem();






					renderer = new THREE.WebGLRenderer({antialias: true});
					renderer.setPixelRatio( window.devicePixelRatio );
					renderer.setSize( window.innerWidth, window.innerHeight );
          //renderer.shadowMapEnabled = true;
          //renderer.shadowMapSoft = true;
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
					//window.addEventListener( 'mousedown', onMouseDown, false );
					//window.addEventListener( 'mouseup', onMouseUp, false );

					var gui = new dat.GUI();
					// gui.add(shaderMaterial.uniforms.specularLight, 'value', 0, 1.5).name('specular light').step(0.05);
					// gui.add(shaderMaterial.uniforms.reflection, 'value', 0, 2).name('reflection').step(0.05);
					// gui.add(shaderMaterial.uniforms.scale1, 'value', 0.0, 2).name('scale1: detail A').step(0.02);
					// gui.add(shaderMaterial.uniforms.scale2, 'value', 0, 3).name('scale2: detail B').step(.02);
					// gui.add(shaderMaterial.uniforms.scale3, 'value', 0, 4).name('scale3: displace').step(.02);
					// gui.add(shaderMaterial.uniforms.scale4, 'value', 0, 4).name('scale4: time').step(.02);
					// gui.add(shaderMaterial.uniforms.scale5, 'value', 0, 2).name('scale5: ridges').step(.02);
					// gui.add(shaderMaterial.uniforms.scale5, 'value', 0, 5).name('scale6: bump').step(.02);
					gui.add(shaderMaterial.uniforms.reflection, 'value', 0, 1.5).name('reflection').step(.02);
					gui.add(shaderMaterial.uniforms.time1, 'value', 0, 3).name('time1').step(.02);
					gui.add(shaderMaterial.uniforms.time2, 'value', 0, 3).name('time of random movement').step(.02);
					gui.add(shaderMaterial.uniforms.scale9, 'value', 0, 5).name('B_displace').step(.02);
					gui.add(shaderMaterial.uniforms.scale8, 'value', 0, 5).name('B_scale').step(.02);
					gui.add(shaderMaterial.uniforms.detail, 'value', 0, 1).name('B_sharpness').step(.02);
					gui.add(shaderMaterial.uniforms.size, 'value', 4, 6).name('size').step(.02);
					gui.add(shaderMaterial.uniforms.scale1, 'value', 0, 1).name('random distance from center').step(.02);
					gui.add(shaderMaterial.uniforms.scale2, 'value', 0, 3).name('mouseover roll amount').step(.02);
					gui.add(shaderMaterial.uniforms.u_bump, 'value', 0, 6).name('accentuation of shading').step(.02);


					// composer = new THREE.EffectComposer( renderer, renderer.renderTarget );
					// var renderPass = new THREE.RenderPass(scene, camera);
					// composer.addPass(renderPass);
					// var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
					// effectCopy.renderToScreen = true;
					// composer.addPass(effectCopy);



					// var bloomPass = new THREE.BloomPass(10,25,4,256);
					// //bloomPass.renderToScreen = true;
					// composer.addPass(bloomPass);



					// var params = {
					// 	focus: 4,
					// 	aspect: camera.aspect,
					// 	aperture: .001,
					// 	maxblur: .5
					// };
					// var bokehPass = new THREE.BokehPass(scene, camera, params);
					// bokehPass.renderToScreen = true;
					// composer.addPass(bokehPass);

					// var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
					// effectCopy.renderToScreen = true;
					// composer.addPass(effectCopy);

					// var effectFilm = new THREE.FilmPass(0.8, 0.325, 256, false);
					// effectFilm.renderToScreen = true;
					// composer.addPass(effectFilm);




}

function createParticleSystem() {
	// create the particle variables
	particleCount = 20,
	particles = new THREE.Geometry(),
	pMaterial = new THREE.ParticleBasicMaterial({
		color: 0xbbddff,
		size: .5,
		map: THREE.ImageUtils.loadTexture(
			"particle.png"
		),
		transparent: true,
		opacity: 0.5
	});
	pMaterial.depthWrite = false;

	particleContainer = 3;

	for (var p = 0; p < particleCount; p++) {
		// var pX = Math.random() * particleContainer - particleContainer/2,
		// 		pY = Math.random() * particleContainer - particleContainer/2,
		// 		pZ = Math.random() * particleContainer - particleContainer/2,
		var rand1 = Math.random()*Math.PI,
				rand2 = Math.random()*2*Math.PI;
	  var pX = particleContainer*Math.sin(rand1)*Math.cos(rand2),
				pY = particleContainer*Math.sin(rand1)*Math.sin(rand2),
				pZ = particleContainer*Math.cos(rand1),
				particle = new THREE.Vector3(pX, pY, pZ);
				particle.multiplyScalar(Math.random()*3.);

		particle.velocity = new THREE.Vector3(
			  0,              // x
			  0, // y: random vel
			  0);             // z

		particles.vertices.push(particle);
	}

	// create the particle system
	var particleSystem = new THREE.ParticleSystem(
			particles,
			pMaterial);

	particleSystem.sortParticles = true;
	particleSystem.name = "particleSystem";

	// add it to the scene
	scene.add(particleSystem);
}

function onWindowResize( event ) {
	width = window.innerWidth;
	height = window.innerHeight;

	renderer.setSize( width, height );
	uniforms.resolution.value.x = width;
	uniforms.resolution.value.y = height;

	camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

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

	// raycaster.setFromCamera( mousevec, camera );
	// var intersects = raycaster.intersectObjects( scene.children );
	// if (intersects.length > 0) {
  //     pickPoint = intersects[0].point;
  // }


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

	dampenedMouse.x += (mouse.x - dampenedMouse.x)*0.02;
	dampenedMouse.y += (mouse.y  - dampenedMouse.y)*0.02;
	uniforms.mouse.value.copy(mouse);
	// uniforms.dampenedMouse.value.copy(dampenedMouse);
	uniforms.mouse.value.copy(dampenedMouse);

	dampenedPickpoint.x += (pickPoint.x - dampenedPickpoint.x)*0.3;
	dampenedPickpoint.y += (pickPoint.y - dampenedPickpoint.y)*0.3;
	dampenedPickpoint.z += (pickPoint.z - dampenedPickpoint.z)*0.3;
	uniforms.pickPoint.value = dampenedPickpoint;

	updateParticles();

	renderer.render( scene, camera );
	// var delta = clock.getDelta();
	// composer.render(delta);
}

function updateParticles() {
	var particleSystem = scene.getObjectByName('particleSystem');

	var pCount = particleCount;
  while (pCount--) {

    var particle = particleSystem.geometry.vertices[pCount];

		if (particle.y < -100) {
			particle.y = 100;
			particle.velocity.y = 0;
		}
		if (particle.x < -100) {
			particle.x = 100;
			particle.velocity.x = 0;
		}
		if (particle.z < -100) {
			particle.z = 100;
			particle.velocity.z = 0;
		}

		//particle.velocity.y -= (Math.random()-.5) * .1;
		//particle.velocity.y = 0;
		var factor = 0.1;
		var damping = 0.002;
		var radius = 3;




	//	if (pCount == particleCount-1) {
			//particle.velocity = dampenedPickpoint.clone().sub(particle).multiplyScalar(0.2);
		// }
		// else {
		// 	var prevParticle = particleSystem.geometry.vertices[pCount + 1];
		// 	particle.velocity = prevParticle.clone().sub(particle).multiplyScalar(0.2);
		// }



		particle.velocity.add( particle.clone().sub(particle.clone().normalize().multiplyScalar(radius)).multiplyScalar(-factor).sub(particle.velocity).multiplyScalar(damping) );
		particle.velocity.add( new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(damping).subScalar(damping/2));

		var counter2 = particleCount;
		while (counter2--) {
			var vecTo = particle.clone().sub(particleSystem.geometry.vertices[counter2]);
			var dist = vecTo.length();
			vecTo.normalize();
			particle.velocity.add(vecTo.multiplyScalar(0.002/(1+dist*dist)));
		}

		particle.add(particle.velocity);
	}



		particleSystem.geometry.verticesNeedUpdate = true;
}

function applyForce(particle) {


	return particle;
}
