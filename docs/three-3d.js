// ========================================
// THREE.JS 3D ANIMATION SYSTEM
// Modern 3D backgrounds, particles, and interactive elements
// ========================================

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    particleCount: 1500,
    particleSize: 1.5,
    particleColors: ['#a78bfa', '#6366f1', '#c084fc', '#e879f9', '#f0abfc'],
    geometricShapes: 8,
    floatSpeed: 0.3,
    rotationSpeed: 0.02,
    mouseInfluence: 0.15,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    mobile: window.innerWidth < 768
  };

  // State
  let scene, camera, renderer, composer;
  let particles, geometry, material;
  let shapes = [];
  let mouse = { x: 0, y: 0 };
  let targetMouse = { x: 0, y: 0 };
  let animationId = null;
  let clock = { delta: 0, elapsed: 0, lastTime: 0 };
  let canvas = null;

  // Initialize Three.js
  function initThreeJS() {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      loadThreeJS().then(initThreeJS).catch(console.error);
      return;
    }

    // Create canvas container
    const container = document.createElement('div');
    container.id = 'three-canvas-container';
    container.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
    `;
    document.body.prepend(container);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);
    canvas = renderer.domElement;

    // Create particle system
    createParticles();

    // Create geometric shapes
    createGeometricShapes();

    // Create floating orbs
    createFloatingOrbs();

    // Event listeners
    setupEventListeners();

    // Start animation loop
    animate();

    console.log('✅ Three.js 3D system initialized');
  }

  // Load Three.js dynamically
  function loadThreeJS() {
    return new Promise((resolve, reject) => {
      // Load Three.js
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
      script1.onload = () => {
        // Load post-processing if available
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
        script2.onload = () => {
          const script3 = document.createElement('script');
          script3.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
          script3.onload = () => {
            const script4 = document.createElement('script');
            script4.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/shaders/CopyShader.js';
            script4.onload = () => {
              const script5 = document.createElement('script');
              script5.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js';
              script5.onload = resolve;
              script5.onerror = reject;
              document.head.appendChild(script5);
            };
            script4.onerror = reject;
            document.head.appendChild(script4);
          };
          script3.onerror = reject;
          document.head.appendChild(script3);
        };
        script2.onerror = reject;
        document.head.appendChild(script2);
      };
      script1.onerror = reject;
      document.head.appendChild(script1);
    });
  }

  // Create particle system
  function createParticles() {
    const count = CONFIG.mobile ? CONFIG.particleCount / 3 : CONFIG.particleCount;

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const radius = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random color from palette
      const color = new THREE.Color(CONFIG.particleColors[Math.floor(Math.random() * CONFIG.particleColors.length)]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = CONFIG.particleSize * (0.5 + Math.random() * 1.5);
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    // Custom shader material for particles
    material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: renderer.getPixelRatio() }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 velocity;
        attribute float phase;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPixelRatio;

        void main() {
          vColor = color;

          vec3 pos = position;

          // Floating animation
          float t = uTime + phase;
          pos.x += sin(t * 0.5) * 2.0;
          pos.y += cos(t * 0.3) * 1.5;
          pos.z += sin(t * 0.7) * 1.0;

          // Mouse influence
          float dist = length(vec2(pos.x, pos.y) - uMouse * 50.0);
          float influence = smoothstep(50.0, 0.0, dist) * 0.3;
          pos.x += uMouse.x * influence;
          pos.y += uMouse.y * influence;

          // Velocity drift
          pos += velocity * uTime * 10.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          // Fade based on distance from camera
          vAlpha = smoothstep(80.0, 20.0, -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= vAlpha;

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  // Create geometric shapes (floating polyhedra)
  function createGeometricShapes() {
    const count = CONFIG.mobile ? 3 : CONFIG.geometricShapes;
    const geometries = [
      new THREE.TetrahedronGeometry(3, 0),
      new THREE.OctahedronGeometry(2.5, 0),
      new THREE.IcosahedronGeometry(2, 0),
      new THREE.DodecahedronGeometry(2.5, 0)
    ];

    for (let i = 0; i < count; i++) {
      const geo = geometries[Math.floor(Math.random() * geometries.length)];
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(CONFIG.particleColors[Math.floor(Math.random() * CONFIG.particleColors.length)]),
        metalness: 0.3,
        roughness: 0.4,
        transmission: 0.3,
        thickness: 0.5,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Random position
      mesh.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 80 - 20
      );

      // Random rotation
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      // Animation properties
      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.005,
          z: (Math.random() - 0.5) * 0.005
        },
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.0005 + Math.random() * 0.001,
        floatAmplitude: 2 + Math.random() * 3,
        originalPosition: mesh.position.clone()
      };

      shapes.push(mesh);
      scene.add(mesh);
    }
  }

  // Create floating glow orbs
  function createFloatingOrbs() {
    const orbCount = CONFIG.mobile ? 3 : 6;

    for (let i = 0; i < orbCount; i++) {
      const geometry = new THREE.SphereGeometry(8 + Math.random() * 6, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color(CONFIG.particleColors[Math.floor(Math.random() * CONFIG.particleColors.length)]) },
          uColor2: { value: new THREE.Color(CONFIG.particleColors[Math.floor(Math.random() * CONFIG.particleColors.length)]) }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          varying vec3 vNormal;
          varying vec3 vPosition;

          float noise(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 53.539))) * 43758.5453);
          }

          void main() {
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            float pulse = sin(uTime * 0.5 + length(vPosition) * 0.1) * 0.5 + 0.5;
            vec3 color = mix(uColor1, uColor2, pulse);
            float alpha = fresnel * 0.3 * pulse;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const orb = new THREE.Mesh(geometry, material);
      orb.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60 - 30
      );

      orb.userData = {
        floatSpeed: 0.0003 + Math.random() * 0.0007,
        floatOffset: Math.random() * Math.PI * 2,
        floatAmplitude: 5 + Math.random() * 10,
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        originalPosition: orb.position.clone()
      };

      shapes.push(orb);
      scene.add(orb);
    }
  }

  // Create mouse-following trail particles
  function createMouseTrail() {
    const trailGeometry = new THREE.BufferGeometry();
    const trailCount = 50;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailAlphas = new Float32Array(trailCount);

    for (let i = 0; i < trailCount; i++) {
      trailPositions[i * 3] = 0;
      trailPositions[i * 3 + 1] = 0;
      trailPositions[i * 3 + 2] = 0;
      trailAlphas[i] = 1.0 - i / trailCount;
    }

    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('alpha', new THREE.BufferAttribute(trailAlphas, 1));

    const trailMaterial = new THREE.PointsMaterial({
      color: 0xa78bfa,
      size: 4,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const trail = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(trail);

    return { geometry: trailGeometry, mesh: trail, index: 0 };
  }

  let mouseTrail = null;

  // Setup event listeners
  function setupEventListeners() {
    // Mouse move
    document.addEventListener('mousemove', (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Touch move for mobile
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        targetMouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    }, { passive: true });

    // Window resize
    window.addEventListener('resize', onResize);

    // Visibility change (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
        animationId = null;
      } else if (!animationId) {
        clock.lastTime = performance.now();
        animate();
      }
    });

    // Reduced motion preference change
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      CONFIG.reduceMotion = e.matches;
    });
  }

  // Handle resize
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  }

  // Animation loop
  function animate(time = 0) {
    if (document.hidden) return;

    animationId = requestAnimationFrame(animate);

    // Calculate delta time
    clock.delta = (time - clock.lastTime) * 0.001;
    clock.elapsed = time * 0.001;
    clock.lastTime = time;

    // Skip heavy animation if reduced motion
    if (CONFIG.reduceMotion) {
      renderer.render(scene, camera);
      return;
    }

    // Smooth mouse interpolation
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;
    material.uniforms.uMouse.value.set(mouse.x, mouse.y);
    material.uniforms.uTime.value = clock.elapsed;

    // Animate particles
    if (particles) {
      particles.rotation.y += CONFIG.rotationSpeed * 0.1;
      particles.rotation.x += CONFIG.rotationSpeed * 0.05;
    }

    // Animate shapes
    shapes.forEach((shape, i) => {
      // Rotation
      shape.rotation.x += shape.userData.rotationSpeed.x;
      shape.rotation.y += shape.userData.rotationSpeed.y;
      shape.rotation.z += shape.userData.rotationSpeed.z;

      // Floating
      const t = clock.elapsed + shape.userData.floatOffset;
      shape.position.y = shape.userData.originalPosition.y +
        Math.sin(t * shape.userData.floatSpeed * 1000) * shape.userData.floatAmplitude;
      shape.position.x = shape.userData.originalPosition.x +
        Math.cos(t * shape.userData.floatSpeed * 800) * shape.userData.floatAmplitude * 0.5;

      // Mouse attraction for shapes
      const attraction = 0.02;
      shape.position.x += mouse.x * attraction;
      shape.position.y += mouse.y * attraction;

      // Update orb shader time
      if (shape.material.uniforms && shape.material.uniforms.uTime) {
        shape.material.uniforms.uTime.value = clock.elapsed;
      }
    });

    // Subtle camera movement
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.01;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.01;
    camera.lookAt(0, 0, 0);

    // Render
    renderer.render(scene, camera);
  }

  // Public API
  window.ThreeJS3D = {
    init: initThreeJS,
    destroy: () => {
      cancelAnimationFrame(animationId);
      if (renderer) {
        renderer.dispose();
      }
      if (canvas && canvas.parentNode) {
        canvas.parentNode.remove();
      }
    },
    setReducedMotion: (enabled) => {
      CONFIG.reduceMotion = enabled;
    },
    getConfig: () => CONFIG
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeJS);
  } else {
    initThreeJS();
  }

})();