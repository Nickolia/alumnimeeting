var passport = require('passport'),
    AuthVKStrategy = require('passport-vkontakte').Strategy,
    Profile = require('./profile_models'),
    defer = require("promised-io/promise").Deferred,
    _ = require('lodash-node'),
    async = require('async');

passport.use('vkontakte', new AuthVKStrategy({
        clientID:     "5174787",
        clientSecret: "O0RcVhXduMn0tgVj4DAJ",
        callbackURL:  "http://5.101.117.224:4300/auth/vkontakte/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        Profile.findOne({userId: profile.id}, function(err, profiles_data) {
            if (err) throw err;
            if (!profiles_data){
                var newProfile = new Profile({
                    firstName: profiles_data.name.givenName,
                    lastName: profiles_data.name.familyName,
                    userId: profiles_data.id,
                    photoUrl: profiles_data.photos[0].value,
                    profileUrl: profiles_data.profileUrl
                });
                newProfile.save(function(err,profiles) {
                    if (err) throw err;
                    return done(null, profiles);
                });
            } else {
                return done(null, profiles_data);
            }
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