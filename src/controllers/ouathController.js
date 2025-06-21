const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const db = require('../configs/db');
const { usersTable } = require('../models/userSchema');
const { eq, or } = require('drizzle-orm');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/users/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile);

        const existingUser = await db
          .select()
          .from(usersTable)
          .where(
            or(eq(usersTable.email, profile.emails[0].value), eq(usersTable.googleId, profile.id))
          )
          .limit(1);

        if (existingUser.length > 0) {
          let user = existingUser[0];
          if (!user.googleId) {
            const updatedUser = await db
              .update(usersTable)
              .set({
                googleId: profile.id,
                provider: 'google',
              })
              .where(eq(usersTable.id, user.id))
              .returning();

            return done(null, updatedUser[0]);
          }

          return done(null, user);
        } else {
          const newUser = await db
            .insert(usersTable)
            .values({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              provider: 'google',
              password: null,
            })
            .returning();

          return done(null, newUser[0]);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

const googleAuth = (req, res) => {
  passport.authenticate('google', { scope: ['email', 'profile'] })(req, res);
};

const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      return res.redirect('http://localhost:5173/login?error=auth_failed');
    }
    if (!user) {
      return res.redirect('http://localhost:5173/login?error=no_user');
    }

    const token = generateToken(user);

    res.redirect(`http://localhost:5173/home?user=${token}`);
  })(req, res, next);
};

module.exports = {
  googleAuth,
  googleAuthCallback,
};
