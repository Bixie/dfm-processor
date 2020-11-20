const {minBy, maxBy,} = require('lodash');
const {fromExcelDate ,} = require('js-excel-date-convert');

class GraphFromCsvs {

    constructor(parse_results, graphDefinition) {

        this.graphDefinition = graphDefinition;
        this.dataSets = parse_results.map(({results, filename,}) => this.parseCsvResults(results, filename));
        this.minmax = this.getMinMaxValues();
    }

    getMinMaxValues() {
        return {
            minX: minBy(this.dataSets, f => f.stats.minX).stats.minX,
            minY: minBy(this.dataSets, f => f.stats.minY).stats.minY,
            maxX: maxBy(this.dataSets, f => f.stats.maxX).stats.maxX,
            maxY: maxBy(this.dataSets, f => f.stats.maxY).stats.maxY,
        }
    }

    parseCsvResults({data,}, filename) {
        data = data.filter(r => r.length === 2).map(row => this.recordValues(row));
        const {className, type,} = this.graphDefinition.dataSets.find(d => d.filename === filename);
        const stats = {
            minX: minBy(data, r => r.x).x,
            minY: minBy(data, r => r.y).y,
            maxX: maxBy(data, r => r.x).x,
            maxY: maxBy(data, r => r.y).y,
        };
        return {data, stats, filename, className, type,};
    }

    recordValues([x, y,]) {
        x = Number(x);
        if (this.graphDefinition.axes.x.type === 'time') {
            x = fromExcelDate(x);
        }
        return {x, y: Number(y)};
    }
}

module.exports = GraphFromCsvs;
