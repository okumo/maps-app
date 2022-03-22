import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.REACT_APP_TOKEN_MAPBOX!;

if (!navigator.geolocation) {
  alert("Tu navegador no tiene opción de Geolocation");
  throw new Error("Tu navegador no tiene la opción de Geolocation");
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
