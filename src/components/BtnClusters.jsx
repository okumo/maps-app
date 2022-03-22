import React, { useContext } from "react";
import { MapContext, PlacesContext } from "../context";

export const BtnClusters = () => {
  const { isMapReady, map, createCluster } = useContext(MapContext);
  const { userLocation } = useContext(PlacesContext);
  const onClick = () => {
    if (!isMapReady) throw new Error("Mapa no está listo");
    if (!userLocation) throw new Error("No hay ubicación del usuario");
    createCluster();
    map.zoomOut();
  };
  return (
    <button
      className="btn btn-info"
      onClick={onClick}
      style={{
        position: "fixed",
        top: "100px",
        right: "20px",
        zIndex: 30,
      }}
    >
      Cluster locations
    </button>
  );
};
