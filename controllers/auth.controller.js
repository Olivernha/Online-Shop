// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const authUtil = require("../util/authentication");
const validation = require("../util/validation");
const sessionFlash = require("../util/session-flash");

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  }
});
function getSignup(req, res) {
  let sessionData = sessionFlash.getSessionData(req);
  if (!sessionData) {
    sessionData = {
      email: "",
      confirmEmail: "",
      password: "",
      fullname: "",
      street: "",
      postal: "",
      city: "",
    };
  }
  res.render("customer/auth/signup", {
    inputData: sessionData,
  });
}

async function signup(req, res, next) {
  const enteredData = {
    email: req.body.email,
    confirmEmail: req.body["confirm-email"],
    password: req.body.password,
    fullname: req.body.fullname,
    street: req.body.street,
    postal: req.body.postal,
    city: req.body.city,
  };
  if (
    !validation.userDetailsAreValid(
      req.body.email,
      req.body.password,
      req.body.fullname,
      req.body.street,
      req.body.postal,
      req.body.city
    ) ||
    !validation.emailIsConfirmed(req.body.email, req.body["confirm-email"])
  ) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage: "Please fill in all fields correctly.",
        ...enteredData,
      },
      function () {
        res.redirect("/signup");
      }
    );

    return;
  }

  const user = new User(
    req.body.email,
    req.body.password,
    req.body.fullname,
    req.body.street,
    req.body.postal,
    req.body.city
  );

  try {
    const existsAlready = await user.existsAlready();

    if (existsAlready) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: "User already exists.",
          ...enteredData,
        },
        function () {
          res.redirect("/signup");
        }
      );
      return;
    }

    await user.signup();
  } catch (error) {
    next(error);
    return;
  }

  transport.sendMail({
    to: user.email,
    from: "gavin-oliver@knowledgemd.com",
    subject: `Welcome to Online Shop, ${user.email}`,
    html: `<h1>You successfully signed up!</h1>`,
  });
  res.redirect("/login");
}

function getLogin(req, res) {
  let sessionData = sessionFlash.getSessionData(req);
  if (!sessionData) {
    sessionData = {
      email: "",
      password: "",
    };
  }
  res.render("customer/auth/login", {
    inputData: sessionData,
  });
}

async function login(req, res, next) {
  const user = new User(req.body.email, req.body.password);
  let existingUser;
  try {
    existingUser = await user.getUserWithSameEmail();
  } catch (error) {
    next(error);
    return;
  }
  const sessionErrorData = {
    errorMessage: "Invalid credentials. Check your email and password.",
    email: req.body.email,
    password: req.body.password,
  };
  if (!existingUser) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function () {
      return res.redirect("/login");
    });
    return;
  }

  const passwordIsCorrect = await user.hasMatchingPassword(
    existingUser.password
  );

  if (!passwordIsCorrect) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function () {
      res.redirect("/login");
    });
    return;
  }

  authUtil.createUserSession(req, existingUser, function () {
    res.redirect("/");
  });
}

function logout(req, res) {
  authUtil.destroyUserAuthSession(req);
  res.redirect("/login");
}
function getReset(req, res) {
  let sessionData = sessionFlash.getSessionData(req);
  if (!sessionData) {
    sessionData = {
      email: "",
    };
  }
  res.render("customer/auth/reset", {
    inputData: sessionData,
  });
}
async function postReset(req, res, next) {
  const user = new User(req.body.email);
  let existingUser;
  try {
    existingUser = await user.getUserWithSameEmail();
  } catch (error) {
    next(error);
    return;
  }
  const sessionErrorData = {
    errorMessage: "No user with that email address exists.",
    email: req.body.email,
  };
  if (!existingUser) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function () {
      res.redirect("/reset");
    });
    return;
  }
  let resetToken, resetTokenExpiry;
  try {
    resetToken = await User.generateResetToken();
    resetTokenExpiry = Date.now() + 3600000;
  } catch (e) {
    next(e);
    return;
  }
  await user.saveResetToken(resetToken, resetTokenExpiry, existingUser._id);
  transport.sendMail({
    to: user.email,
    from: "gavin-oliver@knowledgemd.com",
    subject: `Password reset, ${user.email}`,
    html: `<p>You requested a paassword reset</p>
             <p>Click this <a href="/reset/${resetToken}">link</a> to set a new password</p>`,
  });
  res.redirect("/");
}
async function getNewPassword(req, res, next) {
  const token = req.params.token;
  let existingUser;
  try {
    existingUser = await User.findByResetToken(token);
  } catch (e) {
    next(e);
    return;
  }
  let errorMessage;
  if (!existingUser) {
    const sessionErrorData = {
      errorMessage: "Invalid token or token expired.",
    };
    sessionFlash.flashDataToSession(req, sessionErrorData, function () {
      res.redirect("/reset");
    });
    return;
  }
  let sessionData = sessionFlash.getSessionData(req);
  if (!sessionData) {
    sessionData = {
      password: "",
      confirmPassword: "",
    };
  }
  res.render("customer/auth/new-password", {
    inputData: { ...sessionData, errorMessage },
    userId: existingUser?._id.toString(),
    passwordToken: token,
  });
}
async function postNewPassword(req, res, next) {
  const newPassword = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  if (
    !newPassword ||
    !confirmPassword ||
    !validation.passwordIsConfirmed(newPassword, confirmPassword)
  ) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage: "Please fill in all fields correctly.",
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      },
      function () {
        res.redirect("/reset/" + passwordToken);
      }
    );
    return;
  }
  try {
   const user = await User.updatePassword(passwordToken, userId, newPassword);

    transport.sendMail({
      to: user.value.email,
      from: "gavin-oliver@knowledgemd.com",
      subject: `Password reset Successfully,`,
      html: `<p>Your requested  paasword has been reset</p>
                     <p>Click this <a href="http://localhost:3000/login">link</a> to login</p>`,
    });
    res.redirect("/login");
  } catch (e) {
    next(e);
    return;
  }
}
module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
  signup: signup,
  login: login,
  logout: logout,
  getReset: getReset,
  postReset: postReset,
  getNewPassword: getNewPassword,
  postNewPassword
};
