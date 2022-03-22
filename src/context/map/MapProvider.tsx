import {
  AnySourceData,
  LngLatBounds,
  Map,
  MapMouseEvent,
  Marker,
  Popup,
} from "mapbox-gl";
import React, { useContext, useEffect, useReducer } from "react";
import { directionsApi } from "../../apis";
import { fakeData } from "../../helpers/staticData";
import { DirectionsResponse } from "../../interfaces/directions";
import { PlacesContext } from "../places/PlacesContext";
import { MapContext } from "./MapContext";
import { mapReducer } from "./mapReducer";

export interface MapState {
  isMapReady: boolean;
  map?: Map;
  markers: Marker[];
}

const INITIAL_STATE: MapState = {
  isMapReady: false,
  map: undefined,
  markers: [],
};

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const MapProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(mapReducer, INITIAL_STATE);
  const { places } = useContext(PlacesContext);

  useEffect(() => {
    state.markers.forEach((marker) => marker.remove());
    const newMarkers: Marker[] = [];

    for (const place of places) {
      const [lng, lat] = place.center;
      const popup = new Popup().setHTML(
        `<h6>${place.text}</h6> <p>${place.place_name}</p>`
      );

      const newMarker = new Marker()
        .setPopup(popup)
        .setLngLat([lng, lat])
        .addTo(state.map!);
      newMarkers.push(newMarker);

      dispatch({ type: "setMarkers", payload: newMarkers });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  const setMap = (map: Map) => {
    const myLocationPopUp = new Popup().setHTML(
      `<h4>Here I am</h4><p>Somewhere in the world</p>`
    );

    new Marker({
      color: "purple",
    })
      .setLngLat(map.getCenter())
      .setPopup(myLocationPopUp)
      .addTo(map);
    dispatch({ type: "setMap", payload: map });
  };

  const getRouteBetweenPoints = async (
    start: [number, number],
    end: [number, number]
  ) => {
    const resp = await directionsApi.get<DirectionsResponse>(
      `/${start.join(",")};${end.join(",")}`
    );
    const { distance, duration, geometry } = resp.data.routes[0];
    const { coordinates: coords } = geometry;
    let kms = distance / 1000;
    kms = Math.round(kms * 100);
    kms /= 100;

    const minutes = Math.floor(duration / 60);
    console.log({ distance, minutes, kms });

    const bounds = new LngLatBounds(start, start);

    for (const coord of coords) {
      const newCoord: [number, number] = [coord[0], coord[1]];
      bounds.extend(newCoord);
    }

    state.map?.fitBounds(bounds, {
      padding: 200,
    });

    //Polyline
    const sourceData: AnySourceData = {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coords,
            },
          },
        ],
      },
    };

    if (state.map?.getLayer("RouteString")) {
      state.map.removeLayer("RouteString");
      state.map.removeSource("RouteString");
    }

    state.map?.addSource("RouteString", sourceData);

    state.map?.addLayer({
      id: "RouteString",
      type: "line",
      source: "RouteString",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "blue",
        "line-width": 3,
      },
    });
  };

  const setPolygon = () => {
    // Add a data source containing GeoJSON data.
    const sourceData: AnySourceData = {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: fakeData,
        },
      },
    };

    if (state.map?.getLayer("maine")) {
      state.map.removeLayer("outline");
      state.map.removeLayer("maine");
      state.map.removeSource("maine");
    }

    state.map?.addSource("maine", sourceData);

    state.map?.addLayer({
      id: "maine",
      type: "fill",
      source: "maine", // reference the data source
      layout: {},
      paint: {
        "fill-color": "#0080ff", // blue color fill
        "fill-opacity": 0.5,
      },
    });

    state.map?.addLayer({
      id: "outline",
      type: "line",
      source: "maine",
      layout: {},
      paint: {
        "line-color": "#000",
        "line-width": 3,
      },
    });
  };

  const createCluster = () => {
    const sourceData: AnySourceData = {
      type: "geojson",
      data: "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    };

    if (state.map?.getLayer("clusters")) {
      state.map.removeLayer("clusters");
      state.map.removeLayer("cluster-count");
      state.map.removeLayer("unclustered-point");
      state.map.removeSource("earthquakes");
    }

    state.map?.addSource("earthquakes", sourceData);

    state.map?.addLayer({
      id: "clusters",
      type: "circle",
      source: "earthquakes",
      filter: ["has", "point_count"],
      paint: {
        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#51bbd6",
          100,
          "#f1f075",
          750,
          "#f28cb1",
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
      },
    });

    state.map?.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "earthquakes",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });

    state.map?.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "earthquakes",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#5BFFDA",
        "circle-radius": 10,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#B3FFEE",
      },
      interactive: true,
    });

    state.map?.on("click", "unclustered-point", (e: MapMouseEvent) => {
      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`This is an earthquake`)
        .addTo(state.map!);
    });

    state.map?.on("click", "clusters", (e) => {
      console.log(e);
    });

    state.map?.on("mouseenter", "clusters", () => {
      state.map!.getCanvas().style.cursor = "pointer";
    });
    state.map?.on("mouseleave", "clusters", () => {
      state.map!.getCanvas().style.cursor = "";
    });
  };

  return (
    <MapContext.Provider
      value={{
        ...state,

        //Methods
        setMap,
        getRouteBetweenPoints,
        setPolygon,
        createCluster,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
