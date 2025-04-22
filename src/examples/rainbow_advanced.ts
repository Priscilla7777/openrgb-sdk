// this is an example of an advanced mode, meaning it is easier for the computer to calculate

import Device, { RGBColor, Zone } from "../device";

import { Client } from ".."; // for your usecase use require("openrgb-sdk")
import config from "./config";
const ms = 100;

async function rainbow_advanced () {
	// initiate a client and connect to it
	const client = new Client(...config)
	await client.connect()

	// create deviceList
	const deviceList: Device[] = []
	const deviceCount = await client.getControllerCount()
	
	// fill deviceList
	for (let deviceId = 0; deviceId < deviceCount; deviceId++) {
		const device = await client.getControllerData(deviceId)
		// filter out devices, that don't have a direct mode and set remaining to direct
		if (device.modes.filter(el => el.name == "Direct")[0]) {
			await client.updateMode(deviceId, "Direct")
			deviceList[deviceId] = device
		}
	}

	// get length of biggest zone
	const longestZone = Math.max(...new Set(deviceList.map(el => Math.max(...new Set(el.zones.map(el1 => el1.ledsCount))))))

	// create the first colors of the rainbow 
	const rainbow = get_rainbow(longestZone, 0)

	// function, that creates an amout of rgb objects in an array based on the given number
	function get_rainbow (amount: number, offset: number): RGBColor[]{
		const output = []
		const frequency = 0.15;
		for (let i = 0; i < amount; ++i) {
			const red = Math.round(Math.sin(frequency * i - offset * frequency - 0) * 127 + 128)
			const green = Math.round(Math.sin(frequency * i - offset * frequency - 2) * 127 + 128)
			const blue = Math.round(Math.sin(frequency * i - offset * frequency - 4) * 127 + 128)
	
			output.push({red, green, blue} as RGBColor)
		}
		return output
	}

	async function loop (offset = longestZone) {
		// delete the last rgb object and add one to the front
		rainbow.pop()
		rainbow.unshift((get_rainbow(1, offset) as [RGBColor])[0])

		// update colors of all devices
		for (let deviceId = 0; deviceId < deviceCount; deviceId++) {
			if (!deviceList[deviceId]) continue;

			let colors: RGBColor[] = []

			// concatenating all Zones instead of using updateZoneLeds, because that minimizes cpu usage
			for (let zoneId = 0; zoneId < (deviceList[deviceId] as Device).zones.length; zoneId++) {
				colors = colors.concat(rainbow.slice(0, ((deviceList[deviceId] as Device).zones[zoneId] as Zone).ledsCount))
			}

			client.updateLeds(deviceId, colors)
		}
		
		// restart the loop
		setTimeout(() => loop(offset + 1), ms)
	}

	// start the loop
	loop()
}

rainbow_advanced()

