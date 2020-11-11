const { Consumer } = require("sqs-consumer");

const accountId = process.env.AWS_ACCOUNT_ID;
const region = "eu-central-1";

const processProjectTransactions = async (messages) => {
  console.log("Handling messages for project-transactions:");
  console.log(messages);
};
const processSendVatEmails = async (messages) => {
  console.log("Handling messages for project-transactions:");
  console.log(messages);
};
const processImportRecurlyInvoices = async (messages) => {
  console.log("Handling messages for import-recurly-invoices:");
  console.log(messages);
};

const queues = {
  "project-transactions": processProjectTransactions,
  "send-vat-emails": processSendVatEmails,
  "import-recurly-invoices": processImportRecurlyInvoices,
};

const consumers = {};

for (const queue of Object.keys(queues)) {
  const config = {
    queueUrl: `https://sqs.${region}.amazonaws.com/${accountId}/${queue}.fifo`,
    handleMessageBatch: queues[queue],
    batchSize: 10,
    region,
  };
  const consumer = Consumer.create(config);
  consumer.start();
  console.log(`Consumer <${queue}> started!`);
  consumers[queue] = consumer;
}
