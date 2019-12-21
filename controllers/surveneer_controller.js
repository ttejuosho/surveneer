
exports.home = (req, res) => {
  res.redirect('/index');
};

exports.index = (req, res) => {
  return res.render('index', req.session.globalUser);
};
