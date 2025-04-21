var marker = null;
var userLocation;
var selectedDestination;
var routingControl;
var datos_recorrido;
var staticUrl = "/static/";
var coordenadasRecibidas = [];
var escogerposicion = null;
var usermarker = null;

/* -MAPA 1-------------------------------------------------------------------------------------- */

var map1 = L.map("map1", {
  center: [-17.964138034171146, -67.10734251787665],
  zoom: 15,
  maxZoom: 18,
  minZoom: 14,
});

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
).addTo(map1);

var osmLayer = new L.TileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

var usuarioIcon = L.divIcon({
  html: '<i class="fa fa-map-marker fa-3x"></i>',
  className: "usuario-icon",
});

function onLocationFound(e) {
  userLocation = e.latlng;
  usermarker = L.marker(e.latlng).addTo(map1).bindPopup("Usted esta aqui").openPopup();
  map1.setView(e.latlng, 15);
}

function onLocationError(e) {
  alert(e.message);
}

// Solicitar la ubicación del usuario
map1.on("locationfound", onLocationFound);
map1.on("locationerror", onLocationError);

// Iniciar la solicitud de geolocalización
map1.locate({ setView: true, maxZoom: 16 });


document.getElementById("posicionBtn").addEventListener("click", function () {
  escogerposicion = true;
  document.getElementById("aviso-posicion").style.display = "block";
});

document.getElementById("cancelarposicion").addEventListener("click", function () {
  escogerposicion = null;
  document.getElementById("aviso-posicion").style.display = "none";
});

map1.on("click", function (e) {
  if (escogerposicion == true) {
    if (usermarker) {
      map1.removeLayer(usermarker);
    }
    usermarker = L.marker(e.latlng).addTo(map1).bindPopup("Usted esta aqui").openPopup();
    userLocation = e.latlng;
    map1.setView(e.latlng, 15);
  }
  escogerposicion = null
  document.getElementById("aviso-posicion").style.display = "none";
});

/* -LINEA PRINCIPAL-------------------------------------------------------------------------------------- */

fetch("/obtener_puntos_recorrido/")
  .then((response) => response.json())
  .then((data) => {
    var rec_carnaval = data.map((coord) => [coord.latitud, coord.longitud]);
    var polylineOptions = {
      color: "orange",
      weight: 8,
      opacity: 0.7,
      lineCap: "round",
      lineJoin: "round",
    };
    L.polyline(rec_carnaval, polylineOptions).addTo(map1);
    if (rec_carnaval.length > 0) {
      var firstPoint = rec_carnaval[0];
      L.marker(firstPoint).addTo(map1).bindPopup("Inicio del recorrido");

      // Añade un marcador en el último punto
      var lastPoint = rec_carnaval[rec_carnaval.length - 1];
      L.marker(lastPoint).addTo(map1).bindPopup("Fin del recorrido");
    }
  })
  .catch((error) => console.error("Error:", error));


/* -puntos de interes-------------------------------------------------------------------------------------- */

var saludIcon = L.divIcon({
  html: '<i class="fa fa-plus-square fa-2x"></i>',
  className: "salud-icon",
});

var seguridadIcon = L.icon({
  iconUrl: "/static/img/mapa/logo_policia.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

var depositoIcon = L.divIcon({
  html: '<i class="fa fa-dumpster fa-2x"></i>',
  className: "deposito-icon",
});

var pasoIcon = L.divIcon({
  html: '<span class="fa-stack fa-lg"><i class="fa fa-circle-o fa-stack-2x"></i><i class="fa fa-walking fa-stack-1x"></i>',
  className: "paso-icon",
});

var saludMarkers = L.layerGroup();
var seguridadMarkers = L.layerGroup();
var depositoMarkers = L.layerGroup();
var pasoMarkers = L.layerGroup();

document.addEventListener("DOMContentLoaded", function () {

  const modalRuta = document.getElementById('modalRuta');
  const modalR = new bootstrap.Modal(modalRuta);
  const btnFlotanteRuta = document.getElementById('modalRutaBtn');
  const ocultarModalRuta = localStorage.getItem('ocultarModalRuta');

  if (!ocultarModalRuta) {
    modalR.show();
  } else {
    btnFlotanteRuta.style.display = 'block';
  }

  document.getElementById('cerrarmodalRutaBtn').addEventListener('click', function () {
    const checkRuta = document.getElementById('noMostrarCheckRuta');
    if (checkRuta.checked) {
      localStorage.setItem('ocultarModalRuta', 'true');
    }
  });

  // Reabrir modal con el botón flotante
  btnFlotanteRuta.addEventListener('click', () => {
    modalR.show();
  });


  fetch("/obtener_punto_carnaval/")
    .then((response) => response.json())
    .then((data) => {
      var puntos = data; // Asigna los datos a la variable global
      puntos.forEach(function (data) {
        if (data.titulo == "Puesto de Salud") {
          var mark_salud = L.marker(data.coord, { icon: saludIcon }).addTo(
            saludMarkers
          );
          mark_salud.on("click", function () {
            var adjustedCoord = data.coord;
            map1.setView(adjustedCoord, 16);
            selectedDestination = data.coord;
            var popupContent = `
            <div style="padding: 0px" class="container-fluid text-center mx-auto">
              <h4>${data.titulo}</h4>
              <img src="/${data.imagen_ruta}" alt="Imagen" style="width: 100%; height: auto;">
              <p style="margin-top: 5px;">  <i class="fa fa-map-marker"></i> ${data.direccion}</p>
              <button class="btn btn-success btn-sm" onclick="generateRoute()">¿Como llegar?</button>
            </div>
        `;
            mark_salud.bindPopup(popupContent).openPopup();

          });
          saludMarkers.addTo(map1);
        }
        if (data.titulo == "Deposito residual") {
          var mark_deposito = L.marker(data.coord, {
            icon: depositoIcon,
          }).addTo(depositoMarkers);

          mark_deposito.on("click", function () {
            map1.setView(data.coord, 16);
            selectedDestination = data.coord;
            var popupContent = `
            <div style="padding: 0px" class="container-fluid text-center mx-auto">
              <h4>${data.titulo}</h4>
              <img src="/${data.imagen_ruta}" alt="Imagen" style="width: 100%; height: auto;">
              <p style="margin-top: 5px;">  <i class="fa fa-map-marker"></i> ${data.direccion}</p>
              <button class="btn btn-success btn-sm" onclick="generateRoute()">¿Como llegar?</button>
            </div>
        `;
            mark_deposito.bindPopup(popupContent).openPopup();
          });
          depositoMarkers.addTo(map1);
        }
        if (data.titulo == "Puesto Policial") {
          var mark_seguridad = L.marker(data.coord, {
            icon: seguridadIcon,
          }).addTo(seguridadMarkers);

          mark_seguridad.on("click", function () {
            map1.setView(data.coord, 16);
            var popupContent = `
            <div style="padding: 0px" class="container-fluid text-center mx-auto">
              <h4>${data.titulo}</h4>
              <img src="/${data.imagen_ruta}" alt="Imagen" style="width: 100%; height: auto;">
              <p style="margin-top: 5px;">  <i class="fa fa-map-marker"></i> ${data.direccion}</p>
              <button class="btn btn-success btn-sm" onclick="generateRoute()">¿Como llegar?</button>
            </div>
        `;
            mark_seguridad.bindPopup(popupContent).openPopup();
            selectedDestination = data.coord;
          });
          seguridadMarkers.addTo(map1);
        }
        if (data.titulo == "Paso Peatonal") {
          var mark_paso = L.marker(data.coord, { icon: pasoIcon }).addTo(
            pasoMarkers
          );
          mark_paso.on("click", function () {
            map1.setView(data.coord, 16);
            var popupContent = `
            <div style="padding: 0px" class="container-fluid text-center mx-auto">
              <h4>${data.titulo}</h4>
              <img src="/${data.imagen_ruta}" alt="Imagen" style="width: 100%; height: auto;">
              <p style="margin-top: 5px;">  <i class="fa fa-map-marker"></i> ${data.direccion}</p>
              <button class="btn btn-success btn-sm" onclick="generateRoute()">¿Como llegar?</button>
            </div>
        `;
            mark_paso.bindPopup(popupContent).openPopup();
            selectedDestination = data.coord;
          });

          pasoMarkers.addTo(map1);
        }
      });
      var overlayMaps = {
        '<i class="fa fa-plus-square fa-lg salud-icon"></i> Puestos de Salud':
          saludMarkers,
        "Puestos de policia": seguridadMarkers,
        '<i class="fa fa-dumpster fa-lg deposito-icon"></i>  Depositos de basura':
          depositoMarkers,
        '<i class="fa fa-walking fa-lg paso-icon"></i> Paso peatonal':
          pasoMarkers,
      };

      L.control.layers(null, overlayMaps, { collapsed: false, position: 'bottomright' }).addTo(map1);
    })
    .catch((error) => console.error("Error:", error));
});

function generateRoute() {
  map1.closePopup();
  if (!userLocation || !selectedDestination) {
    alert("Usuario o destino no encontrados");
    return;
  }
  if (routingControl) {
    map1.removeControl(routingControl);
  }
  routingControl = L.Routing.control({
    waypoints: [userLocation, selectedDestination],
    router: L.Routing.graphHopper("0269abc3-031c-448e-95c7-3db60aaa6dc0", {
      urlParameters: {
        vehicle: "foot",
        locale: "es",
      },
    }),
    routeWhileDragging: true,
    position: "bottomleft"
  }).addTo(map1);
}