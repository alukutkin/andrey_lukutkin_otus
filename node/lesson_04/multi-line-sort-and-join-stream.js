import { EOL } from 'os'
import readline from 'readline'
import { Readable } from 'stream'

class MultiLineSortAndJoinStream extends Readable {
    constructor(chunksStreams, options) {
        super(options)

        this._lines = []
        this._streams = []

        chunksStreams.forEach((chunkStream, streamIndex) => {
            let rl = readline.createInterface({ input: chunkStream, crlfDelay: Infinity })

            rl.on('line', (line) => this.onLineReaded(streamIndex, line))
            rl.on('close', () => this.onStreamClosed(streamIndex))

            this._streams.push(rl)
            this._lines[streamIndex] = []
        })
    }

    _read() {
        this.checkLines()
    }

    onLineReaded(streamIndex, line) {
        this._lines[streamIndex].push(parseInt(line))
        this._streams[streamIndex].pause()

        this.checkLines()
    }

    onStreamClosed(streamIndex) {
        this._lines[streamIndex].push(null)

        this.checkLines()
    }

    checkLines() {
        if (this.isAllStreamClosed()) {
            this.push(null)
            return
        }

        if (!this.hasLinesFromAllStreams()) {
            this.resumeStreams()
            return
        }

        let minIndex = null
        for (let streamIndex = 0; streamIndex < this._streams.length; ++streamIndex) {
            if (this._lines[streamIndex][0] === null)
                continue

            if (minIndex === null) {
                minIndex = streamIndex
                continue
            }

            if (this._lines[streamIndex][0] < this._lines[minIndex][0])
                minIndex = streamIndex
        }

        let v = this._lines[minIndex][0]
        if (v.toString() === 'NaN') {
            console.log('NaN')
        }

        this.push(this._lines[minIndex].shift() + EOL)
    }

    isAllStreamClosed() {
        for (const streamLines of this._lines) {
            if (streamLines.length !== 1 || streamLines[0] !== null)
                return false
        }

        return true
    }

    hasLinesFromAllStreams() {
        for (const streamLines of this._lines) {
            if (!streamLines.length)
                return false
        }

        return true
    }

    resumeStreams() {
        for (let streamIndex = 0; streamIndex < this._streams.length; ++streamIndex) {
            if (!this._lines[streamIndex].length)
                this._streams[streamIndex].resume()
        }
    }
}

export default MultiLineSortAndJoinStream