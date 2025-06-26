  const container = document.getElementById('canvas-container');
        let scene, camera, renderer, truck, road, clock;
        let truckPassed = false;
        let truckStopped = false;
        
        init();
        animate();
        
        function init() {
            // Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0f0f13);
            scene.fog = new THREE.FogExp2(0x0f0f13, 0.002);
            
            // Camera
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 5, 15);
            camera.lookAt(0, 2, 0);
            
            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);
            
            // Lights
            const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
            directionalLight.position.set(10, 20, 10);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            scene.add(directionalLight);
            
            const hemisphereLight = new THREE.HemisphereLight(0x646cff, 0xff6b6b, 0.3);
            scene.add(hemisphereLight);
            
            // Road
            const roadGeometry = new THREE.PlaneGeometry(100, 10);
            const roadMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x222233,
                roughness: 0.8,
                metalness: 0.2
            });
            road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.rotation.x = -Math.PI / 2;
            road.position.y = 0;
            road.receiveShadow = true;
            scene.add(road);
            
            // Road markings
            for (let i = -50; i < 50; i += 5) {
                const lineGeometry = new THREE.PlaneGeometry(3, 0.2);
                const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.rotation.x = -Math.PI / 2;
                line.position.set(i, 0.01, 0);
                scene.add(line);
            }
            
            // Simple truck model
            createTruck();
            
            // Environment
            createEnvironment();
            
            // Clock for animations
            clock = new THREE.Clock();
            
            // Window resize handler
            window.addEventListener('resize', onWindowResize);
        }
        
        function createTruck() {
            // Truck cabin
            const cabinGeometry = new THREE.BoxGeometry(2, 1.5, 2);
            const cabinMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x646cff,
                roughness: 0.4,
                metalness: 0.6
            });
            const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
            cabin.position.set(0, 1.25, 0);
            cabin.castShadow = true;
            
            // Truck trailer
            const trailerGeometry = new THREE.BoxGeometry(4, 2, 2);
            const trailerMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x444466,
                roughness: 0.6,
                metalness: 0.2
            });
            const trailer = new THREE.Mesh(trailerGeometry, trailerMaterial);
            trailer.position.set(-3, 1.5, 0);
            trailer.castShadow = true;
            
            // Wheels
            const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
            const wheelMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x222222,
                roughness: 0.7,
                metalness: 0.5
            });
            
            const wheels = [];
            const wheelPositions = [
                { x: -1.5, y: 0.5, z: 1.2 },
                { x: -1.5, y: 0.5, z: -1.2 },
                { x: 1, y: 0.5, z: 1.2 },
                { x: 1, y: 0.5, z: -1.2 },
                { x: -4, y: 0.5, z: 1.2 },
                { x: -4, y: 0.5, z: -1.2 }
            ];
            
            wheelPositions.forEach(pos => {
                const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(pos.x, pos.y, pos.z);
                wheel.castShadow = true;
                wheels.push(wheel);
            });
            
            // Group everything together
            truck = new THREE.Group();
            truck.add(cabin);
            truck.add(trailer);
            wheels.forEach(wheel => truck.add(wheel));
            
            // Initial position (start off-screen to the left)
            truck.position.set(-30, 0, 0);
            
            scene.add(truck);
        }
        
        function createEnvironment() {
            // Buildings
            const buildingGeometry = new THREE.BoxGeometry(5, 10, 5);
            const buildingMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x1a1a2e,
                roughness: 0.8,
                metalness: 0.1
            });
            
            // Add some buildings along the road
            for (let i = -40; i < 40; i += 8) {
                if (Math.abs(i) < 15) continue; // Leave space near the camera
                
                const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
                building.position.set(i, 5, Math.random() > 0.5 ? -8 : 8);
                building.castShadow = true;
                building.receiveShadow = true;
                
                // Random height
                building.scale.y = 0.5 + Math.random() * 1.5;
                
                scene.add(building);
            }
            
            // Street lights
            const lightGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
            const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            const bulbGeometry = new THREE.SphereGeometry(0.2);
            const bulbMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffffcc,
                emissive: 0xffff99,
                emissiveIntensity: 1
            });
            
            for (let i = -40; i < 40; i += 10) {
                const pole = new THREE.Mesh(lightGeometry, lightMaterial);
                pole.position.set(i, 0.25, -5);
                scene.add(pole);
                
                const arm = new THREE.Mesh(lightGeometry, lightMaterial);
                arm.position.set(i, 2.5, -5);
                arm.rotation.z = Math.PI / 2;
                arm.scale.x = 2;
                scene.add(arm);
                
                const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
                bulb.position.set(i, 2.5, -5.5);
                scene.add(bulb);
                
                // Add light
                const pointLight = new THREE.PointLight(0xffff99, 1, 10);
                pointLight.position.set(i, 2.5, -5.5);
                pointLight.castShadow = true;
                scene.add(pointLight);
            }
        }
        
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        function animate() {
            requestAnimationFrame(animate);
            
            const delta = clock.getDelta();
            
            // Move the truck forward if it hasn't stopped
            if (!truckStopped) {
                truck.position.x += 0.2;
                
                // Rotate wheels
                truck.children.forEach(child => {
                    if (child.geometry instanceof THREE.CylinderGeometry) {
                        child.rotation.x += 0.1;
                    }
                });
                
                // Check if truck is passing by (near center)
                if (truck.position.x > -5 && truck.position.x < 5 && !truckPassed) {
                    truckPassed = true;
                    showForm();
                }
                
                // Stop truck when it reaches center
                if (truck.position.x >= 0) {
                    truckStopped = true;
                }
            }
            
            renderer.render(scene, camera);
        }
        
        function showForm() {
            document.getElementById('predictionForm').classList.add('visible');
        }
        