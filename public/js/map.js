/*eslint-disable */
const locations = JSON.parse(document.getElementById("map").dataset.locations);
var map = L.map("map").setView([51.505, -0.09], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

locations.forEach((loc) => {
  const el = document.createElement("div");
  el.className = "marker";

  L.
});
