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
    <audio id="audio" controls :hidden="!showAudio"></audio>
    <div id="out"></div>

    <Toast style="opacity: 0.7;"/>
    <ThreeVisualiser :audioProp="audioElem" :audioStream="stream" />
    <SpeedDial
      :tooltipOptions="{ position: 'left' }"
      :model="items"
      :transitionDelay="80"
      :showIcon="speedDialIcon"
      :style="
        'position: fixed; bottom: ' +
        speedDialOffset +
        'px; right: 10px; z-index: 15; text-decoration: none;'
      "
      :disabled="isStreaming"
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
      audioElem: null,
      stream: null,
      isLooping: false,
      isStreaming: false,
      auraInterval: null,
      showAudio: false,
    };
  },
  computed: {
    items() {
      let uploadButton = {
        label: "Upload MP3",
        icon: "pi pi-upload",
        command: () => this.triggerFileUpload(),
      };

      let loopButton = {
        label: "Loop Audio",
        icon: "pi pi-sync",
        command: () => this.triggerLoop(),
        disabled: !this.showAudio,
      };

      let streamButton = {
        label: "Stream",
        icon: "pi pi-desktop",
        command: () => this.triggerStream(),
      };

      let menuButtons = [uploadButton]; // Common buttons across all devices

      if (this.isMobile() || this.showAudio) {
        menuButtons = [...menuButtons, loopButton];
      } 
      else {
        menuButtons = [...menuButtons, loopButton, streamButton];
      }

      return menuButtons;
    },
    speedDialIcon() {
      return this.isStreaming
        ? "pi pi-sync pi-desktop"
        : this.isLooping
        ? "pi pi-sync pi-spin"
        : "pi pi-star-fill";
    },
    speedDialOffset() {
      return this.showAudio ? 90 : 20;
    },
  },
  methods: {
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },

    handleFileUpload(event) {
      this.audioElem = document.getElementById("audio");
      const file = event.target.files[0];

      if (!file) return;

      this.title = file.name.substring(0, 31);

      if (this.title !== file.name) {
        this.title += "...";
      }

      this.audioElem.src = URL.createObjectURL(file);

      this.audioElem.load();

      this.audioElem.muted = false;
      this.showAudio = true;

      this.audioElem.play();

      // Start the aura animation
      this.audioElem.addEventListener("play", this.startAuraAnimation);

      // Stop the aura animation
      this.audioElem.addEventListener("pause", this.stopAuraAnimation);
    },

    triggerStream() {
      navigator.mediaDevices
        .getDisplayMedia({
          video: { displaySurface: "browser" },
          audio: true,
        })
        .then((media) => {
          // this.showAudio = false;
          const audioTracks = media.getAudioTracks();
          if (audioTracks.length > 0) {
            this.startAuraAnimation();
            this.stream = media;
            this.isStreaming = true;
          } else {
            this.$toast.add({ severity: 'info', summary: 'No Audio Detected', detail: 'Did you enable audio sharing?', life: 3000 });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    triggerLoop() {
      if (this.audioElem) {
        document.getElementById("audio").loop =
          !document.getElementById("audio").loop;
        this.isLooping = !this.isLooping;
      }
    },

    startAuraAnimation() {
      // Clear existing interval (Stream Mode -> Upload Mode (Not Implemented))
      if (this.auraInterval) {
        clearInterval(this.auraInterval);
      }
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
    isMobile() {
      let check = false;
      /* eslint-disable */
      (function (a) {
        if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
            a
          ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4)
          )
        )
          check = true;
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    },
  },
};
</script>

<style>
@font-face {
  font-family: HemiHead;
  src: url("../../public/fonts/hemi head bd it.otf");
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.visualiser-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.5);
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

/* OVERWRITE PRIMEVUE COMPONENT STYLING */

.p-speeddial-button {
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
