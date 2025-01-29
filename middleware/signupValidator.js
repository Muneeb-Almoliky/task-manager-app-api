const { body, validationResult } = require("express-validator");

const signupValidator = [
    // Email validation
    body("email")
        .isEmail()
        .withMessage("Invalid email format.")
        .notEmpty()
        .withMessage("Email is required."),

    // Password validation
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long.")
        .matches(/[A-Z]/)
        .withMessage("Password must include at least one uppercase letter.")
        .matches(/\d/)
        .withMessage("Password must include at least one number."),


    // Validation logic
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: "error",
                errors: errors.array().map(err => err.msg),
            });
        }

        next();
    },
];

module.exports = signupValidator;
