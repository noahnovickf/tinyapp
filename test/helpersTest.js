const { assert } = require("chai");

const {
  checkAuthentification,
  generateRandomString
} = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("checkAuthentification", function() {
  it("should return a user with valid email", function() {
    const user = checkAuthentification("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user.id);
  });
});

describe("checkAuthentification", function() {
  it("should return a user undefined", function() {
    const user = checkAuthentification("me@me.me", testUsers);
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user.id);
  });
});
