const path = require("path");
const fs = require("fs");
const allWords = fs
  .readFileSync(path.join(__dirname, "words.txt"), "utf-8")
  .toLowerCase()
  .split("\n");

const easyWords = allWords.filter(function(word) {
  return word.length > 3 && word.length < 7;
});
const normalWords = allWords.filter(function(word) {
  return word.length > 5 && word.length < 9;
});
const hardWords = allWords.filter(function(word) {
  return word.length > 7 && word.length < 11;
});

module.exports = {
  easyWords: easyWords,
  normalWords: normalWords,
  hardWords: hardWords
};
