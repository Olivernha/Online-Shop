const fs = require("fs");
const path = require("path");
function deleteFile(filename) {

  return fs.unlinkSync(path.join(__dirname, "..", "product-data", 'images',filename));
}
module.exports = deleteFile;
