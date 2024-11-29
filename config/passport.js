// config/passport.config.js
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";

const initializePassport = () => {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          console.log("GitHub profile:", profile); // For debugging

          let user = await User.findOne({ githubId: profile.id });

          if (!user) {
            // Extract name from profile
            const fullName = profile.displayName || "";
            const [firstName = "", lastName = ""] = fullName.split(" ");

            user = await User.create({
              githubId: profile.id,
              username: profile.username || `github_${profile.id}`,
              email: profile.emails?.[0]?.value || `${profile.id}@github.user`,
              firstname: firstName,
              lastname: lastName,
              provider: "github",
              isVerified: true,
            });
          }

          return done(null, user);
        } catch (err) {
          console.error("Error in GitHub strategy:", err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default initializePassport;
