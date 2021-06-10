const config = require('./config'); // Read configuration

// Import project modules
const Landroids = require('./landroid');

const landroids = new Landroids(config);

const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const client = new InfluxDB({
  url: config.InfluxDB2.url,
  token: config.InfluxDB2.token
})

console.log("Scheduling polling");
landroids.pollEvery(60, function(status, landroid) { // Poll every 60 seconds
  if(status) { // We got some data back from the Landroids
    // console.info(JSON.stringify(status));

    // Send data to InfluxDB
    const writeApi = client.getWriteApi(config.InfluxDB2.org, config.InfluxDB2.bucket);
    // writeApi.useDefaultTags({host: 'host1'})

    const point = new Point('landroid')
        .tag("mower", landroid.name)
        .intField('no_of_alarms', status.noOfAlarms)
        .intField('battery_percent', status.batteryPercentage)
        .intField('total_mowing_hours', status.totalMowingHours)
        .stringField("state", status.state.toString());

    writeApi.writePoint(point);
    writeApi
        .close()
        .catch(e => {
          console.error('ERROR writing to InfluxDB');
          console.error(e);
        });
  }
  else {
    console.error("Error getting update!");
  }
});
