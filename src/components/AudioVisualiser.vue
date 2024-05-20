<template>
  <div class="visualiser-wrapper">
    <input
      @change="handleFileUpload"
      type="file"
      accept="audio/*"
      ref="fileInput"
      hidden
    />

    <h1 id="title">{{ title }}</h1>
    <img id="anime" src="../../public/img/anime.png" />
    <audio id="audio" controls></audio>
    <div id="out"></div>

    <ThreeVisualiser :audioProp="audio" />
    <SpeedDial
      :tooltipOptions="{ position: 'left' }"
      :model="items"
      :transitionDelay="80"
      :showIcon="speedDialIcon"
      :style="'position: fixed; bottom: 90px; right: 10px; z-index: 15; text-decoration: none;'"
      hideIcon="pi pi-times"
      buttonClass="p-button-info"
      direction="up"
      mask
    />
  </div>
</template>

<script>
import ThreeVisualiser from "./ThreeVisualiser.vue";

export default {
  name: "AudioVisualiser",
  components: {
    ThreeVisualiser,
  },
  data() {
    return {
      title: "Audio Visualiser",
      items: [
        {
          label: "Upload MP3",
          icon: "pi pi-upload",
          command: () => this.triggerFileUpload(),
        },
        {
          label: "Loop",
          icon: "pi pi-sync",
          command: () => this.triggerLoop(),
        },
      ],
      audio: null,
      isLooping: false,
      auraInterval: null,
    };
  },
  computed: {
    speedDialIcon() {
      return this.isLooping ? "pi pi-sync pi-spin" : "pi pi-star-fill";
    },
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

      this.audio.play();

      // Start the aura animation
      this.audio.addEventListener("play", this.startAuraAnimation);

      // Stop the aura animation
      this.audio.addEventListener("pause", this.stopAuraAnimation);
    },

    triggerLoop() {
      document.getElementById("audio").loop =
        !document.getElementById("audio").loop;
      this.isLooping = !this.isLooping;
    },

    startAuraAnimation() {
      // Start the interval for aura animation
      this.auraInterval = setInterval(this.animateAura, 10); // Change interval duration as needed
    },

    stopAuraAnimation() {
      // Clear the interval for aura animation
      clearInterval(this.auraInterval);
      document.getElementById("anime").style.filter = "none";
    },

    animateAura() {
      // Character drop shadow
      const dropShadowX = (Math.random() - 0.5) * 10;
      const dropShadowY = (Math.random() - 0.5) * 10;
      const dropShadowBlur = 5 + Math.random();
      const dropShadowColor = `#${Math.floor(Math.random() * 16777215).toString(
        16
      )}`;
      document.getElementById(
        "anime"
      ).style.filter = `drop-shadow(${dropShadowX}px ${dropShadowY}px ${dropShadowBlur}px ${dropShadowColor})`;
    },
  },
};
</script>

<style>
.visualiser-wrapper {
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

audio {
  position: fixed;
  left: 10px;
  bottom: 20px;
  width: calc(100% - 20px);
  z-index: 15; /* Ensure it stays in front of everything else */
}

@media (max-height: 600px) {
  #anime {
    width: 80%; /* Adjust the max-height for smaller screens */
  }
}

/* STYLING AUDIO CONTROL PANEL */
audio::-webkit-media-controls-panel {
  border-radius: 20%;
}

/* OVERWRITE PRIMEVUE COMPONENT STYLING */

.p-speeddial-button.p-button.p-button-icon-only {
  width: 4rem;
  height: 4rem;
  margin-top: 15px;
  background: rgba(114, 0, 80, 0.2);
  border: 1px solid rgba(245, 245, 245, 0.4);
}

.p-speeddial-action {
  width: 3.3rem;
  height: 3.3rem;
  background: #000;
  color: #fff;
  outline: 1px solid #fff;
  margin-top: 5px;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
}
</style>
