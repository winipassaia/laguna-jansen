# Lagoa da Jansen · São Luís, Maranhão

Projeto simples feito para um amigo, cujo filho fará uma apresentação na **Feira de Ciências Maktub** representando a **Lagoa da Jansen**.

**Site no ar:** https://winipassaia.github.io/lagoa-jasen/

O site reúne a história da lagoa, a ciência por trás dela (laguna, marés, comportas, mangue e eutrofização), os anos de trabalho para recuperá-la, a natureza, o que fazer por lá, a lenda da Serpente, uma galeria de fotos, um mapa com satélite e uma seção de dúvidas com chat.

## O que tem no site

- **Simulador da comporta:** mostra como a maré renova a água da lagoa.
- **Linha do tempo:** do manguezal dos anos 1970 até 2026.
- **A lagoa ao longo do dia:** fotos de manhã, meio-dia, fim de tarde, noite e chuva.
- **Galeria** com 28 fotos de licença livre, filtros e visualização ampliada.
- **Mapa interativo** (Mapa/Satélite) com o contorno da lagoa e os pontos de interesse. Sem internet, usa uma foto de satélite salva no site.
- **Caixa de chat** na seção "Dúvidas", pronta para o webchat da Zenvia, com respostas rápidas quando o chat está desligado.
- **QR code** para o banner da feira (`qr.html`).

## Tecnologia

HTML, CSS e JavaScript puros, sem framework e sem etapa de build. Não tem servidor próprio: o chat roda na Zenvia e as imagens do mapa vêm da Esri. Bibliotecas usadas: [Leaflet](https://leafletjs.com) (mapa) e [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (QR code), ambas salvas no próprio projeto para funcionar offline.

## Abrir o site

- **Online:** https://winipassaia.github.io/lagoa-jasen/
- **No computador:** baixe o projeto (*Code → Download ZIP*), descompacte e dê dois cliques em `index.html`.
- **Sem internet (na feira):** com a pasta no notebook ou pen drive, abra o `index.html`. Fotos, fontes, galeria, simulador e mapa funcionam offline. Só o webchat precisa de internet.
- **Forçar o modo offline do mapa:** se a internet estiver lenta, abra com `?offline` no fim do endereço, por exemplo `index.html?offline`.

## O que editar (config.js)

Abra `config.js` em qualquer editor de texto (Bloco de Notas, VS Code ou direto no GitHub, no ícone de lápis):

- `siteUrl`: o endereço do site. Ele gera o QR code.
- `projeto`: nome da escola, turma, orientador(a) e a lista de integrantes. O que ficar vazio não aparece no site.
- `webchat`: configuração do chat da Zenvia (veja abaixo).

Exemplo de integrantes:

```js
integrantes: [
  "Maria da Silva Souza",
  "João Pedro Almeida",
],
```

## Publicação (GitHub Pages)

O site é publicado pelo GitHub Pages a partir da branch `main` (pasta raiz). Toda alteração enviada para a `main` atualiza o site sozinha, em cerca de 1 minuto.

- **Pelo navegador:** abra o arquivo no GitHub, clique no lápis, edite e confirme em *Commit changes*.
- **Pelo computador:** `git add .`, `git commit -m "mensagem"` e `git push`.

O arquivo `.nojekyll` faz o GitHub servir os arquivos como estão, sem processamento.

## QR code para o banner

Abra `qr.html` (no site: https://winipassaia.github.io/lagoa-jasen/qr.html). Com o `siteUrl` preenchido, o QR aparece sozinho. O botão **Imprimir** gera um cartaz pronto. Teste o QR com o celular antes de imprimir.

O QR code também aparece no site, na seção "Sobre o projeto".

## Webchat da Zenvia

O chat fica **dentro de uma caixa na seção "Dúvidas"**, com as perguntas frequentes logo abaixo. O balão laranja no canto da tela leva até essa caixa.

1. No painel da Zenvia, crie o canal **Web Chat** e ligue ao seu chatbot com IA.
2. Use o arquivo `base-de-conhecimento.md` para alimentar a IA: ele traz instruções de comportamento, perguntas e respostas, a linha do tempo e as fontes.
3. Copie o **ID do Web Chat** e cole em `webchat.id` no `config.js`. Mude `ativo` para `true`.
4. Abra o site e vá até "Dúvidas": o status da caixa muda para **Online** quando o chat carrega.

O site usa o modo `embedded('room')` do Web Chat da Zenvia, que monta o chat dentro de um elemento da página (testado com o robô de demonstração da Zenvia). Se o chat não aparecer em até 12 segundos (ID errado, sem internet), a caixa volta sozinha para as respostas rápidas.

**Respostas rápidas:** enquanto o chat estiver desligado, ou sem internet, a caixa mostra botões com perguntas e responde em balões, usando as perguntas frequentes do site. Para escolher quais perguntas viram botão, acrescente `data-rapida` no `<details>` da pergunta, no `index.html`.

## Pastas

```
index.html                página principal
qr.html                   cartaz com QR code para imprimir
config.js                 configurações (escola, integrantes, webchat, endereço)
base-de-conhecimento.md   conteúdo para a IA do webchat
assets/
  css/style.css           visual do site (cores no topo do arquivo)
  js/main.js              menu, galeria, simulador, horários, chat e QR
  js/mapa.js              mapa interativo
  data/fotos.js           lista de fotos com autor e licença
  data/mapa.js            contorno da lagoa e pontos do mapa
  img/fotos/              fotos em dois tamanhos (-g grande, -p pequena)
  img/mapa-offline.jpg    foto de satélite usada sem internet
  vendor/                 bibliotecas (Leaflet e gerador de QR)
  fonts/fonts.css         fontes embutidas (funcionam offline)
```

## Adicionar fotos

1. Salve a foto duas vezes em `assets/img/fotos/`: `minha-foto-g.jpg` (grande, até 1600 px de largura) e `minha-foto-p.jpg` (pequena, uns 800 px). Se não quiser redimensionar, pode ser o mesmo arquivo com os dois nomes.
2. Em `assets/data/fotos.js`, copie um item da lista e ajuste:

```js
{
  "arquivo": "minha-foto",
  "formato": "jpg",
  "legenda": "Pôr do sol visto da Praça da Lagoa",
  "categoria": "paisagem",
  "largura": 1600, "altura": 1200,
  "autor": "Nome de quem tirou",
  "licenca": "Foto do grupo",
  "licencaUrl": "",
  "fonte": ""
}
```

As categorias são: `paisagem`, `natureza`, `lazer` e `gente`. Fotos que valeria a pena tirar: a Serpente restaurada (a do site é de 2008) e a própria lagoa à noite (a do site é do bairro vizinho).

## Créditos e licenças

- **Fotos:** Wikimedia Commons e Flickr, sob CC BY, CC BY-SA, CC BY-NC ou domínio público, além de uma foto de divulgação do Governo do Maranhão (Praça Aymar Mesquita). Os autores aparecem no fim do site e em `assets/data/fotos.js`. As licenças NC (não comercial) e a foto de divulgação são usadas porque este é um projeto escolar, sem fins lucrativos.
- **Mapa:** Leaflet; ruas e satélite da Esri; contorno da lagoa e pontos do © OpenStreetMap.
- **Fontes:** Bricolage Grotesque e Source Sans 3 (SIL Open Font License).
- **Pesquisa:** as fontes estão na seção "Fontes e créditos" do site e no fim de `base-de-conhecimento.md`.
