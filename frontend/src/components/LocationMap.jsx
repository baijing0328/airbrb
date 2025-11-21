import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import axios from "axios";
import { Spin } from "antd";

// Fix for default marker icon in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMap = ({ lat, lon, address }) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If coordinates are provided directly, use them
    if (lat && lon) {
      setPosition([lat, lon]);
      return;
    }

    // If only address string is provided, try to geocode it
    if (address && typeof address === "string") {
      const fetchCoordinates = async () => {
        setLoading(true);
        try {
          // Using the same API key as AddressAutocomplete
          const API_KEY = "45ab8189e7044832b4fbad26ecd160bf";
          const response = await axios.get(
            `https://api.geoapify.com/v1/geocode/search`,
            {
              params: {
                text: address,
                apiKey: API_KEY,
                limit: 1,
              },
            }
          );

          if (response.data?.features?.length > 0) {
            const feature = response.data.features[0];
            setPosition([feature.properties.lat, feature.properties.lon]);
          } else {
            setPosition(null);
          }
        } catch (error) {
          console.error("Error fetching coordinates:", error);
          setPosition(null);
        } finally {
          setLoading(false);
        }
      };

      fetchCoordinates();
    } else {
      setPosition(null);
    }
  }, [lat, lon, address]);

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        <Spin tip="Loading map..." />
      </div>
    );
  }

  if (!position) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "#999" }}>Map data unavailable for this location.</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "8px", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>{address || "Location"}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default LocationMap;
