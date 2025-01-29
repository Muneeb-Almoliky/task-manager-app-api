const path = require("path");

const fileExtLimiter = (allowedExtArray) => {
  return (req, res, next) => {
    
    const image = req.files.image;
    const fileExt = path.extname(image.name);

    if (!allowedExtArray.includes(fileExt)) {
      const message = `Upload failed. Only ${allowedExtArray.join(", ")} files are allowed.`;
      return res.status(422).json({ status: "error", message });
    }

    next();
  };
};

module.exports = fileExtLimiter;
