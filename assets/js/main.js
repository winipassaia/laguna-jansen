/* Lagoa da Jansen · comportamento do site (sem dependências) */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var cfg = window.SITE_CONFIG || {};
  var projeto = cfg.projeto || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Dados do projeto (config.js) ---------- */
  $$('[data-config]').forEach(function (el) {
    var valor = (projeto[el.dataset.config] || '').trim();
    if (!valor) { if (el.dataset.config !== 'feira') el.hidden = true; return; }
    el.textContent = (el.dataset.prefixo || '') + valor;
  });

  var ficha = $('#ficha-projeto');
  if (ficha) {
    var linhas = [['Escola', projeto.escola], ['Turma', projeto.turma], ['Orientação', projeto.orientador]];
    linhas.forEach(function (l) {
      if (!l[1] || !String(l[1]).trim()) return;
      var div = document.createElement('div');
      div.innerHTML = '<dt></dt><dd></dd>';
      div.firstChild.textContent = l[0];
      div.lastChild.textContent = l[1];
      ficha.appendChild(div);
    });
    var nomes = (projeto.integrantes || []).filter(function (n) { return n && String(n).trim(); });
    if (nomes.length) {
      var div = document.createElement('div');
      div.innerHTML = '<dt>Integrantes</dt><dd><ul></ul></dd>';
      var ul = div.querySelector('ul');
      nomes.forEach(function (n) { var li = document.createElement('li'); li.textContent = n; ul.appendChild(li); });
      ficha.appendChild(div);
    }
    if (!ficha.children.length) ficha.hidden = true;
  }

  /* ---------- QR code (aparece quando o site tem endereço) ---------- */
  var urlSite = (cfg.siteUrl || '').trim();
  if (!urlSite && /^https?:/.test(location.protocol)) urlSite = location.origin + location.pathname.replace(/index\.html$/, '');
  if (urlSite && window.qrcode && $('#qr-codigo')) {
    try {
      var qr = window.qrcode(0, 'M');
      qr.addData(urlSite);
      qr.make();
      $('#qr-codigo').innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
      $('#qr-caixa').hidden = false;
    } catch (e) { console.warn('QR code não gerado:', e); }
  }

  /* ---------- Caixa de chat: respostas rápidas + webchat Zenvia ---------- */
  var chat = cfg.webchat || {};
  var caixaChat = $('#chat-caixa');
  var corpoChat = $('#chat-zenvia');
  var localChat = $('#chat-local');
  var statusChat = $('#chat-status');
  var tempoChat = $('#chat-tempo');
  var mensagens = $('#chat-mensagens');
  var sugestoes = $('#chat-sugestoes');

  function falar(texto, quem) {
    var p = document.createElement('p');
    p.className = 'balao balao-' + quem;
    p.textContent = texto;
    mensagens.appendChild(p);
    mensagens.scrollTop = mensagens.scrollHeight;
  }

  // Respostas rápidas: usam as perguntas frequentes marcadas com data-rapida no index.html.
  if (sugestoes && mensagens) {
    $$('.faq details[data-rapida]').forEach(function (d) {
      var pergunta = $('summary', d).textContent.trim();
      var resposta = $('p', d).textContent.trim();
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = pergunta;
      b.addEventListener('click', function () {
        falar(pergunta, 'usuario');
        b.disabled = true;
        setTimeout(function () { falar(resposta, 'bot'); }, 400);
      });
      sugestoes.appendChild(b);
    });
    var verTodas = document.createElement('a');
    verTodas.href = '#t-faq';
    verTodas.className = 'chip chip-link';
    verTodas.textContent = 'Ver todas as perguntas ↓';
    sugestoes.appendChild(verTodas);
  }

  // Webchat Zenvia dentro da caixa (modo "room" do Web Chat).
  if (chat.ativo && chat.id && corpoChat && navigator.onLine !== false) {
    statusChat.textContent = 'Conectando…';
    var sala = document.createElement('div');
    sala.id = 'chat-zenvia-sala';
    sala.className = 'chat-sala';
    corpoChat.appendChild(sala);
    var voltarAoLocal = function (motivo) {
      sala.remove();
      localChat.hidden = false;
      statusChat.textContent = 'Respostas rápidas';
      if (tempoChat) tempoChat.hidden = true;
      if (motivo) console.warn('Webchat Zenvia:', motivo);
    };
    // A Zenvia monta o chat dentro de um "shadow DOM" da sala. Só escondemos as
    // respostas rápidas quando o chat realmente aparece (até 12 segundos).
    var esperarChat = function () {
      var tentativas = 0;
      var vigia = setInterval(function () {
        var raiz = sala.shadowRoot;
        if (raiz && raiz.querySelector('iframe')) {
          clearInterval(vigia);
          // Esconde a barra de topo da Zenvia (com o "X"): a caixa já tem o próprio cabeçalho.
          var css = document.createElement('style');
          css.textContent = '.znv-chat-header{display:none!important}';
          raiz.appendChild(css);
          localChat.hidden = true;
          statusChat.textContent = 'Online';
          if (tempoChat) tempoChat.hidden = false;
          caixaChat.classList.add('com-zenvia');
        } else if (++tentativas > 40) {
          clearInterval(vigia);
          voltarAoLocal('o chat não apareceu. Confira o ID no config.js.');
        }
      }, 300);
    };
    var sz = document.createElement('script');
    sz.src = chat.script || 'https://static.zenvia.com/embed/js/zenvia-chat.min.js';
    sz.async = true;
    sz.onload = function () {
      try {
        new window.ZenviaChat(chat.id).embedded('room').build('chat-zenvia-sala');
        esperarChat();
      } catch (e) { voltarAoLocal(e); }
    };
    sz.onerror = function () { voltarAoLocal('não foi possível carregar o script.'); };
    document.body.appendChild(sz);
  }

  // Balão no canto: leva até a caixa do chat. Some na capa e quando a caixa já está na tela.
  var balao = $('#balao-chat');
  if (balao && caixaChat) {
    var semAnimacao = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    balao.addEventListener('click', function (e) {
      e.preventDefault();
      caixaChat.scrollIntoView({ behavior: semAnimacao ? 'auto' : 'smooth', block: 'center' });
      caixaChat.classList.remove('destacar');
      void caixaChat.offsetWidth;
      caixaChat.classList.add('destacar');
      setTimeout(function () { caixaChat.focus({ preventScroll: true }); }, semAnimacao ? 0 : 600);
    });
    if ('IntersectionObserver' in window) {
      var naCapa = true, caixaNaTela = false;
      var atualizarBalao = function () { balao.classList.toggle('visivel', !naCapa && !caixaNaTela); };
      new IntersectionObserver(function (en) { naCapa = en[0].isIntersecting; atualizarBalao(); }).observe($('#inicio'));
      new IntersectionObserver(function (en) { caixaNaTela = en[0].isIntersecting; atualizarBalao(); }, { threshold: 0.3 }).observe(caixaChat);
    } else {
      balao.classList.add('visivel');
    }
  }

  /* ---------- Menu ---------- */
  var botaoMenu = $('.botao-menu');
  var menu = $('#menu');
  function fecharMenu() { menu.classList.remove('aberto'); botaoMenu.setAttribute('aria-expanded', 'false'); }
  botaoMenu.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    botaoMenu.setAttribute('aria-expanded', String(aberto));
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') fecharMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('aberto')) { fecharMenu(); botaoMenu.focus(); } });
  document.addEventListener('click', function (e) { if (menu.classList.contains('aberto') && !e.target.closest('.cabecalho')) fecharMenu(); });

  /* ---------- Cabeçalho sólido fora da capa + item ativo do menu ---------- */
  var cabecalho = $('#cabecalho');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      cabecalho.classList.toggle('solido', !entradas[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe($('#inicio'));

    var links = $$('.menu a');
    var porId = {};
    links.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
    var mapaSecoes = { cuidados: 'ciencia', serpente: 'passeio', projeto: 'duvidas', fontes: 'duvidas' };
    var obsSecoes = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = mapaSecoes[en.target.id] || en.target.id;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (porId[id]) porId[id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (sec) { obsSecoes.observe(sec); });
  } else {
    cabecalho.classList.add('solido');
  }

  /* ---------- Simulador da comporta ---------- */
  var sim = $('#simulador');
  if (sim) {
    var textos = {
      fechada: {
        mare: 'Maré baixa', lagoa: 'Pouco oxigênio',
        legenda: 'Com a comporta fechada, a lagoa segura o seu nível de água, mas a água fica parada. Sem renovação, o oxigênio cai e a sujeira se acumula.'
      },
      aberta: {
        mare: 'Maré alta', lagoa: 'Mais oxigênio',
        legenda: 'Na maré alta, o mar fica mais alto que a lagoa. Com a comporta aberta, a água salgada entra pelo canal, mistura, renova e leva oxigênio para peixes e mangue.'
      }
    };
    $$('[data-estado]', sim).forEach(function (b) {
      if (b === sim) return;
      b.addEventListener('click', function () {
        var estado = b.dataset.estado;
        sim.dataset.estado = estado;
        $$('.simulador-controles button', sim).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        $('.sim-mare', sim).textContent = textos[estado].mare;
        $('.sim-estado-lagoa', sim).textContent = textos[estado].lagoa;
        $('#sim-legenda').textContent = textos[estado].legenda;
      });
    });
    sim.dataset.estado = 'fechada';
  }

  /* ---------- A lagoa ao longo do dia ---------- */
  var momentos = $('#momentos');
  if (momentos) {
    var abas = $$('[role="tab"]', momentos);
    var imgMomento = $('#momento-img');
    var timer = null;
    function escolher(b, focar) {
      abas.forEach(function (x) {
        var sel = x === b;
        x.setAttribute('aria-selected', String(sel));
        x.tabIndex = sel ? 0 : -1;
      });
      if (focar) b.focus();
      var novo = 'assets/img/fotos/' + b.dataset.img + '-g.webp';
      imgMomento.classList.add('trocando');
      clearTimeout(timer);
      timer = setTimeout(function () {
        var pre = new Image();
        pre.onload = pre.onerror = function () {
          imgMomento.src = novo; imgMomento.alt = b.dataset.alt;
          imgMomento.classList.remove('trocando');
        };
        pre.src = novo;
      }, 180);
      $('#momento-titulo').textContent = b.dataset.titulo;
      $('#momento-texto').textContent = b.dataset.texto;
      $('#momento-credito').textContent = b.dataset.credito;
    }
    abas.forEach(function (b, i) {
      b.tabIndex = i === 0 ? 0 : -1;
      b.addEventListener('click', function () { escolher(b); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        escolher(abas[(i + d + abas.length) % abas.length], true);
      });
    });
  }

  /* ---------- Galeria + visor ---------- */
  var fotos = window.LAGOA_FOTOS || [];
  var grade = $('#grade-galeria');
  var largas = ['capa-por-do-sol', 'por-do-sol-panoramico', 'vista-geral'];
  var visiveis = fotos.slice();
  var atual = 0;

  function caminho(f, tam) { return 'assets/img/fotos/' + f.arquivo + '-' + tam + '.' + (f.formato || 'webp'); }
  function credito(f) { return 'Foto: ' + f.autor + ' · ' + (f.licenca === 'Public domain' ? 'domínio público' : f.licenca); }

  function montarGaleria(filtro) {
    if (!grade) return;
    grade.innerHTML = '';
    visiveis = fotos.filter(function (f) { return filtro === 'todas' || f.categoria === filtro; });
    visiveis.forEach(function (f, i) {
      var li = document.createElement('li');
      if (filtro === 'todas' && largas.indexOf(f.arquivo) > -1) li.className = 'largo';
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ampliar foto: ' + f.legenda);
      var img = document.createElement('img');
      img.src = caminho(f, 'p'); img.alt = f.legenda; img.loading = 'lazy'; img.decoding = 'async';
      img.width = 800; img.height = Math.round(800 * f.altura / f.largura);
      var sp = document.createElement('span'); sp.textContent = f.legenda;
      b.appendChild(img); b.appendChild(sp);
      b.addEventListener('click', function () { abrirVisor(i); });
      li.appendChild(b);
      grade.appendChild(li);
    });
  }

  $$('.filtros button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.filtros button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      montarGaleria(b.dataset.filtro);
    });
  });
  montarGaleria('todas');

  var visor = $('#visor');
  function mostrar(i) {
    atual = (i + visiveis.length) % visiveis.length;
    var f = visiveis[atual];
    var img = $('#visor-img');
    img.src = caminho(f, 'g'); img.alt = f.legenda;
    $('#visor-legenda').textContent = f.legenda;
    $('#visor-credito').textContent = credito(f);
  }
  function abrirVisor(i) {
    mostrar(i);
    if (visor.showModal) visor.showModal(); else visor.setAttribute('open', '');
  }
  if (visor) {
    $('.visor-fechar', visor).addEventListener('click', function () { visor.close(); });
    $('.visor-ant', visor).addEventListener('click', function () { mostrar(atual - 1); });
    $('.visor-prox', visor).addEventListener('click', function () { mostrar(atual + 1); });
    visor.addEventListener('click', function (e) { if (e.target === visor || e.target.tagName === 'FIGURE') visor.close(); });
    visor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') mostrar(atual - 1);
      if (e.key === 'ArrowRight') mostrar(atual + 1);
    });
    var toqueX = null;
    visor.addEventListener('touchstart', function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener('touchend', function (e) {
      if (toqueX === null) return;
      var dx = e.changedTouches[0].clientX - toqueX;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
      toqueX = null;
    });
  }

  /* ---------- Créditos das fotos ---------- */
  var listaCreditos = $('#creditos-fotos');
  if (listaCreditos) {
    fotos.forEach(function (f) {
      var li = document.createElement('li');
      var a = document.createElement('a'); a.href = f.fonte; a.textContent = f.legenda;
      li.appendChild(a);
      li.appendChild(document.createTextNode(' — ' + f.autor + ', '));
      if (f.licencaUrl) {
        var l = document.createElement('a'); l.href = f.licencaUrl; l.textContent = f.licenca; li.appendChild(l);
      } else {
        li.appendChild(document.createTextNode(f.licenca === 'Public domain' ? 'domínio público' : f.licenca));
      }
      listaCreditos.appendChild(li);
    });
  }

  /* ---------- Aparecer ao rolar ---------- */
  var alvos = $$('.secao h2, .numeros > div, .linha-tempo li, .simulador, .cartao, .cadeia li, .indicador, .especie, .atracao, .momentos, .foto-moldura, .mapa-area, .faq');
  var serpente = $('.serpente-arte');
  if ('IntersectionObserver' in window) {
    alvos.forEach(function (el) { el.classList.add('revelar'); });
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    alvos.forEach(function (el) { obs.observe(el); });
    if (serpente) obs.observe(serpente);
  } else if (serpente) {
    serpente.classList.add('visivel');
  }
})();
