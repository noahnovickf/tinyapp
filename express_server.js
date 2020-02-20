const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { checkAuthentification, generateRandomString } = require("./helpers");
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
  console.log(`Example app listening on port ${PORT}!`);
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

const checkEmail = email => {
  for (let id in users) {
    if (email === users[id].email) {
      return true;
    }
  }
};
//empty object to be filled with users
const users = {};
//will be empty object for storing websites and for userURLdatabase to reference
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "0qoJOq" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "345" }
};

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

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user: users[req.session["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
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
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

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

app.get("/login", (req, res) => {
  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let user = checkAuthentification(req.body.email, users);
  if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  }
  if (checkEmail(req.body.email)) {
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
