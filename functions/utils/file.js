const fs = require("fs");

const createTempfile = (path, buffer, time) => {
  try {
    fs.writeFileSync(path, buffer);

    // delete an image after "time"second(s) pass
    setTimeout(() => {
      fs.unlink(path, (err) => {
        if (err) throw err;
      });
    }, 1000 * time);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createTempfile,
};
