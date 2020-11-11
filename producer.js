const AWS = require("aws-sdk");

const accountId = process.env.AWS_ACCOUNT_ID;
const region = "eu-central-1";

AWS.config.update({ region });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const queues = [
  "project-transactions",
  "send-vat-emails",
  "import-recurly-invoices",
];

const randomInt = (max) => Math.floor(Math.random() * Math.floor(max));

const getMessageForJob = (jobType, bodyObject) => {
  return {
    MessageBody: JSON.stringify(bodyObject),
    MessageAttributes: {
      JobType: {
        DataType: "String",
        StringValue: jobType,
      },
    },
    QueueUrl: `https://sqs.${region}.amazonaws.com/${accountId}/${jobType}.fifo`,
    MessageGroupId: `${bodyObject.accountId}`,
  };
};

const sendMessage = (messageOptions) => {
  sqs.sendMessage(messageOptions, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.MessageId);
    }
  });
};

const addMessagesToQueue = (queue, count) => {
  while (count > 0) {
    count = count - 1;
    const message = getMessageForJob(queue, {
      accountId: randomInt(999),
    });
    sendMessage(message);
  }
};

const start = async () => {
  for (const queue of queues) {
    await addMessagesToQueue(queue, randomInt(3));
  }
};

start();
