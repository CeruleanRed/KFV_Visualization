<template>
  <div class="vis-component" ref="chart">
    <svg id="main-svg" :width="svgWidth + svgPadding.right + svgPadding.left" :height="svgHeight">
      <g class="legend-group" ref="legendGroup">
      </g>
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="area-group" ref="areaGroup"></g>
        <g class="line-group" ref="lineGroup"></g>
        <g class="hover-circles" ref="hoverCircles"></g>
        <g class="hover-area" ref="hoverArea"></g>
      </g>
    </svg>
  </div>
</template>

<script>

import * as d3 from 'd3';

export default {
  name: 'StackedAreaChart',
  props: {
  },
  data() {
    return {
      svgWidth: 0,
      svgHeight: 700,
      svgPadding: {
        top: 100, right: 200, bottom: 70, left: 70,
      },
    }
  },
  mounted() {
  },
  methods: {
    drawChart() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth ;
      d3.select(this.$refs.chartGroup)
        .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);

      d3.select(this.$refs.legendGroup)
        .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);

      this.removeExistingDrawing();
      this.drawTitle();
      this.drawAxisLabels();
      this.drawLegend();
      this.drawXAxis();
      this.drawYAxis();
      this.drawArea();
      this.drawLine();
      this.addHoverArea();
    },

    drawXAxis() {
      d3.select(this.$refs.axisX)
        .attr('transform', `translate( 0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom} )`)
        .call(d3.axisBottom(this.xScale).ticks(this.possibleYears.length + 1).tickFormat(d3.timeFormat("%Y")))
        .attr('x', this.svgWidth - (this.svgPadding.left + this.svgPadding.right))
        .selectAll('text')
        .attr('y', '0.72em');
    },

    drawYAxis() {
      d3.select(this.$refs.axisY)
        .call(d3.axisLeft(this.yScale))
    },

    drawArea(){
      const areaGroup = d3.select(this.$refs.areaGroup);
      areaGroup.selectAll("layers")
        .data(this.dataSeries)
        .join("path")
        .style("fill", d => { return this.colorScale(d.key);})
        .style("opacity", 0.5)
        .attr("d", d3.area()
            .x(d => { return this.xScale(this.timeParser(d.data[0])); })
            .y0(d => { return this.yScale(d[0]); })
            .y1(d => { return this.yScale(d[1]); })
        )
    },

    drawLine(){
      const lineGroup = d3.select(this.$refs.lineGroup);
      lineGroup.selectAll(".line")
      .data(this.dataSeries)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", d => {return this.colorScale(d.key);})
      .attr("stroke-width", 3)
      .attr("d", d => {
        const line = d3.line()
          .x(a => { return this.xScale(this.timeParser(a.data[0])); })
          .y(a => {return this.yScale(a[1]); });
        return line(d);
      });
    },

    drawLegend(){
      const legendGroup = d3.select(this.$refs.legendGroup);
      let labelGroups = legendGroup.selectAll('g')
        .data(this.possibleLabels)
        .join('g');
      
      labelGroups.append("circle")
        .attr("cx", () => 0)
        .attr("cy", () => -20 )
        .attr("r", 7)
        .style("fill", (d) => this.colorScale(d))

      labelGroups.append("text")
        .attr("x", () => 10)
        .attr("y", () => -20)
        .style("fill", "#424242")
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

      const padding = 10
      labelGroups.attr("transform", (d, i) => {
        return "translate("+(d3.sum(this.possibleLabels, (e,j) => {
          if (j < i) { return labelGroups.nodes()[j].getBBox().width; } else return 0; }) + padding * i) + ",0)";
      })
    },

    drawTitle(){
      d3.select(this.$refs.chartGroup).append("text")
      .attr("class", "title")
      .attr("x", this.svgWidth/2)
      .attr("y", 0 - (this.svgPadding.top / 2))
      .attr("font-size", "22px")
      .attr("text-anchor", "middle")
      .text("Getötete im Straßenverkehr in Österreich");
    },

    drawAxisLabels(){
      //create the x axis label
      let xAxisLabelGroup = d3.select(this.$refs.axisX)
      .append("g")
      .attr("fill", "black")
      .attr("font-size", "18px")
      .attr("transform", `translate(${this.svgWidth/2}, 50)`);

      xAxisLabelGroup.append("text")
                .attr("dy", "0em")
                .text("Berichtsjahr");

      //create the y axis label
      let yAxisLabelGroup = d3.select(this.$refs.axisY)
      .append("g")
      .attr("fill", "black")
      .attr("font-size", "18px")
      .attr("text-anchor", "middle")
      .attr("y", 60)
      .attr("dy", ".75em")
      .attr("transform", `translate(-50, ${this.svgHeight/2 - this.svgPadding.top})`)

      yAxisLabelGroup.append("text")
                .attr("dy", "0em")
                .attr('transform', 'rotate(-90)')
                .text("Getötete");
    },

    addHoverArea(){
      const hoverArea = d3.select(this.$refs.hoverArea);
      hoverArea.append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight - (this.svgPadding.top + this.svgPadding.bottom))
      .on('mouseover', this.mouseoverHandler)
      .on('mousemove', this.mousemoveHandler)
      .on('mouseout', this.mouseoutHandler);
    },

    mouseoverHandler(){},
    mousemoveHandler(event){
      let x0 = this.xScale.invert(d3.pointer(event)[0] + (this.svgWidth / this.possibleYears.length) / 2);
      let year = x0.getYear() + 1900;
      console.log(year);

      const hoverCircles = d3.select(this.$refs.hoverCircles);
      hoverCircles.selectAll('*').remove();

      hoverCircles.selectAll(".hoverCircle")
      .data(this.dataSeries)
        .join("circle")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("cx", () => this.xScale(this.timeParser(year.toString())))
        .attr("cy", d => this.yScale(d[year-this.possibleYears[0]][1]) )
        .attr("r", 5)
        .attr("fill", d => {return this.colorScale(d.key);})

      hoverCircles.selectAll(".hoverLabels")
      .data(this.dataSeries)
        .join("text")
        .attr("x", () => this.xScale(this.timeParser(year.toString())) + 5) //magic number to offset the text nicely
        .attr("y", d => this.yScale(d[year-this.possibleYears[0]][1]) - 10) //magic number to offset the text nicely
        .text(d => d[year-this.possibleYears[0]][1] - d[year-this.possibleYears[0]][0])
        .attr("text-anchor", "center")
    },
    mouseoutHandler(){},

    removeExistingDrawing(){
      d3.select(this.$refs.axisX).selectAll('*').remove();
      d3.select(this.$refs.axisY).selectAll('*').remove();
      d3.select(this.$refs.legendGroup).selectAll('*').remove();
      d3.select(this.$refs.areaGroup).selectAll('*').remove();
      d3.select(this.$refs.lineGroup).selectAll('*').remove();
      d3.select(this.$refs.hoverCircles).selectAll('*').remove();
    },
  },
  computed: {
    baseData: { get() { return this.$store.getters.baseData; } },
    selectedCategory: { get() { return this.$store.getters.selectedCategory; } },
    possibleYears: { get() {return this.$store.getters.possibleYears; }},
    possibleLabels: { get() {return this.$store.getters.possibleLabels; }},
    dataByCategory: { get() {return this.$store.getters.dataByCategory; }},
    colorArray: { get() {return this.$store.getters.colorArray; }},

    yearsArray() {
        return this.possibleYears;
    },
    timeParser() { return d3.timeParse("%Y"); },
    dataMax() {
        return d3.max(this.dataByCategory, d => {return d3.sum(d[1], s => s[1])}) * 1.05;
    },
    dataMin() {
      return d3.min(this.dataByCategory, d => {return d3.sum(d[1], s => s[1])});
    },
    xScale() {
        return d3.scaleTime()
            .domain(d3.extent(this.yearsArray, d => this.timeParser(d)))
            .range([ 0, this.svgWidth ]);
    },
    yScale() {
      return d3.scaleLinear()
        .rangeRound([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax]);
    },
    colorScale(){
        return d3.scaleOrdinal()
        .domain(this.possibleLabels)
        .range(this.colorArray);
    },
    dataStack(){
      return d3.stack()
        .keys(this.possibleLabels)
        .value((d, key) => {
            let nrOfDeathsObj = Object.fromEntries(Array.from(d[1]));
            return nrOfDeathsObj[key];
        })
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    },
    dataSeries(){
      return this.dataStack(this.dataByCategory);
    },
    bisect(){
      return d3.bisector(function(d) { console.log(d); return d.data[0]; }).left;
    }
  },
  watch: {
    baseData: {
      handler() { this.drawChart(); },
      deep: true
    },
    selectedCategory: {
      handler() { this.drawChart(); },
      deep: true
    },
  },
}
</script>
