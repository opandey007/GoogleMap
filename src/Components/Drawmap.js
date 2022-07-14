import React, { useRef, useState } from 'react';
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
} from '@react-google-maps/api';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useSelector, useDispatch } from 'react-redux';
import usePlacesAutocomplete, { getGeocode } from 'use-places-autocomplete';
import '@reach/combobox/styles.css';
import { formatRelative } from 'date-fns';
import mapStyle from '../Common/utils/mapStyle';
import '../Common/Css/main.css';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { SearchData } from '../Action';
const containerStyle = {
  width: '100vw',
  height: '90vh',
};
const center = {
  lat: 43.653225,
  lng: -79.383186,
};
const libraries = ['places'];

function Drawmap() {
  const { isLoaded } = useJsApiLoader({
    id: 'Maps API Key',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const mapref = React.useRef();
  const [selected, setSelected] = useState(null);
  const [marker, setMarker] = useState([]);
  const [map, setMap] = React.useState(/**@type google.maps.Map*/ (null));
  const onLoad = React.useCallback(function callback(map) {
    mapref.current = map;
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onMapClick = React.useCallback((e) => {
    setMarker((current) => [
      ...current,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        time: new Date(),
      },
    ]);
  }, []);
  const panTo = React.useCallback(({ lat, lng }) => {
    mapref.current.panTo({ lat, lng });
    mapref.current.setZoom(10);
  }, []);
  const options = {
    styles: mapStyle,
    disableDefaultUI: true,
    zoomControl: true,
  };
  return isLoaded ? (
    <>
      <div className="well">
        <Search panTo={panTo} />
        <Locate panTo={panTo} />
      </div>

      <GoogleMap
        id="map"
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={options}
        onClick={onMapClick}
      >
        <>
          <Marker position={center} />

          {marker.map((markers) => (
            <Marker
              key={markers.time.toISOString()}
              position={{ lat: markers.lat, lng: markers.lng }}
              onClick={() => {
                setSelected(markers);
              }}
              icon={{
                url: 'data:image/png;base64,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',

                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(15, 15),
                scaledSize: new window.google.maps.Size(30, 30),
              }}
            />
          ))}
          {selected ? (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => {
                setSelected(null);
              }}
            >
              <div>
                <h2>Selected Spot</h2>
                <p>Spotted {formatRelative(selected.time, new Date())}</p>
              </div>
            </InfoWindow>
          ) : null}
        </>
      </GoogleMap>
    </>
  ) : (
    <>false</>
  );
}

export default React.memo(Drawmap);

function Locate({ panTo }) {
  return (
    <img
      src="https://flyclipart.com/thumbs/blue-and-white-compass-svg-clip-arts-600-x-516-px-blue-compass-rose-946054.png"
      alt="compass"
      className="locate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null
        );
      }}
    />
  );
}

function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 43.6532, lng: () => -79.3832 },
      radius: 100 * 1000,
    },
  });
  const myState = useSelector((state) => state.SeletedPlace);
  // console.log(myState.target.value);
  const dispatch = useDispatch();
  const handleSelect = async (address) => {
    dispatch(SearchData(address));
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      panTo({ lat, lng });
    } catch (error) {
      console.log('😱 Error: ', error);
    }
  };
  return (
    <div className="search">
      <Autocomplete
        autoHighlight
        options={data.map((description) => description.description)}
        onChange={(event, value) => handleSelect(value)} // prints the selected value
        sx={{ width: 300 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Location"
            variant="outlined"
            fullWidth
            value={value}
            onChange={(event) => {
              const { value } = event.target;
              setValue(value);
            }}
          />
        )}
      />
    </div>
  );
}
