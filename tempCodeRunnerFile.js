// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('DADN');

// Create a new document in the collection.
db.getCollection('devices').insertMany([
    {
        "device_id": "dev001",
        "device_name": "Temp Sensor - Garden1_User2",
        "feed": "V1",
        "type": "temperature sensor",
        "category": "sensor",
        "location": {
          "garden_name": "Garden1_User2",
          "latitude": 10.772112,
          "longitude": 106.657883
        },
        "user": "user2",
        "time_on": "2025-04-01T07:00:00Z",
        "time_off": "2025-04-01T19:00:00Z",
        "is_active": true
      },
      {
        "device_id": "dev002",
        "device_name": "Soil Moisture Sensor - Garden1_User2",
        "feed": "V3",
        "type": "soil moisture sensor",
        "category": "sensor",
        "location": {
          "garden_name": "Garden1_User2",
          "latitude": 10.772112,
          "longitude": 106.657883
        },
        "user": "user2",
        "time_on": "2025-04-01T07:00:00Z",
        "time_off": "2025-04-01T19:00:00Z",
        "is_active": true
      },
      {
        "device_id": "dev003",
        "device_name": "Air Humidity Sensor - Garden1_User2",
        "feed": "V4",
        "type": "air humidity sensor",
        "category": "sensor",
        "location": {
          "garden_name": "Garden1_User2",
          "latitude": 10.772112,
          "longitude": 106.657883
        },
        "user": "user2",
        "time_on": "2025-04-01T07:00:00Z",
        "time_off": "2025-04-01T19:00:00Z",
        "is_active": true
      },
      {
        "device_id": "dev004",
        "device_name": "Water Pump - Garden1_User2",
        "feed": "V10",
        "type": "pump",
        "category": "device",
        "location": {
          "garden_name": "Garden1_User2",
          "latitude": 10.772112,
          "longitude": 106.657883
        },
        "user": "user2",
        "time_on": "2025-04-01T07:00:00Z",
        "time_off": "2025-04-01T19:00:00Z",
        "is_active": true
      },
      {
        "device_id": "dev005",
        "device_name": "LED Light - Garden1_User2",
        "feed": "V11",
        "type": "led light",
        "category": "device",
        "location": {
          "garden_name": "Garden1_User2",
          "latitude": 10.772112,
          "longitude": 106.657883
        },
        "user": "user2",
        "time_on": "2025-04-01T07:00:00Z",
        "time_off": "2025-04-01T19:00:00Z",
        "is_active": true
      },
    
      {
        "device_id": "dev006",
        "device_name": "Temp Sensor - Garden2_User2",
        "feed": "V1",
        "type": "temperature sensor",
        "category": "sensor",
        "location": {
          "garden_name": "Garden2_User2",
          "latitude": 10.782112,
          "longitude": 106.667883
        },
        "user": "user2",
        "time_on": "2025-04-01T06:00:00Z",
        "time_off": "2025-04-01T18:00:00Z",
        "is_active": true
      },
      {
        "device_id": "dev007",
        "device_name": "Soil Moisture Sensor - Garden2_User2",
        "feed": "V3",
        "type": "soil moisture sensor",
        "category": "sensor",
        "location": {
          "garden_name": "Garden2_User2",
          "latitude": 10.782112,
          "longitude": 106.667883
        },
        "user": "user2",
        "time_on": "2025-04-01T06:00:00Z",
        "time_off": "2025-04-01T18:00:00Z",
        "is_active": true
      },
      {
        "device_id": "dev008",
        "device_name": "Air Humidity Sensor - Garden2_User2",
        "feed": "V4",
        "type": "air humidity sensor",
        "category": "sensor",
        "location": {
          "garden_name": "Garden2_User2",
          "latitude": 10.782112,
          "longitude": 106.667883
        },
        "user": "user2",
        "time_on": "2025-04-01T06:00:00Z",
        "time_off": "2025-04-01T18:00:00Z",
        "is_active": false
      },
      {
        "device_id": "dev009",
        "device_name": "Water Pump - Garden2_User2",
        "feed": "V10",
        "type": "pump",
        "category": "device",
        "location": {
          "garden_name": "Garden2_User2",
          "latitude": 10.782112,
          "longitude": 106.667883
        },
        "user": "user2",
        "time_on": "2025-04-01T06:00:00Z",
        "time_off": "2025-04-01T18:00:00Z",
        "is_active": false
      },
      {
        "device_id": "dev010",
        "device_name": "LED Light - Garden2_User2",
        "feed": "V11",
        "type": "led light",
        "category": "device",
        "location": {
          "garden_name": "Garden2_User2",
          "latitude": 10.782112,
          "longitude": 106.667883
        },
        "user": "user2",
        "time_on": "2025-04-01T06:00:00Z",
        "time_off": "2025-04-01T18:00:00Z",
        "is_active": true
      }
    ]);