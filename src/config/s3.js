const { S3Client } = require('@aws-sdk/client-s3');   // AWS JavaScript library
const config = require('./config/config');

const s3 = new S3Client({
  region: config.s3.region,
  credentials: {
      accessKeyId: config.s3.key,
      secretAccessKey: config.s3.secret
  }
});

module.exports = s3;