import fs from 'fs'

const CHUNK_FILE_SUFFIX = '.chunk'

class ChunkedFile {
    constructor(originalFilePath, chunksCount) {
        this._originalFilePath = originalFilePath
        this._chunksCount = chunksCount ? chunksCount : 2
    }

    readStream() {
        return fs.createReadStream(this._originalFilePath)
    }

    writeStream() {
        return fs.createWriteStream(this._originalFilePath)
    }

    fileSize() {
        return fs.statSync(this._originalFilePath).size
    }

    chunksFilePaths() {
        let ret = []

        for (let i = 1; i <= this._chunksCount; ++i)
            ret.push(this._originalFilePath + CHUNK_FILE_SUFFIX + i)

        return ret
    }

    chunksReadStreams(options) {
        return this.chunksFilePaths().map((chunkFilePath) => fs.createReadStream(chunkFilePath, options))
    }

    chunksWriteStreams(options) {
        return this.chunksFilePaths().map((chunkFilePath) => fs.createWriteStream(chunkFilePath, options))
    }

    desiredChunkSize() {
        return Math.ceil(this.fileSize() / this._chunksCount)
    }

    deleteChunksFiles() {
        this.chunksFilePaths().forEach((chunkFilePath) => {
            try {
                fs.unlinkSync(chunkFilePath)
            } catch (err) {
            }
        })
    }
}

export default ChunkedFile