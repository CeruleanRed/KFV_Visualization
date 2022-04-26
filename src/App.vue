<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-11">
          <StackedAreaChart />
        </div>
      </div>
      <div class="row">
        <div class="col-md-2">
          <LabelChanger />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StackedAreaChart from './components/StackedAreaChart.vue'
import LabelChanger from './components/LabelChanger.vue'

export default {
  name: 'App',
  components: {
    StackedAreaChart, LabelChanger
  },
  mounted() {
    this.$store.dispatch('loadData');
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
</style>
