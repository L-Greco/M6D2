import createError from "http-errors"
import atob from "atob"
//  atob is a library that decodes from Base64 format 
// in basic auth the info is transformed in Base64 format
// so we need to transform it back to normal


import AuthorModel from "../authors/Schema.js"

export const basicAuthMiddleware = async (req, res, next) => {
    // console.log(atob(req.headers.authorization.split("Basic ")[1]));
    const decoded = atob(req.headers.authorization.split("Basic ")[1])
    const [name, password] = decoded.split(":")
    // console.log(name)
    // console.log(password);
    const author = await AuthorModel.checkCredentials(name, password)
    if (author) {
        req.author = author
        console.log(author);
        next()
    } else {
        next(createError(401, "Credentials are not correct!"))
    }

}