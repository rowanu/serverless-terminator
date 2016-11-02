const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

// Returns an array of all instances.
const describeInstances = () =>
  ec2.describeInstances({ Filters: [{ Name: 'instance-state-name', Values: ['running'] }] }).promise()
    .then(data => data.Reservations.map(r => r.Instances)) // Flatten instances
    .then(instances => instances.reduce((a, b) => a.concat(b), []));

// Returns an array of invalid instances.
const filterInvalidInstances = instances => instances;

const report = (invalidInstances) => {
  console.log(`The following ${invalidInstances.length} instances are invalid, and will be terminated:\n`,
    JSON.stringify(invalidInstances, null, 2));
  return invalidInstances;
};

module.exports.terminator = (event, context, callback) => {
  Promise.resolve(event)
    .then(describeInstances)
    .then(filterInvalidInstances)
    .then(report)
    .catch(callback);
};
