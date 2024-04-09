import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!data || !chartRef.current) return;

    // Remove previous SVG elements
    d3.select(chartRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right; // Fixed width
    const height = 300 - margin.top - margin.bottom; // Fixed height

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(Object.keys(data));

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(Object.values(data))]);

    // Render X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", margin.bottom - 5) // Adjust the position based on your preference

    // Render Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 10) // Adjust the position based on your preference

    // X axis label
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + 40)
      .text("Segment ID");

    // Y axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -margin.left)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("SNV Count");

    // Render bars
    svg.selectAll(".bar")
      .data(Object.entries(data))
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d[0]))
      .attr("width", x.bandwidth())
      .attr("y", d => y(Math.max(0, d[1])))
      .attr("height", d => Math.abs(y(0) - y(d[1])))
      .attr("fill", "steelblue");

    return () => {
      // Clean up when component unmounts
      svg.selectAll("*").remove();
    };
  }, [data]);

  return <div ref={chartRef} />;
};

export default BarChart;
