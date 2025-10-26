const { body, validationResult } = require('express-validator');

// Validación para signup
exports.validateSignup = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('El username debe tener entre 3 y 20 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El username solo puede contener letras, números y guiones bajos'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validación para signin
exports.validateSignin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El username es requerido'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];