const AWS = require('aws-sdk'); 

class DeleteUserHandler {
  constructor() {
    this.dynamoDb = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1', 
    });
    this.usersTable = process.env.USERS_TABLE; 
  }

  async deleteUser(event) {
    console.log('Using DynamoDB Table:', this.usersTable); 
    console.log('Received Event:', event); 

    try {
      const userId = event.pathParameters?.id; 

      if (!userId) {
        console.error('User ID is missing'); 
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'User ID is required' }),
          headers: { 'Content-Type': 'application/json' },
        };
      }

      const params = {
        TableName: this.usersTable,
        Key: { id: userId },
      };

      console.log('DynamoDB Delete Params:', params); 

      await this.dynamoDb.delete(params).promise();

      console.log(`User with ID ${userId} has been deleted`); 

      return {
        statusCode: 200,
        body: JSON.stringify({ message: `User with ID ${userId} has been deleted` }),
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (error) {
      console.error('Error deleting user:', error); 

      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Could not delete user' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }
}

const handlerInstance = new DeleteUserHandler();

exports.handler = async function (event) {
  return await handlerInstance.deleteUser(event);
};