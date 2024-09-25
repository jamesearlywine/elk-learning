import * as cdk from "aws-cdk-lib";
import {CfnCollection} from "aws-cdk-lib/aws-opensearchserverless";

export type StackProps = cdk.StackProps & {
  ephemeralPrefix?: string;
};

export class Stack extends cdk.Stack {
  someCollection: CfnCollection
  constructor(app, id: string, props?: StackProps) {
    super(app, id, props);

    this.someCollection = new CfnCollection(this, "OpenSearchServerlessCollection", {
      name: "some-collection",
      description: "Some Test Domain",
      standbyReplicas: "ENABLED",
      type: "SEARCH"
    });
  }
}
