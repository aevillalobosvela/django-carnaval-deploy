
var map5 = L.map("map5", {
  center: [-17.964138034171146, -67.10734251787665],
  zoom: 14,
  maxZoom: 18,
  minZoom: 14,
});

// Agregar tile layer mapa base desde openstreetmap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map5);
// Definir ubicaciones con detalles adicionales

document.addEventListener("DOMContentLoaded", function () {


  const modalForo = document.getElementById('modalForo');
  const modalF = new bootstrap.Modal(modalForo);
  const btnFlotanteForo = document.getElementById('modalForoBtn');
  const ocultarModalForo = localStorage.getItem('ocultarModalForo');

  if (!ocultarModalForo) {
    modalF.show();
  } else {
    btnFlotanteForo.style.display = 'block';
  }

  // Guardar preferencia si se marcó el checkbox
  document.getElementById('cerrarmodalForoBtn').addEventListener('click', function () {
    const checkForo = document.getElementById('noMostrarCheckForo');
    if (checkForo.checked) {
      localStorage.setItem('ocultarModalForo', 'true');
    }
  });

  // Reabrir modal con el botón flotante
  btnFlotanteForo.addEventListener('click', () => {
    modalF.show();
  });

  var promedio = 0;
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
        let marker = L.marker(data.coord, { icon: markerIcon }).addTo(map5);

        marker.on("click", function () {
          let container = document.getElementById("location-card-container");
          container.innerHTML = "";

          let collapseElement = document.getElementById('infoPanel');
          let collapse = bootstrap.Collapse.getInstance(collapseElement);
          if (collapse) {
            collapse.hide();
          }
          new bootstrap.Collapse(collapseElement, { show: true });

          let listaComentarios = document.getElementById("lista_comentarios");
          listaComentarios.innerHTML = "";

          let id_punto = document.getElementById("id_punto");
          id_punto.value = data.id;

          let prom_rating = 0;
          fetch("/obtener_comentario/")
            .then((response) => response.json())
            .then((datas) => {
              let comentarios = datas;
              let valores = [];
              promedio = 0;

              comentarios.forEach(function (comen) {
                if (comen.punto_id == data.id) {
                  prom_rating += comen.rating;
                  valores.push(comen.rating);

                  let comentarioLi = document.createElement("li");
                  comentarioLi.classList.add("list-group-item", "comentarios");

                  comentarioLi.innerHTML = `
                    <div class="row" style="height: 25px;">
                      <div class="col-10">
                        <p style="margin: 1px; font-weight: bold;">
                          ${comen.usuario} - ${formatearFecha(comen.fecha_hora)}
                        </p>
                      </div>
                      <div class="col-2" style="text-align: end;">
                        <p style="margin: 1px;"> ${comen.rating} <i class="fa-regular fa-star"></i></p>
                      </div>
                    </div>  
                    <p style="margin: 1px;" class="texto-comentario colapsado">${comen.comentario_user}</p>
                    <a href="#" class="mostrar-mas" style="display: none;">Mostrar más</a>
                  `;

                  listaComentarios.appendChild(comentarioLi);

                  // Verificar si debe mostrar el enlace "Mostrar más"
                  let textoComentario = comentarioLi.querySelector(".texto-comentario");
                  let enlace = comentarioLi.querySelector(".mostrar-mas");

                  const temp = textoComentario.cloneNode(true);
                  temp.style.visibility = "hidden";
                  temp.style.position = "absolute";
                  temp.style.height = "auto";
                  temp.classList.remove("colapsado");
                  document.body.appendChild(temp);

                  const fullHeight = temp.offsetHeight;
                  const collapsedHeight = parseFloat(getComputedStyle(textoComentario).lineHeight) * 4;
                  document.body.removeChild(temp);

                  if (fullHeight > collapsedHeight) {
                    enlace.style.display = "inline";
                    enlace.addEventListener("click", function (e) {
                      e.preventDefault();
                      textoComentario.classList.toggle("colapsado");
                      this.textContent = textoComentario.classList.contains("colapsado")
                        ? "Mostrar más"
                        : "Mostrar menos";
                    });
                  }
                }
              });

              promedio = prom_rating / valores.length;
              let reducido = promedio.toFixed(1);
              showLocationCard(data, reducido);
            });

          document.getElementById("btn_desplegar").style.display = "block";
        });
      });
    });
});


function formatearFecha(fechaISO) {
  var fecha = new Date(fechaISO);
  var opcionesFecha = { year: "numeric", month: "numeric", day: "numeric" };
  var opcionesHora = { hour: "numeric", minute: "numeric" };
  var fechaFormateada =
    fecha.toLocaleDateString("es-ES", opcionesFecha) +
    " " +
    fecha.toLocaleTimeString("es-ES", opcionesHora);
  return fechaFormateada;
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("zoomable")) {
    var lightbox = document.getElementById("lightbox");
    var imgAmpliada = document.getElementById("imgAmpliada");
    imgAmpliada.src = e.target.src;
    lightbox.style.display = "flex";
  }
});

function cerrarLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

function showLocationCard(location, promedio) {
  if (promedio == NaN) {
    promedio = 0;
  }
  var elemento = document.getElementById("formulario");
  if (elemento.style.display === "none") {
    elemento.style.display = "block"; // Muestra el elemento
  }

  let container = document.getElementById("location-card-container");
  container.innerHTML = "";

  let card = document.createElement("div");
  card.className = "location-card";
  if (location.imagen_negocio == null) {
    location.imagen_negocio = location.imagen_ruta
  }
  let cardContent = `
  <div class="card" style="opacity:80%">
    <div class="card-header">
        <h5>${location.name} / ${promedio} <i class="fa-regular fa-star"></i></h5>
    </div>
    <div class="row card-body">
      <div class="col-7 text-center" >
        <img styles="opacity:100%;" src="${location.imagen_negocio}" class="img-thumbnail zoomable" alt="Imagen no disponible" width="100%" height="100%">
        <div id="lightbox" class="lightbox">
          <span class="close" onclick="cerrarLightbox()">&times;</span>
          <img id="imgAmpliada" class="lightbox-content" src="">
        </div>
      </div>
      <div class="col-5" style="max-height: 200px; overflow-y: auto;">
        <p class="p-3" style="color: black; font-size:14px">${location.descripcion}</p>
        <p class="p-3" style="color: black; font-size:14px">${location.detalles}</p>
      </div>
    </div>
  </div>
    `;


  card.innerHTML = cardContent;
  container.appendChild(card);
}

var osm = L.tileLayer(
  "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
).addTo(map5);
var google = L.tileLayer("https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}");
var carto = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
);
