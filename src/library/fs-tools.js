import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import createError from 'http-errors'
import { verifyToken } from "./auth.js"
import AuthorModel from "../authors/Schema.js"


const authorsImg = join(dirname(fileURLToPath(import.meta.url)), "../../public/img/authors")
const blogPostsImg = join(dirname(fileURLToPath(import.meta.url)), "../../public/img/blogPosts")

const { readJSON, writeJSON, writeFile, createReadStream } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../database") // now it targets the database folder
const authorsPath = join(dataFolderPath, "authors.json")
const blogPostsPath = join(dataFolderPath, "blogPosts.json")

// GET
export const getBlogPosts = async () => await readJSON(blogPostsPath)
export const getAuthors = async () => await readJSON(authorsPath)

// WRITE
export const writeBlogPosts = async (content) => await writeJSON(blogPostsPath, content)
export const writeAuthors = async (content) => await writeJSON(authorsPath, content)

// WRITE PICTURES 
export const writeAuthorsPictures = async (fileName, content) => await writeFile(join(authorsImg, fileName), content)
export const writeBlogPostsPictures = async (fileName, content) => await writeFile(join(blogPostsImg, fileName), content)

// STREAMS 
export const getAuthorsReadStream = () => fs.createReadStream(authorsPath)



// checks if the user is an admin or not
export const adminOnly = async (req, res, next) => {
    const token = req.headers.authorization.replace("Bearer ", "")
    const content = await verifyToken(token)
    if (content.role === "Admin") { // if role is "Admin" we can proceed to the request handler
        next()
    } else { // we trigger a 403 error
        next(createError(403, "You are unauthorized for this Route."))
    }
}
