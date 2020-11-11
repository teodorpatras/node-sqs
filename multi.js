const { Consumer } = require("sqs-consumer");

const accountId = process.env.AWS_ACCOUNT_ID;
const region = "eu-central-1";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const processProjectTransactions = async (message) => {
  console.log(`<${new Date()}> project-transactions`);
  // console.log(message);
  await sleep(3000);
};
const processSendVatEmails = async (message) => {
  console.log(`<${new Date()}> send-vat-emails`);
  // console.log(message);
  await sleep(5000);
};
const processImportRecurlyInvoices = async (message) => {
  console.log(`<${new Date()}> import-recurly-invoices`);
  // console.log(message);
  await sleep(8000);
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
