import { useEffect, useRef } from "react";

function MapPicker({ setLatLng, latitude, longitude }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude || 20.5937, lng: longitude || 78.9629 },
      zoom: latitude ? 15 : 5,
    });

    if (latitude && longitude) {
      markerRef.current = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
      });
    }

    const handleMapClick = (e) => {
      const clickedLatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = new window.google.maps.Marker({
        position: clickedLatLng,
        map: map,
      });
      setLatLng(clickedLatLng);
    };

    map.addListener("click", handleMapClick);

    return () => {
      window.google.maps.event.clearListeners(map, "click");
    };
  }, [latitude, longitude, setLatLng]);

  return (
    <div
      ref={mapRef}
      style={{ height: "300px", width: "100%", marginTop: "10px" }}
    ></div>
  );
}

export default MapPicker;
