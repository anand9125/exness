import { UUID } from "crypto";
import { Instrument, Transaction, User } from "../type";

export  const users = new Map<UUID, User>();
export  const  instruments= new Map<string, Instrument>();// symbol => Instrument
export const transactions= new Map<number, Transaction>();

