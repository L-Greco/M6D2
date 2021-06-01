import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import authorsRoutes from "./authors/index.js"
import blogPostsRouter from "./blogPosts/index.js"
import authorsCsvRoute from "./authors/forCsv.js"
import mailRouter from "../user.js"
import { badRequestErrorHandler, notFoundErrorHandler, forbiddenErrorHandler, catchAllErrorHandler } from "./errorHandlers.js"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import mongoose from "mongoose"
const publicPath = join(dirname(fileURLToPath(import.meta.url)), "../public")


const server = express()
server.use(express.static(publicPath))
const port = process.env.PORT || 3001 // loading the environment variable called PORT, contained in .env file

server.use(express.json()) // If I do not specify this line of code BEFORE the routes, all the request bodies are going to be undefined
const whiteList = ["http://localhost:3000",]
const corsOptions = {
    origin: (origin, callback) => {
        if (whiteList.find(url => url === origin)) {
            callback(null, true)
        }
        else {
            const error = new Error("Cors Problems")
            error.status = 403
            callback(error)
        }

    }
}
server.use(cors(corsOptions))
server.use("/authors", authorsRoutes)
server.use("/csvAuthors", authorsCsvRoute)
server.use("/blogPosts", blogPostsRouter)
server.use("/mail", mailRouter)


// ******** ERROR MIDDLEWARES ************

server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(forbiddenErrorHandler)
server.use(catchAllErrorHandler)

mongoose
    .connect(process.env.ATLAS_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(
        server.listen(port, () => {
            console.log("Running on port", port)
        })
    )
    .catch(err => console.log(err))
