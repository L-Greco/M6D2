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
            { type: Schema.Types.ObjectId, ref: "Blog" }
        ]
    },
    { timestamps: true }
)

export default model("Author", AuthorSchema)