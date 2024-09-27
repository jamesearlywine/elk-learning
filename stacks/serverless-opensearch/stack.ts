import * as cdk from "aws-cdk-lib";
import * as opensearchserverless from "aws-cdk-lib/aws-opensearchserverless";
import { CfnOutput } from "aws-cdk-lib";

export type StackProps = cdk.StackProps & {
  ephemeralPrefix?: string;
};

export class ServerlessOpenSearchStack extends cdk.Stack {
  jleTestOpenSearchCollection: opensearchserverless.CfnCollection;
  jleTestOpenSearchCollectionArn: CfnOutput;

  constructor(app, id: string, props?: StackProps) {
    super(app, id, props);

    // Use the AWS managed KMS key for OpenSearch Service
    const managedKeyArn = `arn:aws:kms:${this.region}:${this.account}:alias/aws/opensearchservice`;

    // Define an encryption key policy for the OpenSearch collection
    const encryptionPolicy = new opensearchserverless.CfnSecurityPolicy(this, "EncryptionPolicy", {
      name: "collection-encryption-policy",
      description: "JLE Test OpenSearch Collection Encryption Policy",
      type: "encryption",
      policy: JSON.stringify({
        Rules: [
          {
            ResourceType: "collection",
            Resource: ["collection/jle-test-collection"],
          },
        ],
        AWSOwnedKey: true,
      }),
    });

    const networkPolicy = new opensearchserverless.CfnSecurityPolicy(this, "NetworkPolicy", {
      name: "jle-test-network-policy",
      type: "network",
      policy: JSON.stringify([
        {
          Rules: [
            {
              ResourceType: "collection",
              Resource: ["collection/jle-test-collection"],
            },
          ],
          AllowFromPublic: true,
        },
      ]),
      description: "Network policy to allow access from the public internet to the jle-test OpenSearch collection",
    });

    const dataAccessPolicy = new opensearchserverless.CfnAccessPolicy(this, "DataAccessPolicy", {
      name: "jle-test-data-policy",
      type: "data",
      policy: JSON.stringify([
        {
          Description: "Access for cfn user",
          Rules: [
            {
              ResourceType: "index",
              Resource: ["index/*/*"],
              Permission: ["aoss:*"],
            },
            {
              ResourceType: "collection",
              Resource: ["collection/jle-test-collection"],
              Permission: ["aoss:*"],
            },
          ],
          Principal: [cdk.Fn.sub("arn:aws:iam::${AWS::AccountId}:user/JamesEarlywine")],
        },
      ]),
      description: "Data access policy for OpenSearch Serverless collection",
    });

    this.jleTestOpenSearchCollection = new opensearchserverless.CfnCollection(this, "ServerlessOpenSearchCollection", {
      name: "jle-test-collection",
      description: "JLE Test Collection",
      standbyReplicas: "ENABLED",
      type: "SEARCH",
    });
    this.jleTestOpenSearchCollection.node.addDependency(encryptionPolicy);

    this.jleTestOpenSearchCollectionArn = new CfnOutput(this, "ServerlessOpenSearchCollectionArn", {
      value: this.jleTestOpenSearchCollection.attrArn,
      description: "The ARN of the jle-test OpenSearch Collection",
    });
  }
}
