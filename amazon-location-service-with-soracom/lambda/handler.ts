import { error } from 'console';

const moment = require('moment-timezone');
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({ region: 'ap-northeast-1' });
const location = new AWS.Location();
const ssm = new AWS.SSM();
const axios = require('axios');
const qs = require('querystring');
AWS.config.logger = console;

exports.devicePositionHandler = async function (event: any, context: any) {
  console.log('event:', JSON.stringify(event, null, 2));
  console.log('context:', JSON.stringify(context, null, 2));
  const trackerName: string = String(
    process.env.AMAZON_LOCATION_SERVICE_TRACKER_NAME
  );

  if (event.lon && event.lat) {
    const deviceId: string = context.clientContext.imei;
    const date = new Date();
    const devicePostion = {
      DeviceId: deviceId,
      Position: [event.lon, event.lat],
      SampleTime: moment(date).toISOString(),
    };
    const params = {
      TrackerName: trackerName,
      Updates: [devicePostion],
    };
    console.log(
      'batchUpdateDevicePosition param:',
      JSON.stringify(params, null, 2)
    );
    try {
      const result = await location.batchUpdateDevicePosition(params).promise();
      console.log(
        'batchUpdateDevicePosition result:',
        JSON.stringify(result, null, 2)
      );
      return {
        statusCode: 200,
        body: JSON.stringify(
          {
            message: 'Device Position Update Successful!',
          },
          null,
          2
        ),
      };
    } catch (error) {
      console.error(
        'Location Services Batch Update Device Position Error : ' + error
      );
      return {
        statusCode: 500,
        body: JSON.stringify(
          {
            message: 'Device Position Update Failed!',
          },
          null,
          2
        ),
      };
    }
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Device Position No Update!',
        },
        null,
        2
      ),
    };
  }
};
exports.sendNotificationHandler = async function (event: any, context: any) {
  console.log('event:', JSON.stringify(event, null, 2));
  console.log('context:', JSON.stringify(context, null, 2));
  const lineNotifyToken = await getLineNotifyToken();

  console.log(event.detail);
  const message: string = await createMessage(event.detail);
  const result: boolean = await sendNotifyMessage(lineNotifyToken, message);
  if (result) {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Line Notify Send Successful.',
        },
        null,
        2
      ),
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: 'Line Notify Send Error.',
        },
        null,
        2
      ),
    };
  }
};
async function getLineNotifyToken(): Promise<string> {
  const ssmRequest = {
    Name: process.env.LINE_NOTIFY_TOKEN,
    WithDecryption: true,
  };
  const response: any = await ssm.getParameter(ssmRequest).promise();
  return String(response.Parameter.Value);
}
async function createMessage(eventDetail: any): Promise<string> {
  const eventType = eventDetail.EventType;
  let eventName = '';
  if (eventType == 'ENTER') {
    eventName = 'の中に入りました。';
  } else {
    eventName = 'の外に出ました。';
  }
  return `DeviceId: ${eventDetail.DeviceId}がGeoFence: ${eventDetail.GeofenceId}${eventName}　位置: https://www.google.com/maps?q=${eventDetail.Position[1]},${eventDetail.Position[0]}`;
}
async function sendNotifyMessage(
  lineNotifyToken: String,
  message: string
): Promise<boolean> {
  const lineNotifyUrl = 'https://notify-api.line.me/api/notify';
  // リクエスト設定
  const payload: { [key: string]: string } = {
    message: message,
  };

  console.log('payload:', JSON.stringify(payload, null, 2));
  const config = {
    url: lineNotifyUrl,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${lineNotifyToken}`,
    },
    data: qs.stringify({
      message: message,
    }),
  };
  // メッセージ送信
  try {
    const result = await axios.request(config);
    console.log(result);
    if (result.data.message === 'ok') {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
