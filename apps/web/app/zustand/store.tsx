import {create} from "zustand"
import { CandleTick, GlobalTick } from "../../features/webTrading/components/interfaces";

type Store ={
  gloabalTick:Record<string,GlobalTick>
  setGlobalTick:(tick:GlobalTick)=>void
}
export const useGlobalTickStore = create<Store>((set)=>({
   gloabalTick:{},
   setGlobalTick:(tick:any)=>
    set((state)=>({
        gloabalTick:{...state.gloabalTick,[tick.symbol]:tick}
    }))
}))
//useState<T>(initialValue) defines a state variable where T is the type.
  //Record<K, T> means: “an object whose keys are of type K and whose values are of type T
  


type CandleTickStore = {
     candleTick:Record<string,CandleTick>
     setCandleTick:(tick:CandleTick)=>void
}

export const useTickStore = create<CandleTickStore>((set)=>({
    candleTick:{},
    setCandleTick:(tick:any)=>{
        set((state)=>({
            candleTick:{...state.candleTick,[tick.symbol]:tick}
        }))
    }
}))