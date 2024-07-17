
// AWS.config.update({
//   accessKeyId: '',
//   secretAccessKey: '',
//   region: 'ap-southeast-2'
// });


// AWS_ACCESS_KEY_ID="KIA47CRZDPMS3CVIWEE"
// AWS_SECRET_ACCESS_KEY="bmE0wUFzQtu/Y1q0YEZOjyEEes4uwRVZpg9kldB5"
// AWS_BUCKET_NAME="alpha-fun"
// AWS_BUCKET_REGION="ap-southeast-2"
const AWS = require('aws-sdk');

// Enable detailed logging
AWS.config.logger = console;

// Set AWS region
const region = 'us-east-1'; // e.g., 'us-west-2'
AWS.config.update({ region });

// Initialize the S3 client
const s3 = new AWS.S3({
  accessKeyId: 'AKIA47CRZDPMVY35TKJQ',
  secretAccessKey: 'nYA0DyZ15GPEpmxD2vvCMH8HGbB+BTEvGjzbRvlj'
});

// Example S3 operation: List buckets
s3.listBuckets((err, data) => {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('Bucket List', data.Buckets);
  }
});
