var passport = require('passport');
var AuthVKStrategy = require('passport-vkontakte').Strategy;

passport.use('vk', new AuthVKStrategy({
        clientID:     "5174787",
        clientSecret: "O0RcVhXduMn0tgVj4DAJ",
        callbackURL:  "http://5.101.117.224:4300/auth/vkontakte/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        return done(null, {
            username: profile.displayName,
            photoUrl: profile.photos[0].value,
            profileUrl: profile.profileUrl
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, JSON.stringify(user));
});


passport.deserializeUser(function (data, done) {
    try {
        done(null, JSON.parse(data));
    } catch (e) {
        done(err)
    }
});

module.exports = function (app) {
};