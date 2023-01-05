const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

export const passSchema = passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(128) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(1) // Must have at least 1 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .has()
  .symbols(1);