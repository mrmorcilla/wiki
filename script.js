const chatBox = document.getElementById('chatBox');
const form = document.getElementById('chatForm');
const input = document.getElementById('userInput');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  addMessage(query, 'user');
  input.value = '';

  const typingEl = addTypingIndicator();

  try {
    const directRes = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const directData = await directRes.json();
    removeTypingIndicator(typingEl);

    const messageEl = addMessage(directData.extract, 'bot', true); // Texto con botón copiar
    const extraEl = addMessage('', 'bot'); // Imagen y enlace separado

    fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1&pretty=1`)
      .then(res => res.json())
      .then(data => {
        if (data.Image && data.Image.startsWith('/i/')) {
          const img = document.createElement('img');
          img.src = 'https://duckduckgo.com' + data.Image;
          img.className = 'image-preview';
          img.alt = query;
          extraEl.appendChild(img);
        }

        if (data.Results && data.Results.length > 0) {
          const link = document.createElement('a');
          link.href = data.Results[0].FirstURL;
          link.textContent = 'Enlace externo relacionado';
          link.target = '_blank';
          link.className = 'source-link';
          extraEl.appendChild(link);
        }

        chatBox.scrollTop = chatBox.scrollHeight;
      });

  } catch (error) {
    console.error(error);
    removeTypingIndicator(typingEl);
    addMessage(`Ocurrió un error al consultar Wikipedia.`, 'bot');
  }
});

function addMessage(text, sender, allowCopy = false) {
  const message = document.createElement('div');
  message.className = `message ${sender}`;
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (allowCopy) {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copiar';
    btn.onclick = () => {
      navigator.clipboard.writeText(text);
      btn.textContent = '¡Copiado!';
      setTimeout(() => btn.textContent = 'Copiar', 2000);
    };
    message.appendChild(btn);
  }

  return message;
}

function addTypingIndicator() {
  const typing = document.createElement('div');
  typing.className = 'message bot typing';
  typing.textContent = 'Escribiendo...';
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
  return typing;
}

function removeTypingIndicator(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}
