import React from "react";
import {
  BtnMyLocation,
  MapView,
  SearchBar,
  BtnTrucksLocations,
  BtnClusters,
} from "../components";
import { ReactLogo } from "../components/ReactLogo";

export const HomeScreen = () => {
  return (
    <div>
      <MapView />
      <BtnMyLocation />
      <BtnTrucksLocations />
      <BtnClusters />
      <ReactLogo />
      <SearchBar />
    </div>
  );
};
