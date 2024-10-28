const AWS = require('aws-sdk');

class SendEmailHandler {
  constructor() {
    this.sns = new AWS.SNS({
      region: process.env.AWS_REGION || 'us-east-1', 
    });
    this.snsTopicArn = process.env.SNS_TOPIC_ARN;
  }

  async sendEmail(event) {
    try {
      console.log('Processing SQS Event:', JSON.stringify(event));
      for (const record of event.Records) {
        const user = JSON.parse(record.body);
        const { name, email } = user;

        const message = `Hello ${name}, your user has been created successfully`;
        const subject = 'User confirmation email';

        const params = {
          TopicArn: this.snsTopicArn,
          Message: message,
          Subject: subject,
          MessageAttributes: {
            Email: {
              DataType: 'String',
              StringValue: email,
            },
          },
        };

        await this.sns.publish(params).promise();
        console.log(`Email sent to: ${email}`);
      }

      return { statusCode: 200 };
    } catch (error) {
      console.error('There was a problem sending the email:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Email could not be sent' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }
}

const handlerInstance = new SendEmailHandler();

exports.handler = async (event) => {
  return await handlerInstance.sendEmail(event);
};