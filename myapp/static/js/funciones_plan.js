var userLocation;
var control = null;
var routingControl = null;
let routeLayer = null;
let routeDecorator = null;
var contador = 1
var arreglo_lugares = []
var escogerposicion = null;
var usermarker = null;


var map = L.map("map", {
  center: [-17.964138034171146, -67.10734251787665],
  zoom: 14,
  maxZoom: 18,
  minZoom: 14,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

var osmLayer = new L.TileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

function onLocationFound(e) {
  userLocation = e.latlng;
  usermarker = L.marker(e.latlng)
    .addTo(map)
    .bindPopup("Usted esta aqui")
    .openPopup();
  map.setView(e.latlng, 15);
}

function onLocationError(e) {
  alert(e.message);
}

map.on("locationfound", onLocationFound);
map.on("locationerror", onLocationError);

map.locate({ setView: true, maxZoom: 16 });

document.getElementById("posicionBtn").addEventListener("click", function () {
  escogerposicion = true;
  document.getElementById("aviso-posicion").style.display = "block";
});

document.getElementById("cancelarposicion").addEventListener("click", function () {
  escogerposicion = null;
  document.getElementById("aviso-posicion").style.display = "none";
});

map.on("click", function (e) {
  if (escogerposicion == true) {
    if (usermarker) {
      map.removeLayer(usermarker);
    }
    usermarker = L.marker(e.latlng).addTo(map).bindPopup("Usted esta aqui").openPopup();
    userLocation = e.latlng;
    map.setView(e.latlng, 15);
  }
  escogerposicion = null
  document.getElementById("aviso-posicion").style.display = "none";
});

/* -LUGARES-------------------------------------------------------------------------------------- */

var hotelIcon = L.icon({
  iconUrl: "/static/img/generaruta/hotelito.png",
  iconSize: [40, 40],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const foodIcon = L.icon({
  iconUrl: "/static/img/generaruta/hamburguesa.png",
  iconSize: [40, 40],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const tourismIcon = L.icon({
  iconUrl: "/static/img/generaruta/turir.png",
  iconSize: [40, 40],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const hotelLayer = L.layerGroup();
const foodLayer = L.layerGroup();
const tourismLayer = L.layerGroup();

document.addEventListener("DOMContentLoaded", function () {

  const modalPlan = document.getElementById('modalPlan');
  const modalP = new bootstrap.Modal(modalPlan);
  const btnFlotantePlan = document.getElementById('modalPlanBtn');
  const ocultarModalPlan = localStorage.getItem('ocultarModalPlan');

  if (!ocultarModalPlan) {
    modalP.show();
  } else {
    btnFlotantePlan.style.display = 'block';
  }

  // Guardar preferencia si se marcó el checkbox
  document.getElementById('cerrarmodalPlanBtn').addEventListener('click', function () {
    const checkPlan = document.getElementById('noMostrarCheckPlan');
    if (checkPlan.checked) {
      localStorage.setItem('ocultarModalPlan', 'true');
    }
  });

  // Reabrir modal con el botón flotante
  btnFlotantePlan.addEventListener('click', () => {
    modalP.show();
  });

  fetch("/obtener_punto_planifica/")
    .then((response) => response.json())
    .then((data) => {
      var puntos = data;
      var hotelSelect = document.getElementById("hotelSelect");
      var foodSelect = document.getElementById("foodSelect");
      var tourismSelect = document.getElementById("tourismSelect");
      puntos.forEach(function (data) {
        var option = document.createElement("option");
        option.value = data.coord.join(", ");
        option.text = data.name;
        if (data.titulo == "Hotel") {
          L.marker(data.coord, { icon: hotelIcon })
            .bindPopup(data.name)
            .addTo(hotelLayer);
          hotelSelect.appendChild(option);
        }
        if (data.titulo == "Comida") {
          L.marker(data.coord, { icon: foodIcon })
            .bindPopup(data.name)
            .addTo(foodLayer);
          foodSelect.appendChild(option);
        }
        if (data.titulo == "Turismo") {
          L.marker(data.coord, { icon: tourismIcon })
            .bindPopup(data.name)
            .addTo(tourismLayer);
          tourismSelect.appendChild(option);
        }
      });
      hotelLayer.addTo(map);
      foodLayer.addTo(map);
      tourismLayer.addTo(map);

      var overlayMaps2 = {
        "Hoteles y alojamientos": hotelLayer,
        Restaurantes: foodLayer,
        "Lugares turisticos": tourismLayer,
      };

      L.control.layers(null, overlayMaps2, { collapsed: false, position: "bottomright" }).addTo(map);
    })
    .catch((error) => console.error("Error:", error));
});

function anadirparada() {
  if (arreglo_lugares.length > 3) {
    alert("Maximo de paradas alcanzado")
  } else {
    const textarea = document.getElementById("paradas_lista");
    selecthoteles = document.getElementById("hotelSelect");
    selectfood = document.getElementById("foodSelect");
    selecttourism = document.getElementById("tourismSelect");

    if (selecthoteles.style.display == "block") {
      const texto = selecthoteles.options[selecthoteles.selectedIndex].text;
      const coord = selecthoteles.value;
      arreglo_lugares.push(coord);
      if (textarea.value.trim() !== "") {
        textarea.value += "\n" + contador + ".- " + texto;
        contador += 1;
      } else {
        textarea.value = contador + ".- " + texto;
        contador += 1;
      }
    } else
      if (selectfood.style.display == "block") {
        const texto = selectfood.options[selectfood.selectedIndex].text;
        const coord = selectfood.value;
        arreglo_lugares.push(coord);
        if (textarea.value.trim() !== "") {
          textarea.value += "\n" + contador + ".- " + texto;
          contador += 1;
        } else {
          textarea.value = contador + ".- " + texto;
          contador += 1;
        }
      } else
        if (selecttourism.style.display == "block") {
          const texto = selecttourism.options[selecttourism.selectedIndex].text;
          const coord = selecttourism.value;
          arreglo_lugares.push(coord);
          if (textarea.value.trim() !== "") {
            textarea.value += "\n" + contador + ".- " + texto;
            contador += 1;
          } else {
            textarea.value = contador + ".- " + texto;
            contador += 1;
          }
        }
    document.getElementById("eliminar_parada").style.display = "flex";
  }
}


function mostrarElemento(selectedId, Id1, Id2) {
  document.getElementById(selectedId).style.display = "block";
  document.getElementById(Id1).style.display = "none";
  document.getElementById(Id2).style.display = "none";
  document.getElementById("anadir_parada").style.display = "flex";
}

function vaciarparada() {
  arreglo_lugares = [];
  const textarea = document.getElementById("paradas_lista");
  textarea.value = "";
  document.getElementById("eliminar_parada").style.display = "none";
  contador = 1;
  if (routingControl) {
    map.removeControl(routingControl);
  }

  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  if (routeDecorator) {
    map.removeLayer(routeDecorator);
    routeDecorator = null;
  }
}


// Generar ruta
document.getElementById("generateRoute").addEventListener("click", function () {
  if (routingControl) {
    map.removeControl(routingControl);
  }

  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  if (routeDecorator) {
    map.removeLayer(routeDecorator);
    routeDecorator = null;
  }

  control = null;

  const waypoints = [L.latLng(userLocation)];
  const marcadores = [];

  arreglo_lugares.forEach((coordenadaTexto, index) => {
    const partes = coordenadaTexto.split(",");
    const lat = parseFloat(partes[0].trim());
    const lng = parseFloat(partes[1].trim());
    const latlng = L.latLng(lat, lng);

    waypoints.push(latlng);

    const icono = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });

    const marcador = L.marker(latlng, {
      icon: icono
    }).bindPopup(`Punto ${index + 1}`);

    marcadores.push(marcador);
  });

  if (waypoints.length < 2) {
    alert("Paradas no seleccionadas");
  } else {
    routeLayer = L.layerGroup(marcadores).addTo(map);

    routingControl = L.Routing.control({
      waypoints: waypoints,
      router: L.Routing.graphHopper("0269abc3-031c-448e-95c7-3db60aaa6dc0", {
        urlParameters: {
          vehicle: "car",
          locale: "es"
        }
      }),
      show: true,
      showMarkers: false,
      position: "bottomleft",
      routeWhileDragging: false,
      lineOptions: {
        styles: [
          {
            color: "#0074D9",
            opacity: 0.8,
            weight: 3
          }
        ]
      }
    }).addTo(map);

    routingControl.on('routesfound', function (e) {
      const route = e.routes[0];
      const lineCoords = route.coordinates;

      routeDecorator = L.polylineDecorator(lineCoords, {
        patterns: [
          {
            offset: 0,
            repeat: 50,
            symbol: L.Symbol.arrowHead({
              pixelSize: 10,
              polygon: false,
              pathOptions: { stroke: true, color: 'blue', weight: 2 }
            })
          }
        ]
      });

      routeDecorator.addTo(map);
    });
  }
});


// Generar ruta a pie
document.getElementById("generateRoutePie").addEventListener("click", function () {
  if (routingControl) {
    map.removeControl(routingControl);
  }

  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  if (routeDecorator) {
    map.removeLayer(routeDecorator);
    routeDecorator = null;
  }

  control = null;

  const waypoints = [L.latLng(userLocation)];
  const marcadores = [];

  arreglo_lugares.forEach((coordenadaTexto, index) => {
    const partes = coordenadaTexto.split(",");
    const lat = parseFloat(partes[0].trim());
    const lng = parseFloat(partes[1].trim());
    const latlng = L.latLng(lat, lng);

    waypoints.push(latlng);

    const icono = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });

    const marcador = L.marker(latlng, {
      icon: icono
    }).bindPopup(`Punto ${index + 1}`);

    marcadores.push(marcador);
  });

  if (waypoints.length < 2) {
    alert("Paradas no seleccionadas");
  } else {
    routeLayer = L.layerGroup(marcadores).addTo(map);

    routingControl = L.Routing.control({
      waypoints: waypoints,
      router: L.Routing.graphHopper("0269abc3-031c-448e-95c7-3db60aaa6dc0", {
        urlParameters: {
          vehicle: "foot",
          locale: "es"
        }
      }),
      show: true,
      showMarkers: false,
      position: "bottomleft",
      routeWhileDragging: false,
      lineOptions: {
        styles: [
          {
            color: "#0074D9",
            opacity: 0.8,
            weight: 3
          }
        ]
      }
    }).addTo(map);

    routingControl.on('routesfound', function (e) {
      const route = e.routes[0];
      const lineCoords = route.coordinates;

      routeDecorator = L.polylineDecorator(lineCoords, {
        patterns: [
          {
            offset: 0,
            repeat: 50,
            symbol: L.Symbol.arrowHead({
              pixelSize: 10,
              polygon: false,
              pathOptions: { stroke: true, color: 'red', weight: 2 }
            })
          }
        ]
      });

      routeDecorator.addTo(map);
    });
  }
});


// Crear instancias de capas de mapa adicionales
var google = L.tileLayer("https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}");
var opentopomap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
);
var carto = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
);

// Función para generar una ruta aleatoria
function generateRandomRoute() {
  if (routingControl) {
    map.removeControl(routingControl);
  }

  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  if (routeDecorator) {
    map.removeLayer(routeDecorator);
    routeDecorator = null;
  }

  var hotels = [];
  var food = [];
  var tourism = [];

  fetch("/obtener_punto_planifica/")
    .then((response) => response.json())
    .then((data) => {
      var puntoss = data;
      puntoss.forEach(function (data) {
        if (data.titulo == "Hotel") {
          hotels.push(data);
        }
        if (data.titulo == "Comida") {
          food.push(data);
        }
        if (data.titulo == "Turismo") {
          tourism.push(data);
        }
      });

      const randomHotel = hotels[Math.floor(Math.random() * hotels.length)];
      const randomFood = food[Math.floor(Math.random() * food.length)];
      const randomTourism = tourism[Math.floor(Math.random() * tourism.length)];
      var coordHotel = {
        lat: randomHotel.coord[0],
        lng: randomHotel.coord[1],
      };
      var coordFood = {
        lat: randomFood.coord[0],
        lng: randomFood.coord[1],
      };
      var coordTourism = {
        lat: randomTourism.coord[0],
        lng: randomTourism.coord[1],
      };
      const waypoints = [
        L.latLng(userLocation),
        L.latLng(coordHotel),
        L.latLng(coordFood),
        L.latLng(coordTourism),
      ];

      routingControl = L.Routing.control({
        waypoints: waypoints,
        router: L.Routing.graphHopper("0269abc3-031c-448e-95c7-3db60aaa6dc0", {
          urlParameters: {
            vehicle: "car",
            locale: "es", // Opcional: ajusta el idioma de las instrucciones de la ruta
          },
        }),
        show: true, // Oculta la ruta por defecto
        position: "bottomleft",
        showMarkers: false, // Oculta los marcadores
        routeWhileDragging: false,
      }).addTo(map);

      routingControl.on('routesfound', function (e) {
        const route = e.routes[0];
        const lineCoords = route.coordinates;

        routeDecorator = L.polylineDecorator(lineCoords, {
          patterns: [
            {
              offset: 0,
              repeat: 50,
              symbol: L.Symbol.arrowHead({
                pixelSize: 10,
                polygon: false,
                pathOptions: { stroke: true, color: 'black', weight: 2 }
              })
            }
          ]
        });

        routeDecorator.addTo(map);
      });

      displayRecommendation(
        randomHotel,
        randomFood,
        randomTourism,
        coordHotel,
        coordFood,
        coordTourism
      );
    });
}

// Función para mostrar la recomendación
function displayRecommendation(
  hotel,
  food,
  tourism,
  coordhotel,
  coordfood,
  coordtour
) {
  const recommendationDiv = document.getElementById("recommendation");
  recommendationDiv.innerHTML = `
    <div class="card mx-auto"  style="width: 100%;">
      <div class="card-body">
          <h5 class="card-title">Recomendación de Ruta</h5>
          <h6 class="card-subtitle mb-2 text-muted">Ruta sugerida</h6>
          <p class="card-text"><strong>Hotel:</strong> ${hotel.name}</p>
          <p class="card-text"><strong>Restaurante:</strong> ${food.name}</p>
          <p class="card-text"><strong>Lugar Turístico:</strong> ${tourism.name}</p>
          <a href="#" class="card-link" onclick="goToLocation(${coordhotel.lat}, ${coordhotel.lng})">Ir al Hotel</a>
          <a href="#" class="card-link" onclick="goToLocation(${coordfood.lat}, ${coordfood.lon})">Ir al Restaurante</a>
          <a href="#" class="card-link" onclick="goToLocation(${coordtour.lat}, ${coordtour.lon})">Ir al Lugar Turístico</a>
        </div>
      </div>
  `;
}

// Función para centrar el mapa en la ubicación seleccionada
function goToLocation(lat, lon) {
  map.setView([lat, lon], 16);
}
