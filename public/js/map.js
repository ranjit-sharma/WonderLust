
mapboxgl.accessToken = mapToken;

const lightMapStyle = "mapbox://styles/mapbox/streets-v12";
const darkMapStyle = "mapbox://styles/mapbox/dark-v11";
const satelliteMapStyle = "mapbox://styles/mapbox/satellite-streets-v12";
const initialMapStyle = localStorage.getItem("theme") === "dark"
    ? darkMapStyle
    : lightMapStyle;
let selectedMapStyle = initialMapStyle;

const map = new mapboxgl.Map({
    container: 'map',// container ID
    //Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: initialMapStyle, //style url
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 8// starting zoom
});

class MapStyleControl {
    onAdd(mapInstance) {
        this.map = mapInstance;
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl map-style-control";

        const select = document.createElement("select");
        select.className = "map-style-select";
        select.setAttribute("aria-label", "Map style");
        select.innerHTML = `
            <option value="default">Map</option>
            <option value="satellite">Satellite</option>
        `;
        select.value = selectedMapStyle === satelliteMapStyle ? "satellite" : "default";
        select.addEventListener("change", () => {
            selectedMapStyle = select.value === "satellite"
                ? satelliteMapStyle
                : (localStorage.getItem("theme") === "dark" ? darkMapStyle : lightMapStyle);
            this.map.setStyle(selectedMapStyle);
        });

        this.container.appendChild(select);
        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}

map.addControl(new MapStyleControl(), "top-right");

const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates) //listing.geometry.cordinates
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h5><b>${listing.title}</b></h5>
            <p>Exact Location will be provided after booking </p>`
        )
    )
    .addTo(map); 

window.addEventListener("themechange", (event) => {
    if (selectedMapStyle !== satelliteMapStyle) {
        selectedMapStyle = event.detail === "dark" ? darkMapStyle : lightMapStyle;
        map.setStyle(selectedMapStyle);
    }
});