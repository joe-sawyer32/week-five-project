const fs = require("fs");
const allWords = fs
  .readFileSync("/usr/share/dict/words", "utf-8")
  .toLowerCase()
  .split("\n");

const easyWords = allWords.filter(word => {
  return word.length > 3 && word.length < 7;
});
const normalWords = allWords.filter(word => {
  return word.length > 5 && word.length < 9;
});
const hardWords = allWords.filter(word => {
  return word.length > 7;
});

module.exports = {
  easyWords: easyWords,
  normalWords: normalWords,
  hardWords: hardWords
};
