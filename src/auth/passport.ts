import { UserModel } from '../db/users'

const passport = require('passport');
const passportJwt = require('passport-jwt');
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
 
passport.use(
  new StrategyJwt(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: '601c23041cbfaa32066041e943080d0cf3eb07cbceaf6720c4c23ef049518ee3763ee51a54ee6d7a041eba10dfcc0d4ebc803ef2b78fe30366cd720a3d16af3a',
    // TODO: process.env.ACCESS_TOKEN_SECRET insted of token
    },
    function (jwtPayload, done) {
      return User.findOne({ where: { email: jwtPayload.email, password: jwtPayload.password } })
        .then((user) => {
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);