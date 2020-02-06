const fs = require('fs');
const Promise = require('bluebird');

const LF = '\r\n';

class LicenseFile {

    constructor(key, data) {
        this.key = key;
        this.data = data;
    }

    render() {
        let output = '';
        output += Object.keys(this.data).map(key => {
            return `${key}=${this.data[key]}`;
        }).join(LF);
        return output;
    }

    write(folderpath) {
        return new Promise((resolve, reject) => {
            const filename = `${folderpath}/${this.key}.txt`;
            fs.writeFile(filename, this.render(), err => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }
}

module.exports = LicenseFile;
