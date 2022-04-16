import { UserModel } from '../db/users'

const passport = require('passport');
const passportJwt = require('passport-jwt');
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;

passport.use(
    new StrategyJwt(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'test',
            //process.env.ACCESS_TOKEN_SECRET
        },
        function (jwtPayload, done) {
        return UserModel.findOne({ where: { email: jwtPayload.email, password: jwtPayload.password } })
            .then((user) => {
                return done(null, user);
            })
            .catch((err) => {
                return done(null,false);
            });
        }
    )
);


module.exports = passport