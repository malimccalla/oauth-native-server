import express from 'express';
import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
// Import Facebook and Google OAuth apps configs
import facebook from './config';

const transformFacebookProfile = profile => ({
  name: profile.name,
  avatar: profile.picture.data.url
});

// Register Facebook Passport strategy
passport.use(
  new FacebookStrategy(
    facebook,
    // Gets called when user authorizes access to their profile
    async (accessToken, refreshToken, profile, done) => {
      const userInfo = transformFacebookProfile(profile._json);
      console.log('User info server', userInfo);
      return done(null, userInfo);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
const app = express();
app.use(passport.initialize());
app.use(passport.session());

// Set up Facebook auth routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
  // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
  (req, res) =>
    res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user))
);

// Launch the server on the port 3000
const server = app.listen(3000, () => {
  const { address, port } = server.address();
  console.log(`Listening at http://${address}:${port}`);
});
