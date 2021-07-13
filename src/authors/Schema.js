import mongoose from "mongoose"

const { Schema, model } = mongoose



const AuthorSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        surname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        dateOfBirth: {
            type: String,
            required: false
        },
        avatar: {
            type: String,
            required: false,
        },
        blogs: [
            { type: Schema.Types.ObjectId, ref: "Blog" } // here as a "Blog" 
        ]            // we write what we export from Blog Schema from "Blog"
    },
    { timestamps: true }
)
// here the collection is named Author
// 


export default model("Author", AuthorSchema)