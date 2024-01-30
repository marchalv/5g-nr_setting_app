import logo from './logo.svg';
import './App.css';
import "leaflet/dist/leaflet.css"
import L from 'leaflet';

import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet'

function App() {
  const [position, setPosition] = useState([47.49532953378876, 6.804911570265819]);

  const icon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const Markers = () => {
    const map = useMapEvents({
      click: (e) => {
        setPosition(e.latlng);
      },
    });
    return position === null ? null : (
      <Marker position={position} icon={icon} />
    );
  }

  const calculate = () => {
    // Effectuez votre calcul ici
  }

  return (
    <div className="App">
      <div className="sidebar">
        {position && (
          <div>
            <p>Latitude: {position.lat}</p>
            <p>Longitude: {position.lng}</p>
            <button onClick={calculate}>Calculer</button>
          </div>
        )}
      </div>
      <div className="map">
        <MapContainer center={[47.49532953378876, 6.804911570265819]} zoom={20}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Markers />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
