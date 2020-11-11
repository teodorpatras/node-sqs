const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-central-1" });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const params = {
  AttributeNames: ["SentTimestamp"],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ["All"],
  QueueUrl: queueURL,
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

const deleteMessage = async (message) => {
  const deleteParams = {
    QueueUrl: process.env.SQS_QUEUE,
    ReceiptHandle: message.ReceiptHandle,
  };
  return new Promise((resolve, reject) => {
    sqs.deleteMessage(deleteParams, function (err, data) {
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
  sleep(5000);
  await deleteMessage(message);
};

const processMessages = async (messages = []) => {
  console.log(`Processing <${messages.length}> messages:`);
  await Promise.all(messages.map((m) => processMessage(m)));
};

const start = async () => {
  console.log("Started listening...");
  while (true) {
    const messages = await receiveMessages();
    await processMessages(messages);
  }
};

start();
