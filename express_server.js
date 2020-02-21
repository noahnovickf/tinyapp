const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { checkAuthentification, generateRandomString } = require("./helpers");
//app.uses
app.use(
  cookieSession({
    name: "user_id",
    keys: ["1f3"]
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//listening on which port
app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});

//functions
let urlsForUser = id => {
  let userURLdatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLdatabase[shortURL] = { longURL: urlDatabase[shortURL].longURL };
    }
  }
  return userURLdatabase;
};
//empty object to be filled with users
const users = {};
//empty string to be filled with urls
const urlDatabase = {};

//route to redirects home page to login if logged out, otherwise redirects to urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//routes urls, renders index with table of urldatabase info
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      urls: urlsForUser(req.session.user_id),
      user: users[req.session["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else {
    // could send status code but redirecting to login makes more sense to me
    res.redirect("/login");
  }
});
// publishes urls to table
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});
// create new urls only if the user is logged in, using functionality from new.ejs
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user: users[req.session["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
// route to check if user is logged in and shortURL exists, brings you to a specific url page
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[req.session["user_id"]]
      };
      res.render("urls_show", templateVars);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(404);
  }
});
// route to check if url is linked w current user to push new url into the url database
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.newLongURL,
      userID: req.session.user_id
    };
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});
// route to go to long url page
app.get("/u/:shortURL", (req, res) => {
  res.redirect(`http://${urlDatabase[req.params.shortURL].longURL}`);
});
// enacts delete function, returns to url table page
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});
// calls login page
app.get("/login", (req, res) => {
  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});
// checks validity of login info and if so, sets cookies
app.post("/login", (req, res) => {
  if (!checkAuthentification(req.body.email, users)) {
    res.sendStatus(403);
  } else {
    let user = checkAuthentification(req.body.email, users);
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  }
});
//redirects to urls, but logs user out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
// calls register page
app.get("/register", (req, res) => {
  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});
// checks if new users info already exists, and if not, creates new user in the user database
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  }
  if (checkAuthentification(req.body.email, users)) {
    res.sendStatus(400);
  } else {
    const id = generateRandomString();
    users[id] = {
      id: id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});
