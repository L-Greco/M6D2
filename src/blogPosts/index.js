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
import AuthorModel from "../authors/Schema.js"

const blogPostsJsonPath = join(dirname(fileURLToPath(import.meta.url)), "blogPosts.json")


const blogPostsRouter = express.Router()


blogPostsRouter.post("/", async (req, res, next) => {

    try {


        const newBlog = new BlogModel(req.body)
        const { _id } = await newBlog.save()

        const author = await AuthorModel.findByIdAndUpdate(req.body.author,
            {
                $push: { blogs: _id }
            }
            , {
                runValidators: true,
                new: true // me auti thn entoli stelnei meta to kainourgio kai oxi to palio
            })



        res.status(201).send("You successfully posted a blog with id:" + _id + " and Author name : " + author.name)

    } catch (error) {
        console.log(error)
        if (error.name === "ValdidationError") {
            next(createError(400, error))
        } else {
            next(createError(500, "An error occurred while saving the blog "))
        }

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
        const blog = await BlogModel.findById(id).populate("author")
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
// blogPostsRouter.put("/:blogId/uploadCover", multer({ storage }).single("cover"), async (req, res, next) => {
//     try {
//         const blog = await BlogModel.findByIdAndUpdate(req.params.blogId, req.body, {
//             runValidators: true,
//             new: true // me auti thn entoli stelnei meta to kainourgio kai oxi to palio
//         })
//         const blog = blogs.find(blog => blog._id === req.params.blogId)
//         if (blog) {
//             const updatedBlog = { ...blog, cover: req.file.path, updatedAt: new Date() }
//             const remainingBlogs = blogs.filter(blog => blog._id !== req.params.blogId)
//             remainingBlogs.push(updatedBlog)
//             await writeBlogPosts(remainingBlogs)
//             res.send(req.file)
//         } else {
//             next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
//         }
//     } catch (error) {
//         console.log(error);
//         next(error)
//     }


// })


blogPostsRouter.delete("/:blogId", async (req, res, next) => {
    try {
        const blog = await BlogModel.findByIdAndDelete(req.params.blogId)
        if (blog) {
            res.status(204).send()
        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
        }
    } catch (error) {
        console.log("line 135" + error);
        next(error)
    }
})

blogPostsRouter.post("/:blogId/comment/", async (req, res, next) => {
    try {
        const blogId = req.params.blogId
        const blog = await BlogModel.findById(blogId)

        if (blog) {
            const comment = req.body
            console.log(comment);
            const updatedBlog = await BlogModel.findByIdAndUpdate(
                req.params.blogId, {
                $push: { comments: comment }
            },
                { runValidators: true, new: true }
            )
            res.send(updatedBlog)
        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
        }
    } catch (error) {

    }
})

blogPostsRouter.get("/:blogId/comments", async (req, res, next) => {
    try {
        const blog = await BlogModel.findById(req.params.blogId)
        if (blog) {
            const comments = blog.comments
            res.send(comments)
        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))
        }
    } catch (error) {

    }


})

blogPostsRouter.get("/:blogId/comments/:commentId", async (req, res, next) => {
    try {
        const blog = await BlogModel.findById(req.params.blogId)
        if (blog) {
            const comment = await BlogModel.findOne({
                _id: req.params.blogId
            },
                {
                    comments: {
                        $elemMatch: { _id: req.params.commentId }
                    }
                })
            if (comment) {
                res.send(comment.comments[0])
            } else {
                next(createError(404, `Comment with id: ${req.params.commentId} not found!`))

            }
        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))

        }
    } catch (error) {

    }
})

blogPostsRouter.put("/:blogId/comments/:commentId", async (req, res, next) => {
    try {
        const blog = await BlogModel.findById(req.params.blogId)



        if (blog) {
            const commentChecker = blog.comments.find(comment => comment._id.toString() === req.params.commentId)
            if (commentChecker) {
                const comment = await BlogModel.findOne({
                    _id: req.params.blogId
                },
                    {
                        comments: {
                            $elemMatch: { _id: req.params.commentId }
                        }
                    })
                // console.log("line 218 : tupos tou id apo mongo einai : " + typeof (comment.comments[0]._id) + "tupos tou id apo params einai : " + typeof (req.params.commentId))
                // edw kanei log ==> line 218 : tupos tou id apo mongo einai : object tupos tou id apo params einai : string
                // if (comment.comments[0]._id.toString() === req.params.commentId) {
                const newComm = { "_id": req.params.commentId, ...req.body };
                // here i constract a new comment cause mongo uses a different _id 
                // when it updates the object , so  every time you make an edit the id changes and you have
                //  to get the new id again 
                const updatedBlog = await BlogModel.findOneAndUpdate(
                    //with findOneAndUpdate we  check multiple fields(i am not sure how accurate is this but i will check it lator),

                    { _id: req.params.blogId, "comments._id": req.params.commentId },
                    {
                        $set: { "comments.$": newComm } // set needs the index of the array and we get it back with comments.$
                    },
                    {

                        runValidators: true,
                        new: true,
                    }
                )

                res.status(201).send(newComm)
                // }

            }
            else {
                next(createError(404, `Comment with id: ${req.params.commentId} not found!`))

            }

        } else {
            next(createError(404, `Blog with id: ${req.params.blogId} not found!`))

        }
    } catch (error) {
        console.log(error);
        next(error)
    }
})

blogPostsRouter.delete("/:blogId/comments/:commentId", async (req, res, next) => {
    try {
        const blog = await findByIdAndUpdate(
            req.params.blogId,
            {
                $pull: {
                    comments: { _id: req.params.commentId }
                }
            }
        )
        res.status(201).send(`the commend with id ${req.params.commentId} is deleted`)
    } catch (error) {
        next(error)
    }
})




export default blogPostsRouter