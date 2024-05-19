<template>
  <div id="app">
    <AudioVisualiser />
  </div>
</template>

<script>
import AudioVisualiser from "./components/AudioVisualiser.vue";

export default {
  name: "App",
  components: {
    AudioVisualiser,
  },
};
</script>

<style>
body {
  padding: 0;
  margin: 0;
}

#app {
  background-image: url("../public/img/background.png");
  background-repeat: no-repeat;
  background-size: cover;
}
</style>