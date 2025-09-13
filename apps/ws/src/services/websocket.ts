import WebSocket, { WebSocketServer } from "ws";
import { WSMessage } from "../types/type";

//ws lets you create clients that connect t a wss
//WebSocketServer → lets you create a server that accepts WebSocket connections from clients
export class WSManager{
    private wss:WebSocketServer; //declear a private wss property(variable) that hold the  WebSocketServer instance
    private wssUrl: string | null = null;
    onChannelSelected?: (channel: string) => void;

    constructor(port:number){
        this.wss = new WebSocketServer({port});
        this.setUp();  //call the setupEventHandlers method
    }

    private setUp(){
        this.wss.on("connection", (ws: WebSocket, req) => {
        const channel = req.url ? req.url.replace("/", "") : null;
        const symbol = channel?.replace("USDT", "");

        if (symbol) {
            console.log("Client connected, subscribing to Redis channel:", channel);
            console.log("Client connected, subscribing to Redis channel:", channel);
            // Let Server know which channel to subscribe to
            this.onChannelSelected?.(symbol);
        }

        ws.send("You are connected to socket server");
    });
 
    }
    private sendToClient(socket:WebSocket,message:WSMessage){
        if(socket.readyState == WebSocket.OPEN){
            socket.send(JSON.stringify(message));
        }
    }
     broadcast(message:WSMessage){
        const messageString = JSON.stringify(message);
         for( const client of this.wss.clients){
            if(client.readyState == WebSocket.OPEN){
                client.send(messageString);
            }
         }
    }
    close():Promise<void>{
        return new Promise((resolve,reject)=>{
            this.wss.close((err)=>{
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            })
        })
    }   
    getServer():WebSocketServer{
        return this.wss;
    } 
    getUrl():string|null{
        return this.wssUrl;
    }                   
    
}