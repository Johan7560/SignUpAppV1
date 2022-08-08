const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { userSchema } = require('../schemas');

const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  '/',
  catchAsync(async (req, res) => {
    const users = await User.find({});
    res.render('users/index', { users });
  })
);

router.get('/new', (req, res) => {
  res.render('users/new');
});

router.post(
  '/',

  validateUser,
  catchAsync(async (req, res, next) => {
    const user = new User(req.body.user);
    await user.save();
    req.flash('success', 'Successfully made a new user!');
    //console.log(user);
    res.redirect(`/users/${user._id}`);
  })
);

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'Cannot find that user!');
      return res.redirect('/users');
    }
    res.render('users/show', { user });
  })
);

router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted user');
    res.redirect('/users');
  })
);

module.exports = router;
