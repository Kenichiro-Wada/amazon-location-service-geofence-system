# amazon-location-service-geofence-system

amazon location service geofence System.
code name 'Necklace of Artemis System'

use Visual Studio Code With Remote Containers extension
Remote Containers configuration Based https://github.com/toricls/aws-amplify-sns-workshop-in-vscode
detail see https://github.com/toricls/aws-amplify-sns-workshop-in-vscode

# Usage

- Clone this repository.
- Base Directory Run `code .`
- Run `cd amazon-location-service-geofence-system`
- Run `cdk deploy`
- GeoFence put Data And Systems Mamanger Paramater Store put Data see cli Command.

# Structure

- .devcontainer : VS Code Remote Container Configration File.
- amazon-location-service-geofence-system
  - cli-json : aws cli input json files
    - cli-json/sample.json, sample-odaiba.json : Amazon Location Service GeoFencd Data files.
    - cli-json/ssm.json : Systems Mamanger Paramater Store Configration file for Line Notify Token. Set Your Line Notify Token.
  - lambda : AWS Lambda Function files
    - lambda/handler.ts : AWS Lambda Function file.
      - lambda/handler.ts#sendNotificationHandler : Triger SORACOM Funk. put Amazon Location Service Device Position.
      - lambda/handler.ts#sendNotificationHandler : Triger GeoFence Event. Send Line Notify.
  - lib : AWS CDK Stack files
    - lib/amazon-location-service-with-soracom-stack.ts : AWS CDK Stack File.

# cli Command

## GeoFence put Command

aws location put-geofence --cli-input-json file:///workspaces/amazon-location-service-with-soracom/cli-json/sample.json

## Systems Mamanger Paramater Store put Command

aws ssm put-parameter --cli-input-json file:///workspaces/amazon-location-service-with-soracom/cli-json/ssm.json

# Author

Kenichiro Wada
