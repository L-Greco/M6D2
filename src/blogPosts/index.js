import express from "express"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import createError from "http-errors"
import { validationResult } from "express-validator"
import { blogsValidation } from "./validation.js"
import { getAuthors, getBlogPosts, writeBlogPosts } from "../library/fs-tools.js"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import BlogModel from "./schema.js"

const blogPostsJsonPath = join(dirname(fileURLToPath(import.meta.url)), "blogPosts.json")
console.log(blogPostsJsonPath);

const blogPostsRouter = express.Router()


blogPostsRouter.post("/", async (req, res, next) => {

    try {
        const newBlog = new BlogModel(req.body)
        const { _id } = await newBlog.save()


        res.status(201).send(newBlog)

    } catch (error) {
        console.log(error)
        if (error.name === "ValdidationError") {
            next(createError(400, error))
        } else {
            next(createError(500, "An error occurred while saving the blog "))
        }

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
        const blogs = await BlogModel.find()
        res.send(blogs)

    } catch (error) {
        console.log(error, "error while fetching the blogs");
        next(error)
    }
})

blogPostsRouter.get("/:blogId", async (req, res, next) => {
    try {
        const id = req.params.blogId
        const blog = await BlogModel.findById(id)
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

        const blog = await BlogModel.findByIdAndUpdate(req.params.blogId, req.body, {
            runValidators: true,
            new: true // me auti thn entoli stelnei meta to kainourgio kai oxi to palio
        })
        if (blog) {
            res.send(blog)
        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
        }
    } catch (error) {
        console.log(error);
        next(createError(500, "An error occurred while modifying the blog"))
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
        const blog = await BlogModel.findByIdAndDelete(req.params.blogId)
        if (blog) {
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