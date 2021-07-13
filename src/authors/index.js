import express from "express"
import AuthorModel from "./Schema.js"
import createError from "http-errors"

const authorsRouter = express.Router()

authorsRouter.post("/", async (req, res, next) => {

    try {
        const newAuthor = new AuthorModel(req.body)
        const { _id } = await newAuthor.save()


        res.status(201).send(_id)

    } catch (error) {
        console.log(error)
        if (error.name === "ValdidationError") {
            next(createError(400, error))
        } else {
            next(createError(500, "An error occurred while saving the author "))
        }

    }
})


authorsRouter.get("/", async (req, res, next) => {
    try {
        const authors = await AuthorModel.find()
        res.send(authors)

    } catch (error) {
        console.log(error, "error while fetching the authors");
        next(error)
    }
})

// this route brings the authors data but without the blogPosts 
authorsRouter.get("/:authorId", async (req, res, next) => {
    try {
        const id = req.params.authorId
        const author = await AuthorModel.findById(id)
        if (author) {
            res.send(author)
        } else {
            next(createError(404, `author with id: ${req.params.authorId} not found!`))
        }

    } catch (error) {
        console.log(error)
        next(error)
    }
})
// This route brings the authors Data with the Posts.
authorsRouter.get("/:authorId/withPosts", async (req, res, next) => {
    try {
        const id = req.params.authorId
        const author = await AuthorModel.findById(id).populate("blogs")
        // const blogPosts = await blogModel.find().populate({path:"authors","select":"name surname"}).populate("comments")
        // in the code above we populate in chain 2 different paths and in the first one we populate only the name and the surname
        if (author) {
            res.send(author)
        } else {
            next(createError(404, `author with id: ${req.params.authorId} not found!`))
        }

    } catch (error) {
        console.log(error)
        next(error)
    }
})





authorsRouter.put("/:authorId", async (req, res, next) => {
    try {

        const author = await AuthorModel.findByIdAndUpdate(req.params.authorId, req.body, {
            runValidators: true,
            new: true // me auti thn entoli stelnei meta to kainourgio kai oxi to palio
        })
        if (author) {
            res.send(author)
        } else {
            next(createError(404, `author with id: ${req.params.authorId} not found!`))
        }
    } catch (error) {
        console.log(error);
        next(createError(500, "An error occurred while modifying the author"))
    }


})


authorsRouter.delete("/:authorId", async (req, res, next) => {
    try {
        const author = await AuthorModel.findByIdAndDelete(req.params.authorId)
        if (author) {
            res.status(204).send()
        } else {
            next(createError(404, `author with id: ${req.params.authorId} not found!`))
        }
    } catch (error) {
        console.log("line 135" + error);
        next(error)
    }
})



export default authorsRouter
