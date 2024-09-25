import * as cdk from "aws-cdk-lib";
import { CfnCollection } from "aws-cdk-lib/aws-opensearchserverless";

export type StackProps = cdk.StackProps & {
  ephemeralPrefix?: string;
};

export class ServerlessOpenSearchStack extends cdk.Stack {
  jleTestDomainOpenSearchCollection: CfnCollection;
  constructor(app, id: string, props?: StackProps) {
    super(app, id, props);

    this.jleTestDomainOpenSearchCollection = new CfnCollection(this, "ServerlessOpenSearchCollection", {
      name: "jle-test-domain",
      description: "JLE Test Domain",
      standbyReplicas: "ENABLED",
      type: "SEARCH",
    });
  }
}
