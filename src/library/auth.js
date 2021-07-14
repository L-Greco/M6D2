import createError from "http-errors"
import atob from "atob"
//  atob is a library that decodes from Base64 format 
// in basic auth the info is transformed in Base64 format
// so we need to transform it back to normal
import AuthorModel from "../authors/Schema.js"
import jwt from "jsonwebtoken"
// jsonwebtoken is the library that creates the tokens 



// The next is the basic authentication middleware (without Token )
// just username and password

export const basicAuthMiddleware = async (req, res, next) => {
    // console.log(atob(req.headers.authorization.split("Basic ")[1]));
    const decoded = atob(req.headers.authorization.split("Basic ")[1])
    const [name, password] = decoded.split(":")
    // console.log(name)
    // console.log(password);
    const author = await AuthorModel.checkCredentials(name, password)
    if (author) {
        req.author = author
        console.log("User", author.name, "with id:", author._id, "made a request");
        next()
    } else {
        next(createError(401, "Credentials are not correct!"))
    }

}

// From now on we authenticate with tokens 
// we create a new Promise to inherit asynchronous behaviour
const generateJWT = (payload) =>
    new Promise((resolve, reject) =>
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, token) => {
            if (err) reject(err)

            resolve(token)
        })
    )

export const jwtAuthenticate = async (user) => {
    const accessToken = await generateJWT({ _id: user._id, role: user.role })
    // i add role so i can check it later when i will receive the token from the FE
    return accessToken
}

export const verifyToken = token =>
    new Promise((resolve, reject) =>
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            // decoded === payload
            if (err) reject(err)

            resolve(decodedToken)
        })
    )

export const JWTAuthMiddleware = async (req, res, next) => {
    // 1. Check if Authorization header is received, if it is not --> trigger an error (401)
    if (!req.headers.authorization) {
        next(createError(401, "Please provide token in the authorization header!"))
    } else {
        try {
            // 2. Extract the token from authorization header (Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGVkNWI4N2M0MjM1YTFkZWNhOGY3YzIiLCJpYXQiOjE2MjYyNTI3NTcsImV4cCI6MTYyNjg1NzU1N30.VA7M1z2LRAilFGLt1grvEIdv1VI2WUwpGWo_N0yzodg)
            const token = req.headers.authorization.replace("Bearer ", "")

            // 3. Verify the token (decode it)

            const content = await verifyToken(token)

            // 4. Find user in db and attach him/her to the request object

            const user = await AuthorModel.findById(content._id)

            if (user) {
                req.user = user
                next()
            } else {
                next(createError(404, "User not found!"))
            }
        } catch (error) {
            next(createError(401, "Token not valid!"))
        }
    }
}