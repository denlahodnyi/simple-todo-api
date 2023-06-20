module.exports = function (req) {
  return new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
};
