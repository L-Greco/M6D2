import express from "express"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import createError from "http-errors"
import { validationResult } from "express-validator"
import { blogsValidation } from "./validation.js"
import { getAuthors, getBlogPosts, writeBlogPosts } from "../library/fs-tools.js"
import { writeBlogPostsPictures } from "../library/fs-tools.js"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const blogPostsJsonPath = join(dirname(fileURLToPath(import.meta.url)), "blogPosts.json")
console.log(blogPostsJsonPath);

// const getBlogPosts = function () {
//     const content = fs.readFileSync(blogPostsJsonPath)
//     return JSON.parse(content)
// }

// const writeBlogPosts = content => fs.writeFileSync(blogPostsJsonPath, JSON.stringify(content))

const blogPostsRouter = express.Router()


blogPostsRouter.post("/", blogsValidation, async (req, res, next) => {

    try {
        // const authorsPath = join(join(dirname(dirname(fileURLToPath(import.meta.url))), "authors"), "authors.json")
        // const authorsArr = JSON.parse(fs.readFileSync(authorsPath))
        const authorsArr = await getAuthors()
        const errors = validationResult(req)
        console.log(errors)
        if (!errors.isEmpty()) {
            next(createError(400, { errorList: errors }))

        } else {

            const newBlog = { _id: uniqid(), ...req.body, author: authorsArr[0].name, avatar: authorsArr[0].avatar, createdAT: new Date(), comments: [] }

            const blogs = await getBlogPosts()
            blogs.push(newBlog)

            // fs.writeFileSync(blogPostsJsonPath, JSON.stringify(blogs))
            await writeBlogPosts(blogs)
            res.status(201).send(newBlog)
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

blogPostsRouter.post("/:blogId/comments", async (req, res, next) => {
    try {
        const blogs = await getBlogPosts()
        const blog = blogs.find(blog => blog._id === req.params.blogId)
        if (blog) {


            const remainingBlogs = blogs.filter(blog => blog._id !== req.params.blogId)
            blog.comments.push(req.body)
            const editedBlog = blog
            remainingBlogs.push(editedBlog)
            // fs.writeFileSync(blogPostsJsonPath, JSON.stringify(remainingBlogs))
            await writeBlogPosts(remainingBlogs)
            res.send(blog.comments)

        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
        }

    } catch (error) {
        console.log(error)
        next(error)
    }
})

blogPostsRouter.get("/", async (req, res, next) => {
    try {
        const blogs = await getBlogPosts()
        res.send(blogs)

    } catch (error) {
        console.log(error);
        next(error)
    }
})

blogPostsRouter.get("/:blogId", async (req, res, next) => {
    try {
        const blogs = await getBlogPosts()
        const blog = blogs.find(blog => blog._id === req.params.blogId)
        if (blog) {
            res.send(blog)
        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
        }

    } catch (error) {
        console.log(error)
        next(error)
    }
})

blogPostsRouter.get("/:blogId/comments", async (req, res, next) => {
    try {
        const blogs = await getBlogPosts()
        const blog = blogs.find(blog => blog._id === req.params.blogId)
        if (blog) {
            res.send(blog.comments)
        } else {
            next(createError(404, `Comments with id: ${req.params.blogId} not found!`))
        }

    } catch (error) {
        console.log(error)
        next(error)
    }
})

blogPostsRouter.put("/:blogId", async (req, res, next) => {
    try {
        const blogs = await getBlogPosts()
        const blog = blogs.find(blog => blog._id === req.params.blogId)
        if (blog) {
            const remainingBlogs = blogs.filter(blog => blog._id !== req.params.blogId)
            const editedBlog = { _id: req.params.blogId, ...req.body }
            remainingBlogs.push(editedBlog)
            // fs.writeFileSync(blogPostsJsonPath, JSON.stringify(remainingBlogs))
            await writeBlogPosts(remainingBlogs)
            res.send(editedBlog)
        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
        }
    } catch (error) {
        console.log(error);
        next(error)
    }


})

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env
cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_KEY,
    api_secret: CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,

});
blogPostsRouter.put("/:blogId/uploadCover", multer({ storage }).single("cover"), async (req, res, next) => {
    try {
        const blogs = await getBlogPosts()
        const blog = blogs.find(blog => blog._id === req.params.blogId)
        if (blog) {
            // await writeBlogPostsPictures(`${blog._id}.jpg`, req.file.buffer)
            // res.send(`Picture with name "${blog._id}.jpg" is uploaded!`)
            const updatedBlog = { ...blog, cover: req.file.path, updatedAt: new Date() }
            const remainingBlogs = blogs.filter(blog => blog._id !== req.params.blogId)
            remainingBlogs.push(updatedBlog)
            await writeBlogPosts(remainingBlogs)
            res.send(req.file)
        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
        }
    } catch (error) {
        console.log(error);
        next(error)
    }


})


blogPostsRouter.delete("/:blogId", async (req, res, next) => {
    try {
        const blogs = await getBlogPosts()
        const blog = blogs.find(blog => blog._id === req.params.blogId)
        if (blog) {
            const remainingBlogs = blogs.filter(blog => blog._id !== req.params.blogId)
            await writeBlogPosts(remainingBlogs)
            // fs.writeFileSync(blogPostsJsonPath, JSON.stringify(remainingBlogs))
            res.status(204).send()
        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
})

export default blogPostsRouter