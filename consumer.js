const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-central-1" });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const params = {
  AttributeNames: ["SentTimestamp"],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ["All"],
  QueueUrl: process.env.SQS_QUEUE,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 20,
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const receiveMessages = async () => {
  return new Promise((resolve, reject) => {
    sqs.receiveMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Messages);
      }
    });
  });
};

const deleteMessages = async (messages) => {
  const receiptHandles = [];

  messages.map((m) => {
    receiptHandles.push({ Id: m.MessageId, ReceiptHandle: m.ReceiptHandle });
  });

  const deleteParams = {
    QueueUrl: process.env.SQS_QUEUE,
    Entries: receiptHandles,
  };

  return new Promise((resolve, reject) => {
    sqs.deleteMessageBatch(deleteParams, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const processMessage = async (message) => {
  const body = JSON.parse(message.Body);
  console.log(
    `<${new Date()}> - <${message.MessageAttributes.JobType.StringValue}>: `,
    body
  );
  await sleep(1000);
  return message.MessageId;
};

const processMessages = async (messages = []) => {
  console.log(`\n\nProcessing <${messages.length}> messages:\n`);
  await Promise.all(messages.map((m) => processMessage(m)));
  const result = await deleteMessages(messages);
  console.log(`\nSuccessfully deleted ${result.Successful.length} messages.\n`);
};

const start = async () => {
  console.log("Started listening...\n\n");
  while (true) {
    const messages = await receiveMessages();
    await processMessages(messages);
  }
};

start();
