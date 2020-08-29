const d3 = require('d3');
const jsdom = require('jsdom');
const {JSDOM,} = jsdom;

class Svg {

    constructor({viewBox, margin, axes,}, name) {
        this.name = name;
        this.viewBox = viewBox;
        this.margin = margin;
        this.axes = axes;

        this.height = this.viewBox.height - this.margin.bottom - this.margin.top;
        this.width = this.viewBox.width - this.margin.left - this.margin.right;
        //get svg base and container
        this.svg = this.setSvgBase();
        this.container = this.getGraphContainer();
        //set needed scales
        this.xScale = this.getAxisScale(axes.x.type, 'x');
        this.yScale = this.getAxisScale(axes.y.type, 'y');
    }

    setGraphData(graph) {
        //set domains on scales
        if (this.axes.x.type === 'band') {
            const [first,] = graph.dataSets;
            this.xScale.domain(first.data.map(d => d.x));
        } else {
            this.xScale.domain([graph.minmax.minX, graph.minmax.maxX]);
        }
        this.yScale.domain([graph.minmax.minY, graph.minmax.maxY,]);
        //draw axis and grids
        this.drawAxes(this.xScale, this.yScale, graph);
        this.drawGrids(this.xScale, this.yScale);
        //draw dataSets
        graph.dataSets.forEach(dataSet => this.drawDataSet(graph, dataSet, this.xScale, this.yScale));
        return this;
    }

    getHtml() {
        return this.body.html();
    }

    drawAxes(xScale, yScale, graph) {
        this.container.append('g').call(g => this.xAxis(g, xScale, graph));
        this.container.append('g').call(g => this.yAxis(g, yScale, graph));
        if (this.axes.x.type === 'time') {
            this.rotateXAxisTicks();
        }
    }

    drawGrids(xScale, yScale) {
        if (this.axes.x.type !== 'band') {
            this.container.append('g').call(g => this.xGrid(g, xScale));
        }
        this.container.append('g').call(g => this.yGrid(g, yScale));
    }

    drawDataSet(graph, {data, className, type,}, xScale, yScale) {
        switch (type) {
            case 'line':
                const line_function = () => d3.line()
                    .x(d => xScale(d.x))
                    .y(d => yScale(d.y));
                this.container.append('path')
                    .attr('d', line_function()(data))
                    .attr('class', `graph ${className}`)
                    .attr('stroke-width', 1)
                    .attr('fill', 'none')
                break;
            case 'bar':
                this.container.selectAll('bar')
                    .data(data)
                    .enter().append('rect')
                    .attr('class', `graph ${className}`)
                    .attr('x', d => xScale(d.x))
                    .attr('y', d => yScale(d.y))
                    .attr('width', xScale.bandwidth())
                    .attr('height', d => this.height - yScale(d.y));
                break;
            default:
                break;
        }
    }

    getAxisScale(type, axis) {
        let scale;
        const range = axis === 'x' ? [0, this.width] : [this.height, 0];
        switch (type) {
            case 'time':
                scale = d3.scaleTime()
                    .range(range);
                break;
            case 'linear':
                scale = d3.scaleLinear()
                    .range(range);
                break;
            case 'log':
                scale = d3.scaleLog()
                    .range(range);
                break;
            case 'band':
                scale = d3.scaleBand()
                    .range(range)
                    .padding(0.3);
                break;
            default:
                break;
        }
        return scale;
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
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    }

    xAxis(g, scale, graph) {
        g.attr('transform', `translate(0, ${this.height})`)
            .attr('class', 'xaxis')
            .call(d => {
                const axis = d3.axisBottom(scale);
                switch (this.axes.x.type) {
                    case 'time':
                        axis.tickFormat(d3.timeFormat('%b %Y'));
                        break;
                    case 'linear':
                    case 'log':
                        axis.tickFormat(d => scale.tickFormat(4, d3.format(',d'))(d));
                        break;
                    case 'band':
                        const [first,] = graph.dataSets;
                        axis.tickValues(first.data.map(d => d.x).filter(x => x%5 === 0));
                        break;
                    default:
                        break;
                }
                return axis(d);
            });
    }

    yAxis(g, scale) {
        g.attr('class', 'yaxis')
            .call(
                d3.axisLeft(scale)
                    .tickFormat(d => scale.tickFormat(4,d3.format(',d'))(d))
            );
    }

    rotateXAxisTicks() {
        this.svg.selectAll('.xaxis text')  // select all the text elements for the xaxis
            .attr(
                'transform',
                `translate(${((this.margin.bottom / 2 )* -1)}, ${(this.margin.bottom / 2) - 5}) rotate(-45)`
            );
    }

    xGrid(g, scale) {
        const make_x_gridlines = () => d3.axisBottom(scale)
            .ticks(5);
        g.attr('class', 'grid')
            .attr('transform', `translate(0, ${this.height})`)
            .call(make_x_gridlines()
                .tickSize(-this.height)
                .tickFormat('')
            );
    }

    yGrid(g, scale) {
        const make_y_gridlines = () => d3.axisLeft(scale)
            .ticks(5);
        g.attr('class', 'grid')
            .call(make_y_gridlines()
                .tickSize(-this.width)
                .tickFormat('')
            );
    }
}

module.exports = Svg;
