<script lang="ts">
    import L from "leaflet";
  
    let map: L.Map;
  
    const initializeMap = () => {
      map = L.map("map").setView([51.505, -0.09], 13);
  
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    };
    window.addEventListener("load", initializeMap);

  </script>
  
  <style>
    #map {
      height: 500px;
      width: 100%;
    }
  </style>
  
  <div id="map"></div>
  
  