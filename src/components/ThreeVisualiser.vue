<template>
  <div ref="canvasContainer" class="visualiser-container"></div>
</template>

<script>
import * as THREE from "three";

export default {
  data() {
    return {
      animationFrameId: 0,
      bars: [],
    };
  },
  props: {
    audioProp: Object,
  },
  watch: {
    audioProp() {
      this.play();
    },
  },
  methods: {
    // Set up Three.JS camera, character halo
    initThreeJS() {
      this.scene = new THREE.Scene();
      this.group = new THREE.Group();

      // Set up Orthographic Camera
      const aspectRatio =
        this.$refs.canvasContainer.clientWidth /
        this.$refs.canvasContainer.clientHeight;
      const frustumSize = 100;
      this.camera = new THREE.OrthographicCamera(
        (frustumSize * aspectRatio) / -2,
        (frustumSize * aspectRatio) / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
      );

      this.camera.position.set(0, 0, 100);
      this.camera.lookAt(this.scene.position);
      this.scene.add(this.camera);

      // Set up  renderer
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      const width = this.$refs.canvasContainer.clientWidth;
      const height = this.$refs.canvasContainer.clientHeight;

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.$refs.canvasContainer.appendChild(this.renderer.domElement);

      const light = new THREE.AmbientLight(0xffffff, 1);

      this.scene.add(light);

      window.addEventListener("resize", this.onWindowResize);
    },

    // Create character halo
    createHalo() {
      const planeGeometry = new THREE.RingGeometry(10, 12, 1000);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x3de5ff,
        side: THREE.DoubleSide,
      });

      this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
      this.plane.rotation.x = Math.PI / 4;
      this.plane.position.x -= 1.5; // Halo X offset

      this.group.add(this.plane);

      this.scene.add(this.group);
    },

    // Generate audio bars
    createBars(bufferLength) {
      const barWidth = 2;
      const barSpacing = 0.3;
      const startX = -((bufferLength * (barWidth + barSpacing)) / 2);
      const barMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.3,
        transparent: true,
      });

      const canvasContainerHeight = this.$refs.canvasContainer.offsetHeight;
      const bottomOffset = canvasContainerHeight * 0.5 - 50;

      for (let i = 0; i < bufferLength; i++) {
        const geometry = new THREE.BoxGeometry(barWidth, 1, 1);
        const bar = new THREE.Mesh(geometry, barMaterial);

        bar.position.x = startX + i * (barWidth + barSpacing);
        bar.position.y = -canvasContainerHeight / 2 + bottomOffset;

        this.bars.push(bar);
        this.scene.add(bar);
      }
    },

    // Audio starts playing
    play() {
      this.context.resume();

      // ERROR: Failed to execute 'createMediaElementSource' on 'AudioContext': HTMLMediaElement already connected previously to a different MediaElementSourceNode.
      // But it still works :D
      this.src = this.context.createMediaElementSource(this.audioProp);

      this.src.connect(this.analyser);

      this.analyser.connect(this.context.destination);

      this.analyser.fftSize = 512;

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.initThreeJS();
      this.createHalo();
      this.createBars(bufferLength);

      this.animate();
    },

    // Animation loop
    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate);

      this.analyser.getByteFrequencyData(this.dataArray);

      // Scale audio bars
      const barCount = this.bars.length;
      const bandSize = Math.floor(this.dataArray.length / barCount);
      const threshold = 0.1; // Smoothing threshold factor

      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < bandSize; j++) {
          sum += this.dataArray[i * bandSize + j];
        }
        const averageValue = sum / bandSize;
        const targetScale = (averageValue / 256) * 150;

        // Apply threshold smoothing
        if (Math.abs(targetScale - this.bars[i].scale.y) > threshold) {
          this.bars[i].scale.y += (targetScale - this.bars[i].scale.y) * 0.1;
        }
      }

      // Halo bounce
      let average = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        average += this.dataArray[i];
      }
      average = average / this.dataArray.length;

      const bounceHeight = (average / 256) * 5 + 4.7;
      this.plane.position.y = bounceHeight;

      // Halo color change
      const ratio = (average / 256) * 1.5;
      const startColor = new THREE.Color(0x3de5ff);
      const endColor = new THREE.Color(0xffffff);
      const currentColor = startColor.lerp(endColor, ratio);

      this.plane.material.color.set(currentColor);

      this.renderer.render(this.scene, this.camera);
    },

    // Handle change in window size
    onWindowResize() {
      const width = this.$refs.canvasContainer.clientWidth;
      const height = this.$refs.canvasContainer.clientHeight;

      const aspectRatio = width / height;
      const frustumSize = 100;

      this.camera.left = (frustumSize * aspectRatio) / -2;
      this.camera.right = (frustumSize * aspectRatio) / 2;
      this.camera.top = frustumSize / 2;
      this.camera.bottom = frustumSize / -2;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
    },
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
    if (this.context) {
      this.context.close();
    }
    cancelAnimationFrame(this.animationFrameId);
  },

  created() {
    this.context = new AudioContext();
    this.analyser = this.context.createAnalyser();
  },
};
</script>

<style scoped>
.visualiser-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>