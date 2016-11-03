const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

// Returns an array of all instances.
const describeInstances = () =>
  ec2.describeInstances({ Filters: [{ Name: 'instance-state-name', Values: ['running'] }] }).promise()
    .then(data => data.Reservations.map(r => r.Instances))
    .then(instances => instances.reduce((a, b) => a.concat(b), []));

// Returns true if instance.tags includes a Key with 'Name'.
const instanceHasNoNameTag = instance => instance.Tags.filter(t => t.Key === 'Name').length === 0;

// Returns an array of invalid instances.
const filterInvalidInstances = (instances) => {
  const instancesMissingNameTag = instances.filter(instanceHasNoNameTag);
  return instancesMissingNameTag;
};

// Get just the instance ids.
const getInstanceIds = instances => instances.map(i => i.InstanceId);

// Output invalid instances to the console/CloudWatch Logs.
const report = (instanceIds) => {
  console.log(`Found ${instanceIds.length} invalid instances to terminate ${instanceIds}`);
  return instanceIds;
};

// Terminate instances.
const terminateInstances = (instanceIds) => {
  if (instanceIds.length) ec2.terminateInstances({ InstanceIds: instanceIds }).promise();
};

module.exports.terminator = (event, context, callback) => {
  Promise.resolve(event)
    .then(describeInstances)
    .then(filterInvalidInstances)
    .then(getInstanceIds)
    .then(report)
    .then(terminateInstances)
    .catch(callback);
};
