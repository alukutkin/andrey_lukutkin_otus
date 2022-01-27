import { EOL } from 'os'
import { Writable } from 'stream'


class MultiLineSplitAndSortStream extends Writable {
    constructor(chunksStreams, options) {
        super(options)
        this._chunksStreams = chunksStreams

        if (!options)
            options = {}

        this._desiredChunkSize = options.desiredChunkSize || Number.MAX_SAFE_INTEGER
        this._delimiter = options.delimiter || Buffer.from(EOL)

        this._cache = Buffer.alloc(0)

        this._currentChunkIndex = 0
        this._currentChunkSize = 0
        this._currentChunkNumbers = new Array
    }

    _write(chunk, encoding, callback) {
        this._cache += chunk

        this.processCache(false)

        callback(null)
    }

    end(chunk, encoding, callback) {
        super.end(chunk, encoding, callback)

        this.processCache(true)
        this._chunksStreams.forEach((stream) => stream.end())
    }

    
    processCache(lastChance) {
        let lineStartIndex = 0
        let lineEndIndex = -1

        while (true) {
            const delimiterIndex = this._cache.indexOf(this._delimiter, lineStartIndex)
            if (delimiterIndex === -1) {
                if (lineEndIndex !== -1)
                    this._cache = this._cache.slice(lineEndIndex + 1)
                break
            }
            lineEndIndex = delimiterIndex + this._delimiter.length - 1

            const line = this._cache.slice(lineStartIndex, lineEndIndex)
            this._currentChunkNumbers.push(parseInt(line))
            this._currentChunkSize += lineEndIndex - lineStartIndex + 1

            if (this._currentChunkSize >= this._desiredChunkSize && this._currentChunkIndex < this._chunksStreams.length - 1) {
                this.flushChunk()

                this._currentChunkIndex++
            }

            lineStartIndex = lineEndIndex + 1
        }

        if (lastChance) {
            if (this._cache.length) {
                this._currentChunkNumbers.push(this._cache)
                this._cache = Buffer.alloc(0)
            }

            this.flushChunk()
        }
    }

    flushChunk() {
        this._currentChunkNumbers.sort((a, b) => a - b)

        const buffer = Buffer.alloc(this._currentChunkSize)
        let offset = 0
        this._currentChunkNumbers.forEach((number) => {
            const str = number + this._delimiter
            buffer.write(str, offset)
            offset += str.length
        })

        this._chunksStreams[this._currentChunkIndex].write(buffer)
       
        this._currentChunkNumbers = new Array
        this._currentChunkSize = 0
    }
}

export default MultiLineSplitAndSortStream