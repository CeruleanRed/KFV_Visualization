<template>
  <div class="vis-component" ref="chart">
    <select name="categoryOptions" id="categories">
    </select>
  </div>
</template>

<script>

export default {
  name: 'LabelChanger',
  props: {
  },
  data() {
    return {
      svgWidth: 0,
      svgHeight: 700,
      svgPadding: {
        top: 100, right: 70, bottom: 70, left: 70,
      },
    }
  },
  mounted() {
    this.drawSelect();
  },
  methods: {
    drawSelect(){
      this.addSelectOptions();
      this.addSelectOnClickListener();
    },

    addSelectOptions(){
      this.possibleCategories.forEach(category => {
          let option = document.createElement("option");
          option.value = category;
          option.text = category;
          this.selectElement.add(option);
      });
    },

    addSelectOnClickListener(){
        this.selectElement.addEventListener('change', event => {
            this.$store.commit('changeSelectedCategory', event.target.value)
        });
    }
  },
  computed: {
    possibleCategories: { get() { return this.$store.getters.possibleCategories; } },
    selectElement() {return document.getElementById('categories'); },
  },
  watch: {
  },
}
</script>
