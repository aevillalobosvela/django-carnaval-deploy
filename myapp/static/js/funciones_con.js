var Hoteles = [];
var Comidas = [];
var Museos = [];
var Iglesias = [];

var map2 = L.map("map2", {
  center: [-17.964138034171146, -67.10734251787665],
  zoom: 14,
  maxZoom: 18,
  minZoom: 14,
});

$(document).ready(function () {
  $('#select-hoteles').select2({
    placeholder: 'Buscar hotel...',
    allowClear: true,
    width: '80%'
  });
});

$(document).ready(function () {
  $('#select-iglesias').select2({
    placeholder: 'Buscar iglesias...',
    allowClear: true,
    width: '80%'
  });
});

$(document).ready(function () {
  $('#select-restaurantes').select2({
    placeholder: 'Buscar comida...',
    allowClear: true,
    width: '80%'
  });
});

$(document).ready(function () {
  $('#select-museos').select2({
    placeholder: 'Buscar museos...',
    allowClear: true,
    width: '80%'
  });
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
}).addTo(map2);

// Función para mover el mapa a la ubicación seleccionada y abrir el popup del marcador
function moveToLocation(e) {
  let coords = e.target.value.split(",");
  if (coords.length === 2) {
    let lat = parseFloat(coords[0]);
    let lng = parseFloat(coords[1]);

    // Ajuste de la latitud para mover el mapa ligeramente hacia arriba
    let offsetLat = 0.0012; // Ajusta este valor según sea necesario
    let adjustedLat = lat + offsetLat;

    let latLng = [adjustedLat, lng];
    map2.flyTo(latLng, 18);

    // Buscar el marcador correspondiente y abrir su popup
    map2.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.getLatLng().equals([lat, lng])) {
        layer.openPopup();
      }
    });
  }
}
// Asignar el evento change a cada select
$("#select-hoteles").on("change", moveToLocation);
$("#select-restaurantes").on("change", moveToLocation);
$("#select-museos").on("change", moveToLocation);
$("#select-iglesias").on("change", moveToLocation);

document.addEventListener("DOMContentLoaded", function () {

  const modalCon = document.getElementById('modalCon');
  const modalC = new bootstrap.Modal(modalCon);
  const btnFlotanteCon = document.getElementById('modalConBtn');
  const ocultarModalCon = localStorage.getItem('ocultarModalCon');

  if (!ocultarModalCon) {
    modalC.show();
  } else {
    btnFlotanteCon.style.display = 'block';
  }

  // Guardar preferencia si se marcó el checkbox
  document.getElementById('cerrarmodalConBtn').addEventListener('click', function () {
    const checkCon = document.getElementById('noMostrarCheckCon');
    if (checkCon.checked) {
      localStorage.setItem('ocultarModalCon', 'true');
    }
  });

  // Reabrir modal con el botón flotante
  btnFlotanteCon.addEventListener('click', () => {
    modalC.show();
  });

  var hotelMarkers = L.layerGroup();
  var comidaMarkers = L.layerGroup();
  var museoMarkers = L.layerGroup();
  var iglesiaMarkers = L.layerGroup();

  fetch("/obtener_punto_conoce/")
    .then((response) => response.json())
    .then((data) => {
      var puntos = data;
      puntos.forEach(function (data) {
        let markerIcon = L.icon({
          iconUrl: data.imagen_ruta,
          iconSize: [42, 42],
          popupAnchor: [0, -32],
        });
        console.log(data)
        console.log(data.imagen_negocio)

        if(data.imagen_negocio==null){
          data.imagen_negocio = data.imagen_ruta
        }
        if (data.titulo == "Hotel") {
          Hoteles.push(data);
          let marker = L.marker(data.coord, { icon: markerIcon }).addTo(hotelMarkers);
          marker.bindPopup(`
          <div class="text-center">
            <h4 >${data.name}</h4>
            <img src="${data.imagen_negocio.url}" alt="${data.name}" style="width: 150px;">
            <p style="color: black; line-height: 1.2; ">${data.descripcion}</p>
            <p style="color: black; line-height: 1.2; ">${data.detalles}</p>
          </div>
        `);
        }
        if (data.titulo == "Comida") {
          Comidas.push(data);
          let marker = L.marker(data.coord, { icon: markerIcon }).addTo(comidaMarkers);
          marker.bindPopup(`
          <div class="text-center">
            <h4 >${data.name}</h4>
            <img src="${data.imagen_negocio}" alt="${data.name}" style="width: 150px;">
            <p style="color: black; line-height: 1.2; ">${data.descripcion}</p>
            <p style="color: black; line-height: 1.2; ">${data.detalles}</p>
          </div>
        `);
        }
        if (data.titulo == "Museo") {
          Museos.push(data);
          let marker = L.marker(data.coord, { icon: markerIcon }).addTo(museoMarkers);
          marker.bindPopup(`
          <div class="text-center">
            <h4 >${data.name}</h4>
            <img src="${data.imagen_negocio}" alt="${data.name}" style="width: 150px;">
            <p style="color: black; line-height: 1.2; ">${data.descripcion}</p>
            <p style="color: black; line-height: 1.2; ">${data.detalles}</p>
          </div>
        `);
        }
        if (data.titulo == "Iglesia") {
          Iglesias.push(data);
          let marker = L.marker(data.coord, { icon: markerIcon }).addTo(iglesiaMarkers);
          marker.bindPopup(`
          <div class="text-center">
            <h4 >${data.name}</h4>
            <img src="${data.imagen_negocio}" alt="${data.name}" style="width: 150px;">
            <p style="color: black; line-height: 1.2; ">${data.descripcion}</p>
            <p style="color: black; line-height: 1.2; ">${data.detalles}</p>
          </div>
        `);
        }


        hotelMarkers.addTo(map2);
        comidaMarkers.addTo(map2);
        museoMarkers.addTo(map2);
        iglesiaMarkers.addTo(map2);

      });

      var overlayMaps3 = {
        "Hoteles y alojamientos": hotelMarkers,
        "Restaurantes": comidaMarkers,
        "Museos": museoMarkers,
        "Iglesias": iglesiaMarkers,
      };

      L.control.layers(null, overlayMaps3, { collapsed: false }).addTo(map2);

      addOptionsToSelect("select-hoteles", Hoteles, "Hotel");
      addOptionsToSelect("select-restaurantes", Comidas, "Comida");
      addOptionsToSelect("select-museos", Museos, "Museo");
      addOptionsToSelect("select-iglesias", Iglesias, "Iglesia");



    });

});

var carto = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
).addTo(map2);
// Crear un control de capas para los mapas base

function addOptionsToSelect(selectId, locations, category) {
  let select = document.getElementById(selectId);
  locations
    .filter((loc) => loc.titulo === category)
    .forEach((location) => {
      let option = document.createElement("option");
      option.value = location.coord.join(",");
      option.text = location.name;
      select.add(option);
    });
}

