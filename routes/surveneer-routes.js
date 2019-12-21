const surveneerController = require('../controllers/surveneer_controller.js');

module.exports = function(app) {
  app.get('/', surveneerController.home);
  app.get('/index', surveneerController.index);
};

