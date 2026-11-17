/* Lagoa da Jansen · mapa interativo (Leaflet)
   - "Mapa": ruas (Esri World Street Map, sem chave de API)
   - "Satélite": imagens Esri
   - Sem internet: usa a foto de satélite salva em assets/img/mapa-offline.jpg */
(function () {
  'use strict';
  var dados = window.LAGOA_MAPA;
  var el = document.getElementById('mapa');
  if (!el || !dados) return;
  if (!window.L) { el.innerHTML = '<p style="padding:1rem">Não foi possível carregar o mapa.</p>'; return; }

  var L = window.L;
  var mapa = L.map(el, {
    center: dados.centro,
    zoom: dados.zoom,
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile,
    tap: false,
    attributionControl: true
  });
  // No celular, o arrasto só liga depois do primeiro toque, para não prender a rolagem da página.
  if (L.Browser.mobile) mapa.once('click', function () { mapa.dragging.enable(); });
  mapa.on('focus', function () { mapa.scrollWheelZoom.enable(); });
  mapa.on('blur', function () { mapa.scrollWheelZoom.disable(); });

  var camadas = {
    mapa: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, maxNativeZoom: 18,
      attribution: 'Mapa &copy; Esri, HERE, Garmin, &copy; colaboradores do <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
    satelite: L.layerGroup([
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, maxNativeZoom: 18,
        attribution: 'Imagens &copy; Esri, Maxar, Earthstar Geographics'
      }),
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, maxNativeZoom: 18, opacity: .9
      })
    ]),
    offline: L.imageOverlay(dados.offline.imagem, dados.offline.limites, {
      attribution: 'Imagem salva: Esri, Maxar, Earthstar Geographics'
    })
  };

  var aviso = document.getElementById('mapa-aviso');
  var botoes = Array.prototype.slice.call(document.querySelectorAll('.mapa-trocar button'));
  // Abra o site com "?offline" no fim do endereço para forçar o modo sem internet (útil na feira).
  var forcarOffline = /[?&]offline/.test(location.search);
  var semInternet = forcarOffline || navigator.onLine === false;
  var ativa = null;

  function usar(nome) {
    if (semInternet) nome = 'offline';
    if (ativa) mapa.removeLayer(camadas[ativa]);
    camadas[nome].addTo(mapa);
    if (camadas[nome].bringToBack) camadas[nome].bringToBack();
    ativa = nome;
    aviso.hidden = nome !== 'offline';
    botoes.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.camada === nome || (nome === 'offline' && b.dataset.camada === 'satelite')));
    });
  }

  // Se os blocos do mapa falharem várias vezes sem nenhum carregar, passa para o modo sem internet.
  var erros = 0, carregou = false;
  function vigiar(camada) {
    camada.on('tileload', function () { carregou = true; });
    camada.on('tileerror', function () {
      erros++;
      if (!carregou && erros >= 4 && !semInternet) { semInternet = true; usar('offline'); }
    });
  }
  vigiar(camadas.mapa);
  camadas.satelite.eachLayer(vigiar);

  botoes.forEach(function (b) {
    b.addEventListener('click', function () {
      if (semInternet) return;
      usar(b.dataset.camada);
    });
  });
  window.addEventListener('online', function () { if (forcarOffline) return; semInternet = false; erros = 0; usar('satelite'); });
  usar('satelite');

  // Contorno da lagoa
  var contorno = L.polygon(dados.contorno, {
    color: '#f6a23c', weight: 2.5, dashArray: '6 6', fillColor: '#f6a23c', fillOpacity: .06, interactive: false
  }).addTo(mapa);
  mapa.fitBounds(contorno.getBounds(), { padding: [30, 30] });

  // Pontos de interesse
  var lista = document.getElementById('lista-pontos');
  var marcadores = {};
  dados.pontos.forEach(function (p) {
    var icone = L.divIcon({
      className: '', iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -12],
      html: '<span class="marcador tipo-' + p.tipo + '"></span>'
    });
    var popup = document.createElement('div');
    var titulo = document.createElement('strong'); titulo.textContent = p.nome;
    popup.appendChild(titulo); popup.appendChild(document.createTextNode(p.texto));
    var m = L.marker(p.pos, { icon: icone, title: p.nome, alt: p.nome, keyboard: true }).bindPopup(popup).addTo(mapa);
    marcadores[p.id] = m;

    if (lista) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="ponto-cor tipo-' + p.tipo + '" aria-hidden="true"></span>';
      b.appendChild(document.createTextNode(p.nome));
      b.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 959px)').matches) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mapa.flyTo(p.pos, 17, { duration: .8 });
        mapa.once('moveend', function () { m.openPopup(); });
      });
      li.appendChild(b);
      lista.appendChild(li);
    }
  });

  // Links de rota
  var d = dados.destino.join(',');
  var g = document.getElementById('rota-google');
  var w = document.getElementById('rota-waze');
  if (g) g.href = 'https://www.google.com/maps/dir/?api=1&destination=' + d;
  if (w) w.href = 'https://waze.com/ul?ll=' + d + '&navigate=yes';
})();
