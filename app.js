const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const pastaKnowlodge = path.join(__dirname, 'Knowlodge');

// app.use(express.static(__dirname));

app.get('/', (req, res) => {
  const historico = req.app.locals.historico || [];

  res.send(`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>GPT Chat Find</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f8;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 80px;
        margin: 0;
      }

      h1 {
        color: #0a3d62;
        font-size: 2em;
        margin-bottom: 30px;
      }

      form {
        display: flex;
        flex-direction: row;
        gap: 10px;
        background-color: #ffffff;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      }

      input[type="text"] {
        padding: 10px 15px;
        border: 1px solid #ccc;
        border-radius: 8px;
        width: 300px;
        font-size: 1em;
        outline: none;
      }

      input[type="text"]:focus {
        border-color: #0a3d62;
      }

      button {
        background-color: #0a3d62;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 1em;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      button:hover {
        background-color: #1e5799;
      }

      #resultado {
        margin-top: 40px;
        width: 80%;
        max-width: 800px;
      }

      .recent-container {
        max-width: 600px;
        margin: 30px auto;
        text-align: left;
      }

      .recent-container h3 {
        font-size: 1em;
        color: #666;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 12px;
      }

      .recent-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .recent-item {
        padding: 6px 14px;
        background: #fff3cd;
        color: #856404;
        border-radius: 16px;
        text-decoration: none;
        font-size: 0.9em;
        border: 1px solid #ffeeba;
        transition: 0.2s;
      }

      .recent-item:hover {
        background: #ffe08a;
      }
    </style>
  </head>
  <body>
    <h1>🔍 GPT Chat Find</h1>

    <form action="/buscar" method="get">
      <input type="text" name="q" placeholder="Digite um termo (ex: CDS, RAP, Fiori)" required>
      <button type="submit">Buscar</button>
    </form>

    <div class="recent-container">
      <h3>📑 Buscas recentes:</h3>
      <div class="recent-list">
        ${
          (req.app.locals.historico || [])
            .map(h => `<a class="recent-item" href="/buscar?q=${encodeURIComponent(h)}">${h}</a>`)
            .join('')
        }
      </div>
    </div>

    <div id="resultado"></div>
  </body>
  </html>
`);

  
});

app.get('/buscar', (req, res) => {
  const termo = req.query.q?.toLowerCase();
  if (!req.app.locals.historico.includes(termo)) {
  req.app.locals.historico.unshift(termo);
  if (req.app.locals.historico.length > 10) {
    req.app.locals.historico.pop(); // Limita a 10 itens
  }
}

  const resultados = [];

  if (!termo) {
    return res.send(`<h2>⚠️ Nenhum termo de busca informado.</h2><a href="/">Voltar</a>`);
  }

  if (!fs.existsSync(pastaKnowlodge)) {
    return res.send(`<h2>❌ A pasta 'Knowlodge/' não foi encontrada.</h2>
      <p>Crie a pasta: <code>${pastaKnowlodge}</code> e adicione seus arquivos .txt.</p>
      <a href="/">Voltar</a>`);
  }

  const arquivos = fs.readdirSync(pastaKnowlodge).filter(f => f.endsWith('.txt'));

  arquivos.forEach(file => {
    const conteudo = fs.readFileSync(path.join(pastaKnowlodge, file), 'utf-8');
    if (conteudo.toLowerCase().includes(termo)) {
      const trechos = extrairTrechosChat(conteudo, termo);
      resultados.push({ arquivo: file, trechos });
    }
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Resultados para "${termo}"</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding-top: 80px; }
        .top-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          background-color: #0a3d62;
          padding: 10px 20px;
          color: white;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .top-bar input[type="text"] {
          padding: 8px;
          font-size: 14px;
          border-radius: 6px;
          border: none;
          width: 300px;
        }
        .top-bar button {
          padding: 8px 16px;
          font-size: 14px;
          border: none;
          border-radius: 6px;
          background-color: #ffc107;
          color: #000;
          cursor: pointer;
        }
        .chatbox { margin: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; }
        .you { background-color: #e0f0ff; padding: 10px; margin: 6px 0; border-radius: 8px; color: #003366; }
        .chatgpt { background-color: #fff8dc; padding: 10px; margin: 6px 0; border-radius: 8px; color: #7a4f01; }
        .filename { font-weight: bold; font-size: 1.2em; margin: 30px 20px 10px; }
        pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; }
        mark { background-color: #ffe066; font-weight: bold; transition: background 0.3s, outline 0.3s; }
        mark.active { outline: 2px solid #ff9900; background-color: #fff2b3; }

        #navButtons {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 999;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .nav-btn {
          background-color: #0a3d62;
          color: white;
          padding: 10px 14px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .nav-btn:hover {
          background-color: #1e5799;
        }
      </style>
    </head>
    <body>

    <div class="top-bar">
      <a href="/" style="text-decoration: none; color: white; font-size: 20px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
        🔍 <span style="font-size: 16px;">GPT Chat Find</span>
      </a>
      <form action="/buscar" method="get" style="display: flex; gap: 10px; margin-left: 20px;">
        <input type="text" name="q" placeholder="Buscar outro termo..." value="${termo}" required>
        <button type="submit">Buscar</button>
      </form>
      <div class="recent-searches" style="margin-top: 10px;">
        <span style="color: #ccc; font-size: 14px;">📑 Buscas recentes:</span>
        ${
          (req.app.locals.historico || [])
            .map(h => `<a href="/buscar?q=${encodeURIComponent(h)}" style="margin-right: 10px; color: #ffc107;">${h}</a>`)
            .join('')
        }
      </div>
    </div>

      ${resultados.length === 0 ? `<p style="padding: 20px;">Nenhum resultado encontrado para "${termo}"</p>` : ''}

      ${resultados.map(r => `
        <div class="filename">📄 ${r.arquivo}</div>
        ${r.trechos.map(trecho => {
          const partes = trecho.split(/(?=You said:|ChatGPT said:)/g);
          const blocos = partes.map(parte => {
            let tipo = '';
            if (parte.startsWith("You said:")) tipo = 'you';
            else if (parte.startsWith("ChatGPT said:")) tipo = 'chatgpt';
            const conteudo = parte.replace(/^(You said:|ChatGPT said:)/, '').trim();

            const termoRegex = new RegExp(termo, 'gi');
            const destacado = conteudo.replace(termoRegex, match => `<mark>${match}</mark>`);

            if (tipo) {
              const rotulo = tipo === 'you' ? '💬 Você:' : '🤖 ChatGPT:';
              return `<div class="${tipo}"><strong>${rotulo}</strong><pre>${destacado}</pre></div>`;
            } else {
              return '';
            }
          }).join('');
          return `<div class="chatbox">${blocos}</div>`;
        }).join('')}
      `).join('')}

      <div id="navButtons">
        <button class="nav-btn" onclick="navigateHighlight(-1)">⬆️ Previous</button>
        <button class="nav-btn" onclick="navigateHighlight(1)">⬇️ Next</button>
        <button class="nav-btn" onclick="scrollToTop()">🔝 Topo</button>
      </div>

      <script>
        let highlights = [];
        let currentIndex = -1;

        window.onload = function () {
          highlights = Array.from(document.querySelectorAll('mark'));
          if (highlights.length > 0) {
            currentIndex = 0;
            scrollToHighlight(currentIndex);
          }
        }

        function navigateHighlight(direction) {
          if (highlights.length === 0) return;
          highlights[currentIndex].classList.remove("active");

          currentIndex += direction;
          if (currentIndex >= highlights.length) currentIndex = 0;
          if (currentIndex < 0) currentIndex = highlights.length - 1;

          scrollToHighlight(currentIndex);
        }

        function scrollToHighlight(index) {
          const el = highlights[index];
          el.classList.add("active");
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        function scrollToTop() {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      </script>
    </body>
    </html>
  `);
});

function extrairTrechosChat(texto, termo) {
  const linhas = texto.split('\n');
  const trechos = [];
  let bloco = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (/You said:|ChatGPT said:/i.test(linha)) {
      if (bloco.length > 0) {
        const conteudo = bloco.join('\n').toLowerCase();
        if (conteudo.includes(termo)) {
          trechos.push(bloco.join('\n'));
        }
        bloco = [];
      }
    }
    bloco.push(linha);
  }

  if (bloco.length > 0 && bloco.join('\n').toLowerCase().includes(termo)) {
    trechos.push(bloco.join('\n'));
  }

  return trechos; // ← retorna como array de strings
}

module.exports = app;


