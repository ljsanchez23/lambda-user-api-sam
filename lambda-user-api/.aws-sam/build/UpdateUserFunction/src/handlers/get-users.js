const AWS = require('aws-sdk'); 

class GetUsersHandler {
  constructor() {
    this.dynamoDb = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1', 
    });
    this.usersTable = process.env.USERS_TABLE; 
  }

  async getUsers() {
    console.log('Using DynamoDB Table:', this.usersTable); 
    console.log('USERS_TABLE:', process.env.USERS_TABLE);


    try {
      const params = {
        TableName: this.usersTable,
      };

      const data = await this.dynamoDb.scan(params).promise(); 
      const users = data.Items;

      return {
        statusCode: 200,
        body: JSON.stringify(users),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      console.error('Error fetching users:', error);

      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Could not fetch users' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }
}

const handlerInstance = new GetUsersHandler();

exports.handler = async function (event) {
  return await handlerInstance.getUsers();
};