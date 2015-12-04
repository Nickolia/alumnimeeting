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
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    userId: profile.id,
                    photoUrl: profile.photos[0].value,
                    profileUrl: profile.profileUrl
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

    app.get('/auth/vkontakte',
        passport.authenticate('vkontakte'),
        function(req, res){
            //console.log(res);
        });

    app.get('/auth/vkontakte/callback',
        passport.authenticate('vkontakte', { failureRedirect: '/login' }),
        function(req, res) {
            console.log(res.req.user);
            res.redirect('/');
        });
};