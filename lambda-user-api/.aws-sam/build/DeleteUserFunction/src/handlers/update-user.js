const AWS = require('aws-sdk'); 

class UpdateUserHandler {
  constructor() {
    this.dynamoDb = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1', 
    });
    this.usersTable = process.env.USERS_TABLE; 
  }

  async updateUser(event) {
    console.log('Using DynamoDB Table:', this.usersTable); 
    console.log('Received Event:', event); 

    try {
      const userId = event.pathParameters?.id; 
      const { name, email } = JSON.parse(event.body || '{}'); 

      if (!userId || (!name && !email)) {
        console.error('Missing required fields'); 
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'User ID and at least one field (name or email) are required',
          }),
          headers: { 'Content-Type': 'application/json' },
        };
      }

      let updateExpression = 'set';
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      if (name) {
        updateExpression += ' #name = :name';
        expressionAttributeNames['#name'] = 'name';
        expressionAttributeValues[':name'] = name;
      }

      if (email) {
        updateExpression += name ? ', #email = :email' : ' #email = :email';
        expressionAttributeNames['#email'] = 'email';
        expressionAttributeValues[':email'] = email;
      }

      const params = {
        TableName: this.usersTable,
        Key: { id: userId },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      };

      console.log('DynamoDB Update Params:', params); 

      const result = await this.dynamoDb.update(params).promise();

      console.log('User updated successfully:', result.Attributes); 

      return {
        statusCode: 200,
        body: JSON.stringify(result.Attributes),
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (error) {
      console.error('Error updating user:', error); 

      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Could not update user' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }
}

const handlerInstance = new UpdateUserHandler();

exports.handler = async function (event) {
  return await handlerInstance.updateUser(event);
};