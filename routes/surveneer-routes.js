const surveneerController = require('../controllers/surveneer_controller.js');
const Security = require('../config/security/security.js');

module.exports = function(app) {
    app.get('/', surveneerController.home);
    app.get('/index', Security.isLoggedIn, surveneerController.index);
};