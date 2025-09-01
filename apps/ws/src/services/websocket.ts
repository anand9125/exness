import WebSocket, { WebSocketServer } from "ws";
import { WSMessage } from "../types/type";

//ws lets you create clients that connect t a wss
//WebSocketServer → lets you create a server that accepts WebSocket connections from clients
export class WSManager{
    private wss:WebSocketServer; //declear a private wss property(variable) that hold the  WebSocketServer instance

    constructor(port:number){
        this.wss = new WebSocketServer({port});
        this.setupEventHandlers();  //call the setupEventHandlers method
    }

    private setupEventHandlers(){
        this.wss.on("connection",(ws:WebSocket,req)=>{   //A WebSocket server emits a "connection" event whenever a new WebSocket client (like a browser or app) connects to it.
             //ws represents the WebSocket client that connected to the server.we can use it for (you use it to send or receive messages).
            ws.send("You are connected to socket server");
        })
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
    
}