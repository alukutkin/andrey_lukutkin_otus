import { EOL } from 'os'
import { Readable } from 'stream'

function randomNumber(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

class RandomNumbersStream extends Readable {
    constructor(options) {
        super(options)

        if (!options)
            options = {}
        this._min = options.min || 0
        this._max = options.max || Number.MAX_SAFE_INTEGER
        this._maxDataSize = options.maxDataSize || -1
        this._delimiter = options.delimiter || EOL

        this._dataSize = 0
    }

    _read() {
        let str = randomNumber(this._min, this._max) + this._delimiter

        if (this._maxDataSize === -1 || this._dataSize + str.length <= this._maxDataSize) {
            this._dataSize += str.length
            this.push(str)
        } else {
            this.push(null)
        }
    }
}

export default RandomNumbersStream
