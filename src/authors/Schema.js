import mongoose from "mongoose"
import bcrypt from "bcrypt"

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
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: false,
        },
        role: {
            type: String, required: true, enum: ["Admin", "User"]
        },
        blogs: [
            { type: Schema.Types.ObjectId, ref: "Blog" } // here as a "Blog" 
        ]            // we write what we export from Blog Schema from "Blog"
    },
    { timestamps: true }
)
// here the collection is named Author
// 
// pre is a method in mongoose that gets fired just before the event that we store
// as a string in the first parameter ("save,find etc")

AuthorSchema.pre("save", async function (next) {
    const newAuthor = this // if we want this to point the right object we 
    // console.log(this);     // we cant use arrow function , "this" in arrow is undefined
    const plainText = newAuthor.password
    if (newAuthor.isModified("password")) {
        // console.time("bcrypt")   // here i set the counter 
        newAuthor.password = await bcrypt.hash(plainText, 10)
        // console.timeEnd("bcrypt") // here i end the timer and log the value
        console.log(newAuthor.password)
    }
    next()
})


AuthorSchema.statics.checkCredentials = async function (name, plainText) {
    const author = await this.findOne({ name })
    if (author) {
        const hashedPassword = author.password
        const isMatch = await bcrypt.compare(plainText, hashedPassword)
        if (isMatch) return author
        else return null
    } else {
        return null
    }
}

AuthorSchema.methods.toJSON = function () {
    const author = this
    const { name, surname, email } = author.toObject()
    return { name, surname, email }
}

export default model("Author", AuthorSchema)