import fs from 'fs'
import stream from 'stream'
import util from 'util'
import ChunkedFile from './chunked-file.js'
import RandomNumbersStream from './random-numbers-stream.js'
import MultiLineSplitAndSortStream from './multi-line-split-and-sort-stream.js'
import MultiLineSortAndJoinStream from './multi-line-sort-and-join-stream.js'

const pipeline = util.promisify(stream.pipeline)

const INPUT_FILE_PATH = '_input.txt'
const MAX_INPUT_FILE_SIZE = 1024 * 1024 * 100
const OUTPUT_FILE_PATH = '_output.txt'
const CHUNKS_COUNT = 10


const chunkedFile = new ChunkedFile(INPUT_FILE_PATH, CHUNKS_COUNT)

await pipeline(
    new RandomNumbersStream({ 
        min: 0,
        max: 1024 * 1024 * 1024,
        maxDataSize: MAX_INPUT_FILE_SIZE 
    }),
    chunkedFile.writeStream(),
)


await pipeline(
    chunkedFile.readStream(),
    new MultiLineSplitAndSortStream(chunkedFile.chunksWriteStreams(), {
        desiredChunkSize: chunkedFile.desiredChunkSize(),
    })
)


await pipeline(
    new MultiLineSortAndJoinStream(chunkedFile.chunksReadStreams()),
    fs.createWriteStream(OUTPUT_FILE_PATH)
)

chunkedFile.deleteChunksFiles()
