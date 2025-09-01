import { createClient, RedisClientType } from "redis";
//we are using node redis client redis package
//createCLient is a function that creates a new redis connection
//RedisClientType → a TypeScript type that describes what a Redis client looks likeRedisClientType → a TypeScript type that describes what a Redis client looks like

export class RedisManager{
    private client:RedisClientType;  //you declare a variable client that holds your Redis connection.
    constructor(private url:string){
        this.client = createClient({url});  //create redis client
        this.setupEventHandlers();
    }
    private setupEventHandlers(){
        this.client.on("connect",()=>{
            console.log("connected to redis");
        })
    }
    async connect(){
        await this.client.connect();
    }
    async disconnect(){
        await this.client.disconnect();
    }

    async subscribe(pattern: string, callback: (message: string, channel: string) => void): Promise<void> {  //(pattern-based subscribe)
          //This means you can subscribe to multiple Redis channels using a pattern. Whenever a message is published to one of those channels, your callback function runs.
        try {
            await this.client.pSubscribe(pattern, callback);  //redis library internally listens for incoming messages from Redis server.When a message arrives, the library says:“Oh, the user gave me a function callback. I’ll call it now with the data.”So it does something like this (internally):callback("45000", "price:BTC");
            console.log(`Subscribed to Redis pattern: ${pattern}`);
        } catch (error) {
            console.error('Failed to subscribe to Redis:', error);
            throw error;
        }
    }
    getCLient(){
        return this.client;
    }

}