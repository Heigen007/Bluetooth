const button = document.getElementById("getDetails");
const details = document.getElementById("details");

button.addEventListener("click", async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [
              { services: ["battery_service", "device_information"] }
              // it is hard to find a device with a specific service
              // for example, my Galaxy Buds dont have a service called "battery_service" or "device_information"
            ],
            optionalServices: ["battery_service", "device_information"],
            // optionalServices is used to tell which services we want to have access to
            
            // acceptAllDevices: true
            // if you want to accept all devices, you can set this to true
            // but it is not recommended, cause device might not have the service you want
        });
        let deviceName = device.gatt.device.name; // available for every device
        const server = await device.gatt.connect();

        const batteryService = await server.getPrimaryService("battery_service");
        const batteryLevelCharacteristic = await batteryService.getCharacteristic(
            "battery_level"
        );
        const batteryLevel = await batteryLevelCharacteristic.readValue();
        const batteryPercent = await batteryLevel.getUint8(0);

        const infoService = await server.getPrimaryService("device_information");
        const infoCharacteristics = await infoService.getCharacteristics();
        console.log(infoCharacteristics);
        let infoValues = [];
        const promise = new Promise((resolve) => {
          infoCharacteristics.forEach(async (characteristic, index, array) => {
            // Returns a buffer
            const value = await characteristic.readValue();
            console.log(new TextDecoder().decode(value));
            // Convert the buffer to string
            infoValues.push(new TextDecoder().decode(value));
            if (index === array.length - 1) resolve();
          });
        });
        promise.then(() => {
            details.innerHTML = `
              Device Name - ${deviceName}<br />
              Battery Level - ${batteryPercent}%<br />
              Device Information:
              <ul>
                ${infoValues.map((value) => `<li>${value}</li>`).join("")}
              </ul> 
            `;
          });
    }
    catch(err) {
      console.error(err);
      alert("An error occured while fetching device details");
    }
});