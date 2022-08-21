const fetch = require("node-fetch");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const dayjs = require("dayjs");

exports.handler = async () => {
  const count = (
    await fetch(
      "https://raw.githubusercontent.com/nice-registry/all-the-package-names/master/names.json",
      {
        headers: {
          "User-Agent":
            "NpmPackageCountTracker/1.0.0 (https://github.com/lannonbr/npm-package-count-tracker)",
        },
      }
    ).then((resp) => resp.json())
  ).length;

  const client = new DynamoDBClient({
    region: "us-east-1",
  });

  const docClient = DynamoDBDocumentClient.from(client);

  const TableName = process.env.DYNAMO_TABLE;

  const today = dayjs();
  const yearMonth = today.format("YYYY-MM");
  const timestamp = today.unix().toString();

  await docClient.send(
    new PutCommand({
      TableName,
      Item: {
        year_month: yearMonth,
        timestamp: timestamp,
        count,
      },
    })
  );
};
