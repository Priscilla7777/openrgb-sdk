import { Client } from '..';
import config from './config';

const basic = async () => {
    // initiate a client and connect to it
    const client = new Client(...config)
    await client.connect()
  
    // get the amount of connected devices
    const deviceCount = await client.getControllerCount()
    console.log(deviceCount)
  
    // set the first device to its third mode
    await client.updateMode(0, 3)
  
    // get the data of the first device and console log it
    const device = await client.getControllerData(0)
    console.log(device)
  
    // disconnect the client
    client.disconnect()
}

basic()