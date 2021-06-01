import { Transform } from "json2csv" // the library that transforms json to csv!
import { getAuthorsReadStream } from "../library/fs-tools.js"
import { pipeline } from "stream"
import express from "express"


const authorsCsvRoute = express.Router()

authorsCsvRoute.get("/", (req, res, next) => {
    try {
        const fields = ["name", "_id"]
        const opt = { fields }
        const json2csv = new Transform(opt)
        res.setHeader("Content-Disposition", `attachment; filename=authors.csv`)
        const authorsStream = getAuthorsReadStream()

        pipeline(authorsStream, json2csv, res, err => {
            if (err) {
                console.error(err);
                next(err)
            }
        })
    } catch (error) {
        next(error)
    }
})

export default authorsCsvRoute