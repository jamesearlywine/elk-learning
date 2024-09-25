import * as cdk from "aws-cdk-lib";
import { ServerlessOpenSearchStack } from "./serverless-opensearch/stack";

const ephemeralPrefix = undefined; // "JLE-Ephemeral-3";
export const app: cdk.App = new cdk.App();

new ServerlessOpenSearchStack(app, `${ephemeralPrefix ?? ""}ServerlessOpenSearchStack`, {
  ephemeralPrefix,
  env: {
    account: "546515125053",
    region: "us-east-2",
  },
});
