import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import express from 'express';
import db from "../db/connection.js";

const router = express.Router();
const frontend = process.env.FRONTEND;

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: '484810430458-q970ne7dlkemnnvm0evmhjh1ju0i9mpf.apps.googleusercontent.com',
  clientSecret: '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',
  // Hardcoded here !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  callbackURL: `http://localhost:4000/api/google/oauth2/redirect`,
},
  async (accessToken, refreshToken, profile, done) => {
    console.log('Google OAuth response:', profile);
    //User find or create here
    try {
      const usersCollection = await db.collection("users");
      let user = await usersCollection.findOne({ googleId: profile.id });

      if (!user) {
        user = {
          googleId: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName,
        };
        // Insert new user into the database
        const result = await usersCollection.insertOne(user);

        console.log("New user created and inserted into DB:");
        console.log(user);
        console.log("MongoDB insert result:", result);
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
}));

// Initialize passport session if needed (serialization/deserialization)
passport.serializeUser((user, done) => {
  // req.session.username = user.username // moved into the redirect fcn below
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Route to initiate authentication
router.get('/login', passport.authenticate('google', {
  scope: ['email', 'profile']
}));

router.get('/oauth2/redirect', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    req.session.username = req.user.username; 
    res.redirect(frontend);
  }
);

export default router;