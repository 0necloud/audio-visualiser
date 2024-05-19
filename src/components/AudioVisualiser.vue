<template>
  <div ref="canvasContainer" class="visualiser-container">
    <input
      type="file"
      accept="audio/*"
      @change="handleFileUpload"
      hidden
      ref="fileInput"
    />

    <h1 id="title">{{ title }}</h1>
    <img id="anime" src="../../public/img/anime.png" />
    <audio id="audio" controls></audio>
    <div id="out"></div>
    <Button
      id="upload"
      label="Upload MP3"
      icon="pi pi-upload"
      @click="triggerFileUpload"
    />
  </div>
</template>

<script>
import * as THREE from "three";

export default {
  name: "AudioVisualiser",
  data() {
    return {
      title: "Audio Visualiser",
      animationFrameId: 0,
      bars: [],
    };
  },
  methods: {
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      this.audio = document.getElementById("audio");
      const file = event.target.files[0];

      if (!file) return;

      this.title = file.name.substring(0, 31);

      if (this.title !== file.name) {
        this.title += "...";
      }

      this.audio.src = URL.createObjectURL(file);

      this.audio.load();
      this.context.resume();
      this.audio.play();

      this.play();
    },
    play() {
      // this.context = this.context || new AudioContext();
      // this.analyser = this.analyser || this.context.createAnalyser();

      // Failed to execute 'createMediaElementSource' on 'AudioContext': HTMLMediaElement already connected previously to a different MediaElementSourceNode.
      // But it still works :D
      this.src = this.context.createMediaElementSource(this.audio);

      this.src.connect(this.analyser);

      this.analyser.connect(this.context.destination);

      this.analyser.fftSize = 512;

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.initThreeJS();
      this.createBars(bufferLength);

      this.animate();
    },
    initThreeJS() {
      this.scene = new THREE.Scene();
      this.group = new THREE.Group();

      // Setup Camera
      this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.camera.position.set(0, 0, 100);
      this.camera.lookAt(this.scene.position);
      this.scene.add(this.camera);

      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      const width = this.$refs.canvasContainer.clientWidth;
      const height = this.$refs.canvasContainer.clientHeight;

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.$refs.canvasContainer.appendChild(this.renderer.domElement);

      // Create Halo
      const planeGeometry = new THREE.RingGeometry(9.5, 11, 1000);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x3de5ff,
        side: THREE.DoubleSide,
      });

      this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
      this.plane.rotation.x = Math.PI / 4;
      this.plane.position.x -= 1.5; // Halo X offset

      this.group.add(this.plane);

      this.scene.add(this.group);

      const light = new THREE.AmbientLight(0xffffff, 1);

      this.scene.add(light);

      window.addEventListener('resize', this.onWindowResize);
    },
    createBars(bufferLength) {
      const barWidth = 2;
      const barSpacing = 0.75;
      const startX = -((bufferLength * (barWidth + barSpacing)) / 2);
      const barMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });

      const canvasContainerHeight = this.$refs.canvasContainer.offsetHeight;
      const bottomOffset = canvasContainerHeight * 0.5 - 42;

      for (let i = 0; i < bufferLength; i++) {
        const geometry = new THREE.BoxGeometry(barWidth, 1, 1);
        const bar = new THREE.Mesh(geometry, barMaterial);

        bar.position.x = startX + i * (barWidth + barSpacing);
        bar.position.y = -canvasContainerHeight / 2 + bottomOffset;

        this.bars.push(bar);
        this.scene.add(bar);
      }
    },
    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate);

      this.analyser.getByteFrequencyData(this.dataArray);

      for (let i = 0; i < this.dataArray.length; i++) {
        const scale = (this.dataArray[i] / 256) * 150;
        this.bars[i].scale.y = scale;
      }

      // Halo Bounce
      let average = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        average += this.dataArray[i];
      }
      average = average / this.dataArray.length;

      const bounceHeight = (average / 256) * 5 + 2;
      this.plane.position.y = bounceHeight;

      // Halo Color Change
      const ratio = average / 256 * 1.5;
      const startColor = new THREE.Color(0x3de5ff);
      const endColor = new THREE.Color(0xffffff);
      const currentColor = startColor.lerp(endColor, ratio);

      this.plane.material.color.set(currentColor);

      // Character Drop Shadow
      const dropShadowX = (Math.random() - 0.5) * 10;
      const dropShadowY = (Math.random() - 0.5) * 10;
      const dropShadowBlur = 5 + Math.random();
      const dropShadowColor = `#${Math.floor(Math.random() * 16777215).toString(
        16
      )}`;
      document.getElementById(
        "anime"
      ).style.filter = `drop-shadow(${dropShadowX}px ${dropShadowY}px ${dropShadowBlur}px ${dropShadowColor})`;

      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {
      const width = this.$refs.canvasContainer.clientWidth;
      const height = this.$refs.canvasContainer.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
    },
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.audioContext) {
      this.audioContext.close();
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
  background-color: rgba(0, 0, 0, 0.5);
}

@font-face {
  font-family: HemiHead;
  src: url("../../public/fonts/hemi head bd it.otf");
}

#title {
  position: absolute;
  top: 10%;
  font-family: HemiHead;
  color: white;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: 100%;
}

#anime {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  /* max-width: 100%; */
  max-height: 70%;
  object-fit: contain;
  z-index: 10;
  /* filter: drop-shadow(0px 0px 0px #fc03cf); */
  transition: filter 0.1s ease;
}

#upload {
  position: fixed;
  bottom: -4px;
  right: 10px;
  z-index: 15;
}

audio {
  position: fixed;
  left: 10px;
  bottom: 50px;
  width: calc(100% - 20px);
  z-index: 15; /* Ensure it stays in front of everything else */
}

@media (max-height: 600px) {
  #anime {
    width: 80%; /* Adjust the max-height for smaller screens */
  }
}
</style>
