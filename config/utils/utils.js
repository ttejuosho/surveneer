const multer = require('multer');
const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: 'uploads/images/',
  filename: function(req, file, cb) {
    // eslint-disable-next-line max-len
    cb(
        null,
        file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: {fileSize: 1000000},
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  },
}).single('profileImage');

// Check File Type
// eslint-disable-next-line require-jsdoc
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

module.exports = upload;
