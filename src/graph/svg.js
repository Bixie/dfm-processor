const d3 = require('d3');
const jsdom = require('jsdom');
const {JSDOM,} = jsdom;

const {getJsDateFromExcel,} = require('../util/date');

class Svg {

    constructor({viewBox, margin,}, name) {
        this.viewBox = viewBox;
        this.margin = margin;
        this.name = name;
        this.svg = this.setSvgBase();
    }

    addAxes(graph) {
        this.xScale = this.getAxisScale(graph.graphDefinition.axes.x.type, 'x', graph.minmax.minX, graph.minmax.maxX);
        this.yScale = this.getAxisScale(graph.graphDefinition.axes.y.type, 'y', graph.minmax.minY, graph.minmax.maxY);
        const height = this.viewBox.height - this.margin.bottom - this.margin.top;
        const width = this.viewBox.width - this.margin.left - this.margin.right;
        console.log(width, height);
        const make_x_gridlines = () => d3.axisBottom(this.xScale)
            .ticks(5);
        const make_y_gridlines = () => d3.axisLeft(this.yScale)
            .ticks(5);
        this.svg.append('g')
            .call(g => this.xAxis(g, this.xScale));
        this.svg.append('g')
            .call(g => this.yAxis(g, this.yScale));
        this.rotateXAxisTicks();
        // add the X gridlines
        this.svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0, ${height + this.margin.top})`)
            .call(make_x_gridlines()
                .tickSize(-height)
                .tickFormat('')
            );
        // add the y gridlines
        this.svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(${this.margin.left}, 0)`)
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat('')
            );
        this.container = this.getGraphContainer();
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
            .attr('class', this.name)
            .attr('style', 'background-color: transparent; vector-effect: non-scaling-stroke;')
            .attr('xmlns', 'http://www.w3.org/2000/svg');
        return svg;
    }

    getGraphContainer() {
        return this.svg.append('g')
            .attr('stroke', '#bababa')
            .attr('stroke-width', 1)
            .attr('stroke-linejoin', 'square')
            .attr('stroke-linecap', 'square')
            .attr('fill', 'none');
    }

    addPathGraph(graph, {data, className,}) {
        this.container.append('path')
            .attr('d', this.lineFunction(graph)(data))
            .attr('class', `graph ${className}`)
            .attr('stroke-width', 1)
            .attr('fill', 'none')
    }

    lineFunction(graph) {
        //this is where d3 maps the x/y values to the actual svg grid position
        const xScale = graph.graphDefinition.axes.x.type === 'time' ?
            this.getAxisScale('linear', 'x', graph.minmax.minX, graph.minmax.maxX) :
            this.xScale;
        return d3.line()
            .x(d => xScale(d.x))
            .y(d => this.yScale(d.y));

    }

    getAxisScale(type, axis, min, max) {
        let scale;
        const range = axis === 'x' ?
            [this.margin.left, this.viewBox.width - this.margin.right]:
            [this.viewBox.height - this.margin.bottom, this.margin.top];
        switch (type) {
            case 'time':
                scale = d3.scaleTime()
                    .domain([getJsDateFromExcel(min), getJsDateFromExcel(max),])
                    .range(range);
                break;
            case 'linear':
                scale = d3.scaleLinear()
                    .domain([min, max,])
                    .range(range);
                break;
            case 'log':
                scale = d3.scaleLog()
                    .domain([Math.max(0.0000001, min), max,])
                    .range(range);
                break;
            default:
                break;
        }

        return scale;
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
            .call(
                d3.axisLeft(scale)
                    .tickFormat(d => scale.tickFormat(4,d3.format(",d"))(d))
            );
    }

    rotateXAxisTicks() {
        this.svg.selectAll('.xaxis text')  // select all the text elements for the xaxis
            .attr(
                'transform',
                `translate(${((this.margin.bottom / 2 )* -1)}, ${(this.margin.bottom / 2) - 5}) rotate(-45)`
            );
    }
}

module.exports = Svg;
