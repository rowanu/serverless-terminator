const AWS = require('aws-sdk');

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

const ec2 = new AWS.EC2();

// Returns an array of all instances.
const describeInstances = () =>
  ec2.describeInstances().promise().then(data => data.Reservations);

// Returns an array of invalid instances.
const filterInvalidInstances = instances => console.log(JSON.stringify(instances, null, 2));

module.exports.terminator = (event, context, callback) => {
  Promise.resolve(event)
    .then(describeInstances)
    .then(filterInvalidInstances)
    .catch(callback);
};
