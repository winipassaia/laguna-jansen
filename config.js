/* =========================================================
   CONFIGURAÇÃO DO SITE — é só editar este arquivo.
   Depois de salvar, recarregue a página no navegador.
   Texto vai entre aspas. Listas vão entre [ ] separadas por vírgula.
   ========================================================= */

window.SITE_CONFIG = {

  /* Endereço do site depois de publicado.
     É usado para gerar o QR code (página qr.html e seção "Sobre o projeto"). */
  siteUrl: "https://winipassaia.github.io/laguna-jansen/",

  /* Dados do projeto escolar. O que ficar vazio não aparece no site. */
  projeto: {
    feira: "Feira de Ciências Maktub",
    escola: "",            // nome completo da escola
    turma: "",             // ex.: "2º ano B"
    orientador: "",        // professor(a) orientador(a)
    integrantes: [
      // "Nome Completo da Pessoa 1",
      // "Nome Completo da Pessoa 2",
    ],
  },

  /* Webchat da Zenvia (assistente com IA para tirar dúvidas).
     O chat aparece DENTRO da caixa da seção "Dúvidas" (modo "room" do Web Chat).
     O balão no canto da tela leva até essa caixa.
     1. No painel da Zenvia, crie o canal Web Chat ligado ao seu chatbot.
     2. Copie o ID do Web Chat e cole em "id".
     3. Troque "ativo" para true.
     Enquanto o chat estiver desligado (ou sem internet), a caixa mostra
     "respostas rápidas" com as perguntas frequentes do site. */
  webchat: {
    ativo: false,
    id: "",
    script: "https://static.zenvia.com/embed/js/zenvia-chat.min.js",
  },
};
