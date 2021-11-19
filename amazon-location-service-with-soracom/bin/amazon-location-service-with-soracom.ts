#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AmazonLocationServiceWithSoracomStack } from '../lib/amazon-location-service-with-soracom-stack';

const app = new cdk.App();
new AmazonLocationServiceWithSoracomStack(
  app,
  'AmazonLocationServiceWithSoracomStack',
  {}
);
