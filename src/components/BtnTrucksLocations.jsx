import React, { useContext } from "react";
import { MapContext, PlacesContext } from "../context";

export const BtnTrucksLocations = () => {
  const { isMapReady, setPolygon, map } = useContext(MapContext);
  const { userLocation } = useContext(PlacesContext);

  const onClick = () => {
    if (!isMapReady) throw new Error("Mapa no está listo");
    if (!userLocation) throw new Error("No hay ubicación del usuario");
    setPolygon();
    map?.flyTo({
      zoom: 12,
      center: [-77.03035088733803, -12.054566336623804],
    });
  };
  return (
    <button
      className="btn btn-warning"
      onClick={onClick}
      style={{
        position: "fixed",
        top: "60px",
        right: "20px",
        zIndex: 20,
      }}
    >
      Get Truck Drivers Locations
    </button>
  );
};
