import passport from "passport"
import GoogleStrategy from "passport-google-oauth"
// passport works with "strategies" , one of them is the google one 

passport.use("Google", new GoogleStrategy({
    // here we set the name Google to this strategy 
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    // Then we Set the Id and the secret that google cloud provide us 
    callbackURL: "http://localhost:3001/authors/googleRedirect"
}, (accessToken, refreshToken, profile, done) => {

}))
