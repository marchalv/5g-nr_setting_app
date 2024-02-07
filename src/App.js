import './App.css';
import "leaflet/dist/leaflet.css"
import L from 'leaflet';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Rectangle, Marker } from 'react-leaflet'

import axios from 'axios';


function App() {
  const [rectangle, setRectangle] = useState(null);
  const [position, setPosition] = useState(null);
  const [squareSizeMeters, setSquareSizeMeters] = useState(500);
  const [averageSpeed, setAverageSpeed] = useState(null);
  const [maxSpeed, setMaxSpeed] = useState(null);
  const [city, setCity] = useState(null);

  const Markers = () => {
    useMapEvents({
      click: (e) => {
        setPosition(e.latlng);
      },
    });
  }

  // Set the marker icon
  const icon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });


  // Fonctions de conversion de mètres en degrés
  const metersToLat = (meters) => {
    const earthRadiusInMeters = 6371000;
    return (meters / earthRadiusInMeters) * (180 / Math.PI);
  };

  const metersToLng = (meters, latitude) => {
    const earthRadiusInMeters = 6371000;
    return (meters / (earthRadiusInMeters * Math.cos(Math.PI * latitude / 180))) * (180 / Math.PI);
  };


  useEffect(() => {
    if (position) {
      const { lat, lng } = position;
      const squareSizeLat = metersToLat(squareSizeMeters);
      const squareSizeLng = metersToLng(squareSizeMeters, lat);
      setRectangle([
        [lat - squareSizeLat / 2, lng - squareSizeLng / 2],
        [lat + squareSizeLat / 2, lng + squareSizeLng / 2]
      ]);
    }
  }, [position, squareSizeMeters]);

  const fetchData = () => {
    let minLat, minLon, maxLat, maxLon;

    if (rectangle) {
      minLat = rectangle[0][0];
      minLon = rectangle[0][1];
      maxLat = rectangle[1][0];
      maxLon = rectangle[1][1];
    }

    const bbox = rectangle ? [minLat, minLon, maxLat, maxLon] : [];

    // Define the Overpass API query
    const query = `
      [out:json];
      (
        way(${bbox.join(',')})["maxspeed"];
        is_in(${position.lat}, ${position.lng});
        area._["admin_level=8"];
      );
      out body;
    `;

    // Send the request to the Overpass API
    axios.get('https://overpass-api.de/api/interpreter', { params: { data: query } })
      .then(response => {
        console.log('Response:', response);
        // Extract the max speed data from the response
        const maxSpeeds = response.data.elements.map(element => parseInt(element.tags.maxspeed, 10)).filter(speed => !isNaN(speed));
        const city = response.data.elements.find(element => element.tags.admin_level === '8');
        const cityName = city ? city.tags.name : null;

        if (maxSpeeds.length > 0) {
          // Calculate the average and max speed
          for (let i = 0; i < maxSpeeds.length; i++) {
            // if maxspeed is not a number, remove it from the array
            if (isNaN(maxSpeeds[i])) {
              maxSpeeds.splice(i, 1);
            }
          }
          const avgSpeed = Math.round(maxSpeeds.reduce((a, b) => a + b, 0) / maxSpeeds.length);
          const maxSpd = Math.max(...maxSpeeds);

          // Set the state variables
          setAverageSpeed(avgSpeed);
          setMaxSpeed(maxSpd);
        } else {
          setAverageSpeed(null);
          setMaxSpeed(null);
          console.log('No max speed data available for the specified area.');
        }

        // Set the place name
        if (city) {
          setCity(cityName);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };



  return (
    <div className="App">
      <div className="sidebar">
        <div>
          <input type="number" min="0" step="1" value={squareSizeMeters} onChange={(e) => setSquareSizeMeters(parseFloat(e.target.value))} />
          <p>Latitude: {position ? position.lat : 'N/A'}</p>
          <p>Longitude: {position ? position.lng : 'N/A'}</p>
          <p>Average Speed: {averageSpeed ? averageSpeed + ' km/h' : 'N/A'}</p>
          <p>Max Speed: {maxSpeed ? maxSpeed + ' km/h' : 'N/A'}</p>
          <p>City: {city ? city : 'N/A'}</p>
        </div>
      </div>
      <div className="map" onClick={fetchData}>
        <MapContainer center={[47.49532953378876, 6.804911570265819]} zoom={16}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Markers />
          {rectangle && <Rectangle bounds={rectangle} />}
          {position && <Marker position={position} icon={icon} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;