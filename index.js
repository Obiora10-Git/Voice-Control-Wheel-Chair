
const bluetoothStatus = document.getElementById('bluetooth_message');
const esp32Status = document.getElementById('esp32_message')
const SERVICE_UUID = '3097517b-966c-4c6e-a142-d71e9b734bc8';
const CHARACTERISTIC_UUID = '7b5aed00-8e17-411c-95b3-367f21c304ea';
let esp32Characteristic = null;


//Gotten from the Internet(A.I)
// Function triggered by a button click on your website
async function connectBluetooth() {
  try {
    // Request a Bluetooth device matching specific filters
    const device = await navigator.bluetooth.requestDevice({
      //acceptAllDevices: true // Or filter by services/name
      filters: [{ services: [SERVICE_UUID] }]
    });

    // Connect to the device's server
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    esp32Characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

    console.log('Connected to: ' + device.name);
    bluetoothStatus.textContent = 'Connected to: ' + device.name;
  } catch (error) {
    console.log('User cancelled or connection failed: ' + error);
    bluetoothStatus.textContent = 'User cancelled or connection failed: ' + error;
  }
}


async function sendCommand(value) {
    if (!esp32Characteristic) {
        alert("Please connect to the BLE device first!");
        return;
    }
    try {
         // Convert text into an array buffer to transmit via BLE
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        await esp32Characteristic.writeValue(data);
        console.log("Sent value: " + value);
        esp32Status.textContent = "Sent value: " + value;
    } catch (error) {
        console.error("Error sending data:", error);
        esp32Status.textContent = "Error sending data:", error;
    }
}

