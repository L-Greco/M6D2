import mongoose from "mongoose"

const { Schema, model } = mongoose

const BlogSchema = new Schema(
    {
        category: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        cover: {
            type: String,
            required: true,
        },
        readTime: {
            value: {
                type: Number,
                required: true
            }
            ,
            unit: {
                type: String,
                required: true,
            },
        }, author: {
            type: Schema.Types.ObjectId, required: true, ref: "Author" // here we write the model name 
        },
        content: {
            type: String,
            required: true,
        },
        comments: [
            {
                author: String,
                text: String,

            }
        ],
    },
    { timestamps: true }
)

export default model("Blog", BlogSchema)