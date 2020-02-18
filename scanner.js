require('dotenv').config();
const _ = require('lodash')
const http = require('axios');
const scanner = new BeaconScanner();
const BeaconScanner = require('node-beacon-scanner');

const tenantUuid = process.env.TENANT_UUID;
const relayUuid = process.env.RELAY_UUID;
const beaconUuid = process.env.BEACON_UUID;
const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;

let sendHeartbeat = _.throttle(function (beacon, rssi) {
    console.log('Sending heartbeat...');

    http.post(apiUrl + 'heartbeats', {
        beacon_id: beacon.uuid,
        beacon_major: beacon.major,
        beacon_minor: beacon.minor,
        rssi: rssi,
        // battery_level: batteryLevel,

        relay_id: relayUuid,
        tenant_id: tenantUuid,
        api_key: apiKey,
    }).then(response => {
        console.log(response.data);
    }).catch(error => {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
        }
    })
}, 3000, { 'trailing': false })

scanner.onadvertisement = (ad) => {
    if (ad.beaconType === 'iBeacon' && ad.iBeacon.uuid.toLowerCase() == beaconUuid.toLowerCase()) {
        // console.log(JSON.stringify(ad, null, '  '));
        sendHeartbeat(ad.iBeacon, ad.rssi)
    }
};

// Start scanning
scanner.startScan().then(() => {
    console.log('Scan started.');
    console.log(`Looking for beacon: ${beaconUuid}.`);
}).catch((error) => {
    console.error(error);
});
