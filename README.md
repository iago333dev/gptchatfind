# GPT Chat Find 🧠💬

**GPT Chat Find** é uma aplicação local simples que permite buscar rapidamente por **termos técnicos**, **palavras-chave**, ou **blocos de código** dentro dos seus arquivos `.txt` extraídos do ChatGPT — ideal para desenvolvedores que querem revisitar soluções já discutidas.

---

## 📌 Funcionalidade

- 🔍 Busca rápida por termos nas conversas do ChatGPT
- 🕘 Histórico das últimas buscas realizadas
- 🧭 Navegação entre ocorrências com Next / Previous
- 🎯 Busca direta por trechos como `define view entity`, `BAPI`, `CDS`, `ZCL_`, etc.

---

## 🛠️ Como usar

### 1. Clone o projeto

```bash
git clone https://github.com/seuusuario/gpt-chat-find.git
cd gpt-chat-find
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Adicione os arquivos `.txt`

Crie a pasta `Knowlodge/` na raiz do projeto e adicione dentro dela os `.txt` exportados do ChatGPT:

```
/gpt-chat-find
├── Knowlodge/
│   ├── conversa_1.txt
│   ├── sap_tuning.txt
│   └── cds_views_exemplo.txt
```

> Você pode exportar suas conversas pelo ChatGPT em `.txt` manualmente.

---

### 4. Inicie a aplicação

```bash
npm run dev
```

Ou, se estiver usando Node puro:

```bash
node index.js
```

---

### 5. Acesse pelo navegador

Abra [http://localhost:3000](http://localhost:3000)  
Digite o termo desejado (ex: `BAPI`, `define view`, `SELECT`, `debug`) e pronto!

---

## 📁 Estrutura esperada

```
/gpt-chat-find
├── app.js
├── index.js
├── package.json
├── Knowlodge/
│   ├── conversa1.txt
│   ├── projeto_abap.txt
│   └── cds_inicial.txt
```

---

## 💡 Por que usar?

> "Se eu já resolvi isso antes, por que reinventar a roda?"

Com o GPT Chat Find, você acessa **o conhecimento que já conquistou** com o ChatGPT — mesmo **offline**, sem depender da plataforma.

---

## 📬 Contribuições

Sinta-se livre para enviar melhorias, PRs ou abrir issues com sugestões.

---

## 🧑‍💻 Autor

Desenvolvido por quem esquece o que resolveu ontem, mas sabe onde procurar hoje.
