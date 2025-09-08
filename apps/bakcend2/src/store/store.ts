
import { Instrument, Transaction, User } from "../types/type";
export  const JWT_PASSWORD = "1234567890";

export  const users = new Map<string, User>();
export  const  instruments= new Map<string, Instrument>();// symbol => Instrument
export  const transactions= new Map<number, Transaction>();

