const { Consumer } = require("sqs-consumer");

const accountId = process.env.AWS_ACCOUNT_ID;
const region = "eu-central-1";

const processProjectTransactions = async (message) => {
  console.log("Handling message for project-transactions:");
  console.log(message);
};
const processSendVatEmails = async (message) => {
  console.log("Handling message for project-transactions:");
  console.log(message);
};
const processImportRecurlyInvoices = async (message) => {
  console.log("Handling message for import-recurly-invoices:");
  console.log(message);
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
    handleMessage: queues[queue],
    region,
  };
  const consumer = Consumer.create(config);
  consumer.start();
  console.log(`Consumer <${queue}> started!`);
  consumers[queue] = consumer;
}
