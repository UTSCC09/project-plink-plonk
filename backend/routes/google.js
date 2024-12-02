import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import express from 'express';
import db from "../db/connection.js";
import { serialize } from "cookie";

const router = express.Router();
const frontend = process.env.FRONTEND;
const backend = process.env.BACKEND;

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: '484810430458-q970ne7dlkemnnvm0evmhjh1ju0i9mpf.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: `${backend}/api/google/oauth2/redirect`,
},
  async (accessToken, refreshToken, profile, done) => {
    console.log('Google OAuth response:', profile);
    //User find or create here
    try {
      const usersCollection = await db.collection("users");
      let user = await usersCollection.findOne({ username: profile.id });

      if (!user) {
        user = {
          username: profile.id,
          email: profile.emails[0].value,
          nickname: profile.displayName,
        };
        // Insert new user into the database
        const result = await usersCollection.insertOne(user);
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
}));

// Initialize passport session if needed (serialization/deserialization)
passport.serializeUser((user, done) => {
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

    res.setHeader(
      "Set-Cookie",
      serialize("nickname", req.user.nickname, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    res.redirect(frontend);
  }
);

export default router;