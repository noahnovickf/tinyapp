const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const generateRandomString = () => {
  let result = "";
  let char = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 1; i <= 6; i++) {
    result += char[Math.round(Math.random() * (char.length - 1))];
  }
  return result;
};

const users = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "0qoJOq" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "345" }
};

let urlsForUser = id => {
  let userURLdatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLdatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURLdatabase;
};

app.get("/urls", (req, res) => {
  if (req.cookies.user_id) {
    let templateVars = {
      urls: urlsForUser(req.cookies.user_id),
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    let templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect("/urls");
});

const checkAuthentification = (email, password) => {
  for (let id in users) {
    if (email === users[id].email && password === users[id].password) {
      return users[id];
    }
  }
};

app.post("/login", (req, res) => {
  let user = checkAuthentification(req.body.email, req.body.password);
  if (user) {
    res.cookie("user_id", user.id);
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
    user: users[req.cookies.user_id]
  };
  res.render("urls_register", templateVars);
});

const checkEmail = email => {
  for (let id in users) {
    if (email === users[id].email) {
      return true;
    }
  }
};

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
      password: req.body.password
    };
    console.log(users);
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
});
