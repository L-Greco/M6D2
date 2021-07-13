import createError from "http-errors"
import atob from "atob"

import AuthorModel from "../authors/Schema.js"

export const basicAuthMiddleware = async (req, res, next) => {
    console.log(req.headers);
}