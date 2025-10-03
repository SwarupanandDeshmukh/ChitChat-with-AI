import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'm6D9JGnvLgXwHToLUj75EF5DxKXGtHc8',
    socket: {
        host: 'redis-18249.c83.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 18249
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;
