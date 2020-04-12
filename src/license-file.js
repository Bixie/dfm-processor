const fs = require('fs');
const Promise = require('bluebird');

const LF = '\r\n';

class LicenseFile {

    constructor(key, data, userId) {
        this.key = key;
        this.data = data;
        this.userId = userId;
    }

    render() {
        let output = '';
        output += `userId=${this.userId}${LF}`;
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
