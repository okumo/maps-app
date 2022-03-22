import React, { ChangeEvent, useContext, useRef } from "react";
import { PlacesContext } from "../context";
import { SearchResults } from "./SearchResults";

export const SearchBar = () => {
  const debounceRef = useRef<NodeJS.Timeout>();
  const { searchPlacesByTerm } = useContext(PlacesContext);

  const onQueryChanged = (event: ChangeEvent<HTMLInputElement>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      //todo buscar o ejecutar una consulta
      searchPlacesByTerm(event.target.value);
    }, 1000);
  };

  return (
    <div className="search-container">
      <input
        onChange={onQueryChanged}
        type="text"
        className="form-control"
        placeholder="Buscar lugar..."
      />
      <SearchResults />
    </div>
  );
};
