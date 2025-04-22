import config from "./config";

import { Client } from ".."; // for your usecase use require("openrgb-sdk")
import { RGBColor } from "../device";
const ms = 200;

async function random () {
	// initiate a client and connect to it
	const client = new Client(...config); 
	await client.connect()

	const controllerCount = await client.getControllerCount() 
	
	// set devices to direct mode
	for (let deviceId = 0; deviceId < controllerCount; deviceId++) { 
		await client.updateMode(deviceId, "Direct")
	}

	// function that retruns array of random rgb objects
	function get_random (length:number) {

		const random:RGBColor[] = []
		for (let i = 0; i < length; ++i) {
			const red = Math.floor(Math.random() * 128)
			const green = Math.floor(Math.random() * 128)
			const blue = Math.floor(Math.random() * 128)
	
			random.push({red, green, blue})
		}

		return random
	}
	
	// function that loops and calls above function to create random colors
	async function loop () {
		for (let deviceId = 0; deviceId < controllerCount; deviceId++) {
			const { colors } = await client.getControllerData(deviceId);
			
			client.updateLeds(deviceId, get_random(colors.length))
		}

		// restart the loop
		setTimeout(loop, ms)
	}

	// start the loop
	loop()
}

random()
