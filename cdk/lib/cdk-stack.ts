import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import {
  GithubActionsRole,
  GithubActionsIdentityProvider,
} from "aws-cdk-github-oidc";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const provider = GithubActionsIdentityProvider.fromAccount(
      this,
      "GitHubProvider"
    );

    const siteRole = new GithubActionsRole(
      this,
      "NPMPackageCountTrackerSiteRole",
      {
        provider,
        owner: "lannonbr",
        repo: "npm-package-count-tracker",
        filter: "ref:refs/heads/main",
      }
    );

    const table = new Table(this, "dataTable", {
      partitionKey: {
        name: "year_month",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "timestamp",
        type: AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const fn = new Function(this, "dataTrackFn", {
      code: Code.fromAsset(
        path.join(__dirname, "..", "..", "functions", "save-data")
      ),
      handler: "index.handler",
      runtime: Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(20),
      memorySize: 512,
      environment: {
        DYNAMO_TABLE: table.tableName,
      },
    });

    table.grantReadWriteData(fn);
    table.grantReadData(siteRole);

    new Rule(this, "FnSchedule", {
      schedule: Schedule.cron({ hour: "0", minute: "0" }),
      targets: [new targets.LambdaFunction(fn)],
    });
  }
}
