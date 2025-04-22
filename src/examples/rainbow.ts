import { Client } from ".."; // for your usecase use require("openrgb-sdk")
import { RGBColor } from "../device";
import config from "./config";
const ms = 100;

async function rainbow () {
	// initiate a client and connect to it
	const client = new Client(...config);
	await client.connect()
	
	const deviceCount = await client.getControllerCount()
	
	for (let deviceId = 0; deviceId < deviceCount; deviceId++) {
		await client.updateMode(deviceId, 0)
	}

	// function that returns an array with rgb-objects
	function get_rainbow(offset:number) {
		const rainbow:RGBColor[] = []
		const frequency = .3;

		for (let i = 0; i < 120; ++i) {
			const red = Math.round(Math.sin(frequency * i - offset * frequency - 0) * 127 + 128)
			const green = Math.round(Math.sin(frequency * i - offset * frequency - 2) * 127 + 128)
			const blue = Math.round(Math.sin(frequency * i - offset * frequency - 4) * 127 + 128)
	
			rainbow.push({red, green, blue})
		}

		return rainbow
	}
	
	async function loop (offset = 0) {
		// get a new rainbow
		const rainbow = get_rainbow(offset)

		// loop through every device to update the leds to the rainbow
		for (let deviceId = 0; deviceId < deviceCount; deviceId++) {
			const { colors } = await client.getControllerData(deviceId);
			
			client.updateLeds(deviceId, rainbow.slice(0, colors.length))
		}

		// restart the loop
		setTimeout(() => loop(offset + 1), ms)
	}

	// start the loop
	loop()
}

rainbow()
