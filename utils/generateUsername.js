// eslint-disable-next-line import/no-extraneous-dependencies
const SHA256 = require('crypto-js/sha256');
const getRandomInt = require('./getRandomIntInclusive');
const { USERNAME_LENGTH } = require('../config');

const HASH_PART_LENGTH = 6;

const dictionary = {
  nouns: [
    'dragon',
    'yeti',
    'elf',
    'orc',
    'pony',
    'cat',
    'dog',
    'goose',
    'pug',
    'moon',
    'sun',
    'star',
  ],
  adjectives: [
    'big',
    'little',
    'sweet',
    'sore',
    'flying',
    'red',
    'green',
    'blue',
    'yellow',
    'lemony',
    'cherry',
    'fluffy',
    'spiny',
  ],
};

module.exports = (email) => {
  const { nouns, adjectives } = dictionary;
  const hash = String(SHA256(email));
  const noun = nouns[getRandomInt(0, nouns.length - 1)];
  const maxAdjLength = USERNAME_LENGTH - noun.length - 1; // get valid adjective max length to pass validation. 1 - is underscore char
  const adjective = adjectives.filter((adj) => adj.length <= maxAdjLength)[
    getRandomInt(0, adjectives.length - 1)
  ];
  return `${adjective}_${noun}${hash.slice(0, HASH_PART_LENGTH)}`;
};
