if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var container, stats;

			var camera, scene, renderer, controls;

			var uniforms;

            var video, videoTexture;

            var ground, width, height;
						var mousePoint;

			init();
			animate();

			function init() {


				mousePoint = new THREE.Vector2(0);

                width = window.innerWidth;
                height = window.innerHeight;

				container = document.getElementById( 'container' );
                
                camera = new THREE.PerspectiveCamera( 45, width / height, 1, 10000 );
                camera.position.z = 20;

				scene = new THREE.Scene();
                scene.fog = new THREE.Fog(0xeeeeee,30,50);

				var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

				uniforms = {
					time: { type: "f", value: 1.0 },
					resolution: { type: "v2", value: new THREE.Vector2() },
					mouse: {type: "v2", value: new THREE.Vector2() },
					scale: {type: "f", value: 0.0},
					uTexCube: { type: "t", value: THREE.ImageUtils.loadTextureCube( [ "/img/Skybox/right.bmp", "/img/Skybox/left.bmp", // cube texture
                                                                     "/img/Skybox/up.bmp", "/img/Skybox/down.bmp",
                                                                     "/img/Skybox/front.bmp", "/img/Skybox/back.bmp" ] ) }
				};


				var shaderMaterial2 = new THREE.ShaderMaterial( {

					uniforms: uniforms,
					vertexShader: document.getElementById( 'vertexShader0' ).textContent,
					fragmentShader: document.getElementById( 'fragmentShader0' ).textContent,
                    side: THREE.DoubleSide

				} );
                
                // displace ico geometry
                var shaderMaterial3 = new THREE.ShaderMaterial( {
                    vertexShader: document.getElementById( 'vertexShader3' ).textContent,
					fragmentShader: document.getElementById( 'fragmentShader3' ).textContent,
                    uniforms: uniforms
				} );
                
                // fbm based on 3d space
                var shaderMaterial4 = new THREE.ShaderMaterial( {
                    vertexShader: document.getElementById( 'vertexShader4' ).textContent,
					fragmentShader: document.getElementById( 'fragmentShader3' ).textContent,
                    uniforms: uniforms
				} );


				var cubeGeo = new THREE.BoxGeometry(5,5,5,30,30,30);
				var icoGeo = new THREE.IcosahedronGeometry(1,3);


                
            
                var roomGeo = new THREE.BoxGeometry(1000,1000,1000);
                var roomMat = new THREE.MeshPhongMaterial( { color: 0xeeeeee, specular: 0xffffff, shininess: 0, side: THREE.BackSide} );
                var room = new THREE.Mesh(roomGeo, roomMat);
                room.receiveShadow = true;
                scene.add( room );
                
                var floorGeo = new THREE.PlaneGeometry(500,500);
                var floorMat = new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0xffffff, shininess: 0, side: THREE.DoubleSide} );
                var floor = new THREE.Mesh(floorGeo, floorMat);
                floor.rotateX(Math.PI / 2);
                floor.position.y = -6;
                floor.receiveShadow = true;
                scene.add( floor );
                
                
                
                var light = new THREE.SpotLight( 0xffffff);
                light.position.set( 40,100,20 );
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
                
                scene.add( light );
                
                var spotLightHelper = new THREE.SpotLightHelper( light );
                //scene.add( spotLightHelper );
                
                var icoGeo = new THREE.PlaneGeometry(10,10,400,400);
				var ico = new THREE.Mesh( icoGeo, shaderMaterial2 );
				//scene.add( ico );
                
                var icoGeo = new THREE.IcosahedronGeometry(2,6);
				var ico = new THREE.Mesh( icoGeo, shaderMaterial4 );
                ico.rotateY(Math.PI/2);
                ico.castShadow = true;
                ico.receiveShadow = true;
                ico.customDepthMaterial = new THREE.ShaderMaterial({
                    vertexShader: document.getElementById('vertexShader4').textContent,
                    fragmentShader: THREE.ShaderLib.depthRGBA.fragmentShader,
                    uniforms: shaderMaterial4.uniforms
                });
                
                scene.add( ico );
                
				renderer = new THREE.WebGLRenderer();
                renderer.antialias = true;
				renderer.setPixelRatio( window.devicePixelRatio );
                renderer.shadowMapEnabled = true;
                renderer.shadowMapSoft = true;
                renderer.setClearColor(0xdddddd);
				container.appendChild( renderer.domElement );
                
                controls = new THREE.OrbitControls(camera, renderer.domElement);

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );

				onWindowResize();

				window.addEventListener( 'resize', onWindowResize, false );
				window.addEventListener( 'mousemove', onMouseMove, false );
				window.addEventListener( 'mousedown', onMouseDown, false );
				window.addEventListener( 'mouseup', onMouseUp, false );

			}

			function onWindowResize( event ) {

				renderer.setSize( window.innerWidth, window.innerHeight );

				uniforms.resolution.value.x = renderer.domElement.width;
				uniforms.resolution.value.y = renderer.domElement.height;

                width = window.innerWidth;
                height = window.innerHeight;

			}

			function onMouseMove( event ) {
				mousePoint.x = event.clientX;
				mousePoint.y = event.clientY;

				uniforms.mouse.value.x = event.clientX;
				uniforms.mouse.value.y = event.clientY;
			}

			var timeout;
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

			//

			function animate() {

				requestAnimationFrame( animate );

				render();
				stats.update();

			}

			function render() {
				uniforms.time.value += 0.02;
                //videoTexture.needsUpdate = true;
				renderer.render( scene, camera );

			}
