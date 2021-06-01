import express from "express"
import { sendEmail } from "./src/library/email.js"

const mailRouter = express.Router()

mailRouter.post("/", async (req, res, next) => {
    try {
        await sendEmail(req.body.mail)
        res.send("Email sent to :" + req.body.mail + "!")
    } catch (error) {
        next(error)
    }
})

export default mailRouter