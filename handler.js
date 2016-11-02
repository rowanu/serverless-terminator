const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

// Returns an array of all instances.
const describeInstances = () =>
  ec2.describeInstances({ Filters: [{ Name: 'instance-state-name', Values: ['running'] }] }).promise()
    .then(data => data.Reservations.map(r => r.Instances))
    .then(instances => instances.reduce((a, b) => a.concat(b), []));

// Returns true if instance.tags includes a Key with 'Name'.
const instanceHasNoNameTag = instance => instance.Tags.filter(t => t.Key === 'Name').length < 1;

// Returns an array of invalid instances.
const filterInvalidInstances = (instances) => {
  const instancesMissingNameTag = instances.filter(instanceHasNoNameTag);
  return instancesMissingNameTag;
};

// Output invalid instances to the console/CloudWatch Logs.
const report = (invalidInstances) => {
  console.log(`The following ${invalidInstances.length} instances are invalid, and will be terminated:\n`,
    JSON.stringify(invalidInstances, null, 2));
  return invalidInstances;
};

// Terminate instances.
const terminateInstances = instances =>
  ec2.terminateInstances({ InstanceIds: instances.map(i => i.InstanceId) }).promise();

module.exports.terminator = (event, context, callback) => {
  Promise.resolve(event)
    .then(describeInstances)
    .then(filterInvalidInstances)
    .then(report)
    .then(terminateInstances)
    .catch(callback);
};
