const filesPayloadExists = (req, res, next) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ status: "error", message: "No file uploaded" });
      }
    next()
}

module.exports = filesPayloadExists