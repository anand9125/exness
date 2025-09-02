"use client";
import React from 'react'
import WebTradingPageWrapper from '../../features/webTrading/components/webTradingPageWrapper'
import { connectToSocket } from '../zustand/connectToSocker';

const page = () => {
  connectToSocket();
    return (
        <WebTradingPageWrapper/>

  )
}

export default page