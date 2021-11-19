import * as cdk from '@aws-cdk/core';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as geo from '@aws-cdk/aws-location';
import { Duration } from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as sqs from '@aws-cdk/aws-sqs';

export class AmazonLocationServiceWithSoracomStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    /**
     * Location Service
     */
    new geo.CfnMap(this, 'necklaceOfArtemisSystemMap', {
      mapName: 'necklaceOfArtemisSystemMap',
      pricingPlan: 'RequestBasedUsage',
      description:
        'Map for Necklace of Artemis System for JAWS PANKRATION 2021',
      configuration: {
        style: 'VectorEsriStreets',
      },
    });
    const necklaceOfArtemisSystemMapGeoFence = new geo.CfnGeofenceCollection(
      this,
      'necklaceOfArtemisSystemMapGeoFence',
      {
        collectionName: 'necklaceOfArtemisSystemGeoFence',
        pricingPlan: 'RequestBasedUsage',
        description:
          'GeoFence for Necklace of Artemis System for JAWS PANKRATION 2021',
      }
    );

    const necklaceOfArtemisSystemMapTracker = new geo.CfnTracker(
      this,
      'necklaceOfArtemisSystemMapTracker',
      {
        trackerName: 'necklaceOfArtemisSystemMapTracker',
        pricingPlan: 'RequestBasedUsage',
        description:
          'Tracker for Necklace of Artemis System for JAWS PANKRATION 2021',
      }
    );
    new geo.CfnTrackerConsumer(
      this,
      'necklaceOfArtemisSystemMapTrackerConsumer',
      {
        consumerArn: necklaceOfArtemisSystemMapGeoFence.attrCollectionArn,
        trackerName: necklaceOfArtemisSystemMapTracker.trackerName,
      }
    );

    /**
     * Lambda
     */
    const batchUpdateDevicePosition = new NodejsFunction(
      this,
      'updateDevicePostion',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        entry: 'lambda/handler.ts',
        handler: 'devicePositionHandler',
        timeout: Duration.seconds(30),
        tracing: lambda.Tracing.ACTIVE,
        description: 'Amazon Location Service Update Device Position.',
        environment: {
          AMAZON_LOCATION_SERVICE_TRACKER_NAME:
            necklaceOfArtemisSystemMapTracker.trackerName,
        },
      }
    );
    const batchUpdateDevicePositionPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['geo:BatchUpdateDevicePosition'],
    });
    batchUpdateDevicePosition.addToRolePolicy(
      batchUpdateDevicePositionPolicyStatement
    );

    const geoFenceNotify = new NodejsFunction(this, 'geoFenceNotify', {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: 'lambda/handler.ts',
      handler: 'sendNotificationHandler',
      timeout: Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      description: 'Geo Fence Notify',
      environment: {
        LINE_NOTIFY_TOKEN: 'LINE_NOTIFY_TOKEN',
      },
    });
    const geoFenceNotifyPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['ssm:GetParameter', 'ssm:GetParameters', 'kms:Decrypt'],
    });
    geoFenceNotify.addToRolePolicy(geoFenceNotifyPolicyStatement);

    /**
     * SQS DLQ
     */
    const geoFenceEventsDlq = new sqs.Queue(
      this,
      'necklaceOfArtemisSystemGeoFenceEventDlq'
    );
    /**
     * EventBridge Events
     */
    const geoFenceEventsRule = new events.Rule(
      this,
      'necklaceOfArtemisSystemGeoFenceEventRule',
      {
        description: 'Necklace of Artemis System Geofence EventRule',
        eventPattern: {
          source: ['aws.geo'],
          resources: [necklaceOfArtemisSystemMapGeoFence.attrCollectionArn],
          detailType: ['Location Geofence Event'],
        },
      }
    );
    geoFenceEventsRule.addTarget(
      new targets.LambdaFunction(geoFenceNotify, {
        deadLetterQueue: geoFenceEventsDlq,
        maxEventAge: cdk.Duration.hours(2),
        retryAttempts: 2,
      })
    );
  }
}
