import './App.css';
import "leaflet/dist/leaflet.css"
import L from 'leaflet';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Rectangle, Marker } from 'react-leaflet'



const icon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function App() {
  const [rectangle, setRectangle] = useState(null);
  const [position, setPosition] = useState(null);
  const [squareSizeMeters, setSquareSizeMeters] = useState(100);

  const Markers = () => {
    useMapEvents({
      click: (e) => {
        setPosition(e.latlng);
      },
    });
  }


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

  const calculate = () => {
    // Effectuez votre calcul ici
  }

  return (
    <div className="App">
      <div className="sidebar">
        <div>
          <input type="number" min="0" step="1" value={squareSizeMeters} onChange={(e) => setSquareSizeMeters(parseFloat(e.target.value))} />
          <p>Latitude: {position ? position.lat : 'N/A'}</p>
          <p>Longitude: {position ? position.lng : 'N/A'}</p>
          <button onClick={calculate} disabled={!position}>Calculer</button>
        </div>
      </div>
      <div className="map">
        <MapContainer center={[47.49532953378876, 6.804911570265819]} zoom={17}>
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