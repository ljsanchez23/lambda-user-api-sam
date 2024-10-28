const AWS = require('aws-sdk'); 

class CreateUserHandler {
  constructor() {
    this.dynamoDb = new AWS.DynamoDB.DocumentClient();
    this.sqs = new AWS.SQS(); 
    this.usersTable = process.env.USERS_TABLE;
    this.userQueueUrl = process.env.USER_QUEUE_URL;
  }

  async createUser(event) {
    try {
      const data = JSON.parse(event.body);
      const { name, email } = data;

      if (!name || !email) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Name and email are required' }),
          headers: { 'Content-Type': 'application/json' },
        };
      }

      const userId = Date.now().toString();
      const newUser = { id: userId, name, email };

      const dbParams = {
        TableName: this.usersTable,
        Item: newUser,
      };
      await this.dynamoDb.put(dbParams).promise();
      
      const sqsParams = {
        QueueUrl: this.userQueueUrl,
        MessageBody: JSON.stringify(newUser),
      };
      await this.sqs.sendMessage(sqsParams).promise();

      return {
        statusCode: 201
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Could not create user' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }
}

const handlerInstance = new CreateUserHandler();

exports.handler = async (event) => {
  return await handlerInstance.createUser(event);
};