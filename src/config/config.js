const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi'); // 유효성 검사

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    DB_URL: Joi.string().required().description('Mongo DB url'),
    S3_REGION: Joi.string().required().description('AWS S3 region'),
    S3_BUCKET: Joi.string().required().description('AWS S3 bucket'),
    S3_KEY: Joi.string().required().description('AWS S3 key'),
    S3_SECRET: Joi.string().required().description('AWS S3 secret')
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongo: {
    url: envVars.DB_URL
  },
  s3: {
    region: envVars.S3_REGION,
    bucket: envVars.S3_BUCKET,
    key: envVars.S3_KEY,
    secret: envVars.S3_SECRET,
  }
}