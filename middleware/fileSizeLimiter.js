const MB = 5; // 5 MB limit
const FILE_SIZE_LIMIT = MB * 1024 * 1024;

const fileSizeLimiter = (req, res, next) => {
 
  const image = req.files.image;

  if (image.size > FILE_SIZE_LIMIT) {
    const message = `Upload failed. ${image.name} is over the file size limit of ${MB} MB.`;
    return res.status(413).json({ status: "error", message });
  }

  next();
};

module.exports = fileSizeLimiter;
