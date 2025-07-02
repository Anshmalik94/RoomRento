import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default Marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function LocationMarker({ setLatLng, latitude, longitude }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLatLng(e.latlng);
    },
  });

  useEffect(() => {
    if (latitude && longitude) {
      const newPos = { lat: latitude, lng: longitude };
      setPosition(newPos);
      setLatLng(newPos);
    }
  }, [latitude, longitude, setLatLng]);

  return position ? <Marker position={position} /> : null;
}

function MapPicker({ setLatLng, latitude, longitude }) {
  return (
    <MapContainer
      center={[latitude || 20.5937, longitude || 78.9629]}
      zoom={latitude ? 15 : 5}
      className="map-container"
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker setLatLng={setLatLng} latitude={latitude} longitude={longitude} />
    </MapContainer>
  );
}

export default MapPicker;
