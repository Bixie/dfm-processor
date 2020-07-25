const {minBy, maxBy,} = require('lodash');

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
        data = data.filter(r => r.length === 2).map(this.recordValues);
        const {className, color,} = this.graphDefinition.dataSets.find(d => d.filename === filename);
        const stats = {
            minX: minBy(data, r => r.x).x,
            minY: minBy(data, r => r.y).y,
            maxX: maxBy(data, r => r.x).x,
            maxY: maxBy(data, r => r.y).y,
        };
        return {data, stats, filename, className, color,};
    }

    recordValues(row) {
        return {x: Number(row[0]), y: Number(row[1])};
    }
}

module.exports = GraphFromCsvs;
