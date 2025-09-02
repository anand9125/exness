import { DataStore } from "./services/datastore";
import { RedisManager } from "./services/redis";
import { WSManager } from "./services/websocket";
import {WSMessage} from "./types/type";
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
        this.wsManager.onChannelSelected = async(channel:string)=>{
            await this.setUpRedisSubscriptions(channel);
        }
    }
    async start(){
        try{
            console.log("Starting server...");
            await this.redisManager.connect();
            const channel= this.wsManager.getUrl() as string;
            this.startListeningToRedis();
            //starts backgorugund tasks
            this.startPeriodicTasks()


            this.shutdown();
        }
        catch(e){
            console.error(e);
        }
    }

    private async startListeningToRedis(){
          this.redisManager.subscribeToAllChannels((message:string)=>{
            const tick = JSON.parse(message);
           if(this.isShuttingDown)return;
           if(this.dataStore.shouldBroadCast(`tick:${tick.symbol}`, BROADCAST_THROTTLE_MS)){
               this.wsManager.broadcast(tick);
           }
          
          })
    }
    private async setUpRedisSubscriptions(channel:string){
        this.redisManager.subscribe(channel,(message:string)=>{
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