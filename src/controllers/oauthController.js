const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const db = require('../configs/db');
const { usersTable } = require('../models/userSchema');
const { eq } = require('drizzle-orm');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'user',
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
      callbackURL: `${BACKEND_URL}/api/users/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('Google 帳號未提供 email 權限'), null);
        }

        const userEmail = profile.emails[0].value;

        try {
          const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, userEmail))
            .limit(1);

          if (existingUser.length > 0) {
            let user = existingUser[0];

            if (!user.googleId) {
              try {
                const updatedUser = await db
                  .update(usersTable)
                  .set({
                    googleId: profile.id,
                    provider: 'google',
                  })
                  .where(eq(usersTable.id, user.id))
                  .returning();

                return done(null, updatedUser[0]);
              } catch (updateError) {
                return done(updateError, null);
              }
            }

            return done(null, user);
          } else {
            try {
              const newUser = await db
                .insert(usersTable)
                .values({
                  googleId: profile.id,
                  username: profile.displayName,
                  email: userEmail,
                  provider: 'google',
                  password: null,
                  role: 'user',
                })
                .returning();

              return done(null, newUser[0]);
            } catch (insertError) {
              return done(insertError, null);
            }
          }
        } catch (dbError) {
          return done(dbError, null);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

const googleAuth = (req, res) => {
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })(req, res);
};

const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      let errorType = 'auth_failed';
      if (err.message && err.message.includes('email')) {
        errorType = 'email_required';
      }
      return res.redirect(`${FRONTEND_URL}/authform?error=${errorType}`);
    }

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/authform?error=no_user`);
    }

    try {
      const token = generateToken(user);
      res.redirect(`${FRONTEND_URL}/authform?token=${token}`);
    } catch (tokenError) {
      res.redirect(`${FRONTEND_URL}/authform?error=token_failed`);
    }
  })(req, res, next);
};

module.exports = {
  googleAuth,
  googleAuthCallback,
};
