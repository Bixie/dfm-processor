const d3 = require('d3');
const jsdom = require('jsdom');
const {JSDOM,} = jsdom;

const {getJsDateFromExcel,} = require('../util/date');

class Svg {

    constructor({viewBox, margin,}) {
        this.viewBox = viewBox;
        this.margin = margin;
        this.svg = this.setSvgBase();
        this.container = this.getGraphContainer();
    }

    addAxes(graph) {
        const xScale = d3.scaleTime()
            .domain([getJsDateFromExcel(graph.minmax.minX), getJsDateFromExcel(graph.minmax.maxX),])
            .range([this.margin.left, this.viewBox.width - this.margin.right]);
        const yScale = d3.scaleLinear()
            .domain([graph.minmax.minY, graph.minmax.maxY,])
            .range([this.viewBox.height - this.margin.bottom, this.margin.top]);

        this.svg.append('g')
            .call(g => this.xAxis(g, xScale));
        this.svg.append('g')
            .call(g => this.yAxis(g, yScale));
        this.rotateXAxisTicks();
        return this;
    }

    addGraphData(graph) {
        graph.dataSets.forEach(dataSet => this.addPathGraph(graph, dataSet));
        return this;
    }

    getHtml() {
        return this.body.html();
    }

    setSvgBase() {
        const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
        this.body = d3.select(dom.window.document.querySelector('body'))
        const svg = this.body.append('svg');
        svg.attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.viewBox.width} ${this.viewBox.height}`)
            .attr('style', 'background-color: transparent; vector-effect: non-scaling-stroke;')
            .attr('xmlns', 'http://www.w3.org/2000/svg');
        return svg;
    }

    getGraphContainer() {
        return this.svg.append('g')
            .attr('stroke-width', 1)
            .attr('stroke-linejoin', 'square')
            .attr('stroke-linecap', 'square')
            .attr('fill', 'none');
    }

    addPathGraph(graph, {data, color, className,}) {
        this.container.append('path')
            .attr('d', this.lineFunction(graph)(data))
            .attr('class', className)
            .attr('stroke', color || 'black')
            .attr('stroke-width', 1)
            .attr('fill', 'none')
    }

    lineFunction(graph) {
        //prepare the x/y coordinates within the svg line container
        const rangeX = graph.minmax.maxX - graph.minmax.minX;
        const rangeY = graph.minmax.maxY - graph.minmax.minY;
        const width = this.viewBox.width - this.margin.left - this.margin.right;
        const height = this.viewBox.height - this.margin.top - this.margin.bottom;
        //this is where d3 maps the x/y values to the actual svg grid position
        return d3.line()
            .x(d => (this.margin.left + ((d.x - graph.minmax.minX) / rangeX) * width))
            .y(d => ((this.margin.top + height) +((d.y - graph.minmax.minY) / rangeY) * -1 * height));

    }

    xAxis(g, scale) {
        g.attr('transform', `translate(0,${this.viewBox.height - this.margin.bottom})`)
            .attr('class', 'xaxis')
            .call(d3.axisBottom(scale)
                .tickFormat(d3.timeFormat('%b %Y'))
            );
    }

    yAxis(g, scale) {
        g.attr('transform', `translate(${this.margin.left},0)`)
            .attr('class', 'yaxis')
            .call(d3.axisLeft(scale));
    }

    rotateXAxisTicks() {
        this.svg.selectAll('.xaxis text')  // select all the text elements for the xaxis
            .attr(
                'transform',
                `translate(${(this.margin.bottom / 3 )* -2}, ${(this.margin.bottom / 2) + 3}) rotate(-45)`
            );
    }
}

module.exports = Svg;
