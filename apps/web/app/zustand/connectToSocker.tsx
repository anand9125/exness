"use client"
import { useEffect } from "react";
import { useGlobalTickStore, useTickStore } from "./store";
import { CandleTick, GlobalTick, WSMessage } from "../../features/webTrading/components/interfaces";

export function connectToSocket(){
   const setlTick = useTickStore((state)=>state.setCandleTick)
   const setGlobalTick = useGlobalTickStore((state)=>state.setGlobalTick)
     
   useEffect (()=>{
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event)=>{
        const msg:WSMessage = JSON.parse(event.data);
      //   console.log(msg);
        if("type" in msg && msg.type == "tick"){
            const tick = msg as CandleTick;
            setlTick(tick)
        }
        else{
            setGlobalTick(msg as GlobalTick)
        }
    }
    return ()=>ws.close();
   },[])
}

