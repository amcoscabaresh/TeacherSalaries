import * as d3 from "d3"; // we will need d3.js
import React, { useMemo, useRef, useEffect } from 'react'

const MARGIN = {
    right: 20,
    left: 80,
    top: 10,
    bottom: 20,
}

const BUCKET_NUMBER = 50;
const BUCKET_PADDING = 1;


const MAX_SALARY = 600_000;

export default function SalaryHistogram({ width, height, data }) {

    const axesRef = useRef(null);
    const boundsWidth = width - MARGIN.right - MARGIN.left;
    const boundsHeight = height - MARGIN.top - MARGIN.bottom;

    const xScale = useMemo(() => {
        return d3
            .scaleLinear()
            .domain([0, MAX_SALARY]) // note: limiting to 1000 instead of max here because of extreme values in the dataset
            .range([0, boundsWidth]);
    }, [data, width]);


    const buckets = useMemo(() => {
        const bucketGenerator = d3
            .bin()
            .value((d) => d['SY2122'])
            .domain(xScale.domain())
            .thresholds(xScale.ticks(BUCKET_NUMBER));
        return bucketGenerator(data)
    }, [data])


    const yScale = useMemo(() => {
        const max = Math.max(...buckets.map((bucket) => bucket?.length));
        return d3.scaleLinear()
            .range([boundsHeight, 0])
            .domain([0, max]);

    }, [data, height]);

    // Render the X axis using d3.js, not react
    useEffect(() => {
        const svgElement = d3.select(axesRef.current);
        svgElement.selectAll("*").remove();

        const xAxisGenerator = d3.axisBottom(xScale);
        svgElement
            .append("g")
            .attr("transform", "translate(0," + boundsHeight + ")")
            .call(xAxisGenerator);

        const yAxisGenerator = d3.axisLeft(yScale);
        svgElement.append("g").call(yAxisGenerator);
    }, [xScale, yScale, boundsHeight]);

    const allRects = buckets.map((bucket, i) => {
        return (
            <rect
                key={i}
                fill="#69b3a2"
                x={xScale(bucket.x0) + BUCKET_PADDING / 2}
                width={xScale(bucket.x1) - xScale(bucket.x0) - BUCKET_PADDING}
                y={yScale(bucket.length)}
                height={Math.max(boundsHeight - yScale(bucket.length), 0)}
            />
        );
    });

    return (
        <div>
            <svg width={width} height={height}>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                >
                    {allRects}
                </g>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    ref={axesRef}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                />
            </svg>
        </div>
    );
};