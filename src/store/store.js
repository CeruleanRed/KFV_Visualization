import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';

Vue.use(Vuex);

const POSSIBLE_CATEGORIES = {
  BUNDESLAND: "Bundesland",
  VERKEHRSART: "Verkehrsart",
  GEBIET: "Gebiet",
  WOCHENTAG: "Wochentag",
  GESCHLECHT: "Geschlecht"
};

const store = new Vuex.Store({
  state: {
    selectedCategory: POSSIBLE_CATEGORIES.BUNDESLAND,
    baseData: {},
  },
  mutations: {
    changeSelectedCategory (state, category) { state.selectedCategory = category; }
  },
  getters: {
    baseData: (state) => state.baseData,
    selectedCategory: (state) => state.selectedCategory,
    possibleYears: (state) => {
      return [...new Set(state.baseData.verkehrstote.map(d => d.Jahr))].sort();
    },
    possibleLabels: (state) => {
      return [...new Set(state.baseData.verkehrstote.map(d => d[state.selectedCategory]))].sort();
    },
    colorArray: () => {
      return ['#000063','#75008f','#999999','#00c22a','#0081c2','#ffff33','#e35f00','#c20000','#00d69a'];
    },
    dataByCategory: (state) => {
      let dataByCategory = d3.rollup(state.baseData.verkehrstote, d => d3.sum(d, d => d.Getoetete), d => d.Jahr, d => d[state.selectedCategory]);
      return new Map([...dataByCategory].sort());
    },
    labelBundesland: () =>{ return POSSIBLE_CATEGORIES.BUNDESLAND; },
    labelVerkehrsart: () =>{ return POSSIBLE_CATEGORIES.VERKEHRSART; },
    labelGebiet: () =>{ return POSSIBLE_CATEGORIES.GEBIET; },
    labelWochentag: () =>{ return POSSIBLE_CATEGORIES.WOCHENTAG; },
    labelGeschlecht: () =>{ return POSSIBLE_CATEGORIES.GESCHLECHT; },
    possibleCategories: () => {return Object.values(POSSIBLE_CATEGORIES); }
  },
  actions: {
    loadData({state}) {
      d3.json("https://dashboards.kfv.at/api/verkehrstote/json").then((data)=> {
        state.baseData = data;
      }).catch(err => console.log(err));
    },
  }
})

export default store;
