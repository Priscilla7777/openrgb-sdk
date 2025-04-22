import { Client, Device, utils } from ".."; // for your usecase use require("openrgb-sdk")
import config from "./config";
const ms = 50;

const breathing = async () => {
	// initiate a client and connect to it
	const client = new Client(...config)
	await client.connect()

	const frequency = 0.5
	const color = utils.color(255, 255, 255)

	// create deviceList
	const deviceList: Device[] = []
	const deviceCount = await client.getControllerCount()
	
	// fill deviceList
	for (let deviceId = 0; deviceId < deviceCount; deviceId++) {
		const device = await client.getControllerData(deviceId)
		if (device.modes.filter(el => el.name == "Direct")[0]) {
			await client.updateMode(deviceId, "Direct")
			deviceList[deviceId] = device
		}
	}

	async function loop (offset = 0) {
		// get brightness via sine wave
		const brightness = Math.abs(Math.sin(offset * frequency))

		// multiply every value with the brightness to make it darker
		const new_color = Object.fromEntries(Object.entries(color).map(el => [el[0], Math.floor(el[1] * brightness)]))
		
		deviceList.forEach((element, i) => {
			if (!element) return

			// update the leds with the calculated color
			client.updateLeds(i, Array(element.colors.length).fill(new_color))
		})

		// restart the loop
		setTimeout(() => loop(offset + 0.1), ms)
	}

	// start the loop
	loop()
}

breathing()

