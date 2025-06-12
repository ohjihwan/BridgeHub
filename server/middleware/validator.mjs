<<<<<<< HEAD
import { validationResult } from "express-validator";
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ message: errors.array()[0].msg });
};
=======
import { validationResult } from "express-validator";
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ message: errors.array()[0].msg });
};
>>>>>>> 9bcc0d6c86a0d8b65a1c4656d3c50dcfda7acea6
