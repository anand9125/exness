import { DataStore } from "./services/datastore";
import { RedisManager } from "./services/redis";
import { WSManager } from "./services/websocket";

const WS_PORT = 8080;
const REDIS_URL = "redis://localhost:6379";
const BROADCAST_THROTTLE_MS = 200;
const CANDLE_UPDATE_INTERVAL_MS = 10;
class Server{
    private wsManager:WSManager;
    private redisManager:RedisManager;
    private dataStore:DataStore;
    private intervals = [];
    private isShuttingDown = false;
    constructor(){
        this.wsManager = new WSManager(WS_PORT);
        this.redisManager = new RedisManager(REDIS_URL);
        this.dataStore = new DataStore();
    }
    async start(){
        try{
            console.log("Starting server...");
            await this.redisManager.connect();
            await this.setUpRedisSubscriptions();

            //starts backgorugund tasks
            this.startPeriodicTasks()

            this.shutdown();
        }
        catch(e){
            console.error(e);
        }
    }
    private async setUpRedisSubscriptions(){
        this.redisManager.subscribe("*",(message:string,channel:string)=>{
           if(this.isShuttingDown)return;
           try{
            const tick = JSON.parse(message);
            if(!tick){
                console.warn("Invalid tick received from redis")
                return;
            }
            const{tickMessage,hasUpdated} = this.dataStore.processTick(tick)
            if (hasUpdated && this.dataStore.shouldBroadCast(`tick:${tick.symbol}`, BROADCAST_THROTTLE_MS)) { //broadcast after a delay
                this.wsManager.broadcast(tickMessage);
            }
           }
           catch(e){
               console.error(e);
           }
        })
    }
    async startPeriodicTasks(){  //runs the backgorud jobs that run automatically after a certain time interval
        const candleInterval = setInterval(()=>{
            if(this.isShuttingDown)return;
            try{
               this.dataStore.finalizeExpiredBuckets();
            }catch(e){
                console.error(e);
            }

        },CANDLE_UPDATE_INTERVAL_MS)
    }
    private shutdown(){
        const shutdown = async (signal:string)=>{
           try{
                if(this.isShuttingDown)return;

                console.log(`Received signal ${signal}. Shutting down...`);
                this.isShuttingDown = true;
                await this.redisManager.disconnect();
                await this.wsManager.close();
                process.exit(0);
           }
           catch(e){
               console.error(e);
           }
        }
        process.on("SIGINT",()=>shutdown("SIGINT"));
        process.on("SIGTERM",()=>shutdown("SIGTERM"));
    }
}

async function main(){
    const server = new Server();
    await server.start();
}
main();