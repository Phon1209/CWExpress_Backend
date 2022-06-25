const fs = require("fs");

const createTempfile = (path, buffer, time) => {
  fs.writeFileSync(path, buffer);

  // delete an image after "time"second(s) pass
  setTimeout(() => {
    fs.unlink(path, (err) => {
      if (err) throw err;
    });
  }, 1000 * time);
};

module.exports = {
  createTempfile,
};
