const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-central-1" });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const getMessageForJob = (jobType, bodyObject) => {
  return {
    MessageBody: JSON.stringify(bodyObject),
    MessageAttributes: {
      JobType: {
        DataType: "String",
        StringValue: jobType,
      },
    },
    QueueUrl: process.env.SQS_QUEUE,
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

const jobs = [
  "project-transactions",
  "send-vat-emails",
  "import-recurly-invoices",
  "process-duns",
];

for (const job of jobs) {
  for (let i = 0; i < 9; i++) {
    sendMessage(
      getMessageForJob(job, {
        accountId: Math.floor(Math.random() * Math.floor(999)),
      })
    );
  }
}
