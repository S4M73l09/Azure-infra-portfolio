// ai-bot.js
// Bot estático basado en una base de conocimiento + párrafos reales de README (ES/EN) de tus repos.

// --- Estilos inyectados (para no tocar el <style> del index) ---
(function () {
  const css = `
#ai-chat-bubble{
  position:fixed;
  right:18px;
  bottom:18px;
  width:52px;
  height:52px;
  border-radius:999px;
  background:#2563eb;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:1.4rem;
  cursor:pointer;
  box-shadow:0 10px 25px rgba(15,23,42,.6);
  z-index:50;
}

#ai-chat-window{
  position:fixed;
  right:18px;
  bottom:80px;
  width:320px;
  max-height:420px;
  background:#020617;
  border-radius:16px;
  border:1px solid rgba(148,163,184,.6);
  display:none;
  flex-direction:column;
  overflow:hidden;
  z-index:50;
}

.ai-chat-header{
  padding:8px 10px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  background:#0b1120;
  border-bottom:1px solid rgba(148,163,184,.4);
  font-size:.9rem;
}

#ai-chat-messages{
  padding:8px;
  flex:1;
  overflow-y:auto;
  font-size:.85rem;
}

#ai-chat-messages .msg{
  margin-bottom:6px;
  line-height:1.4;
}

#ai-chat-messages .me{
  text-align:right;
  color:#e5e7eb;
}

#ai-chat-messages .bot{
  text-align:left;
  color:#cbd5f5;
}

#ai-chat-form{
  display:flex;
  gap:4px;
  padding:8px;
  border-top:1px solid rgba(148,163,184,.4);
}

#ai-chat-input{
  flex:1;
  padding:6px 8px;
  border-radius:999px;
  border:1px solid rgba(148,163,184,.7);
  background:#020617;
  color:#e5e7eb;
}

#ai-chat-form button{
  padding:6px 10px;
  border-radius:999px;
  border:none;
  background:#2563eb;
  color:white;
  font-weight:600;
  cursor:pointer;
  font-size:.8rem;
}
`;
  const style = document.createElement('style');
  style.id = 'ai-chat-style';
  style.textContent = css;
  document.head.appendChild(style);
})();

// --- Base de conocimiento manual ---
const AI_KB = [
  {
    repo: 'https://github.com/S4M73l09/GCS-Bootstrap---Live',
    tags: ['bootstrap', 'gcs', 'infra', 'inicio', 'oidc', 'federacion'],
    answer_es:
      'GCS Infra Bootstrap es el proyecto que crea el proyecto base en GCP, las service accounts y la federación OIDC con GitHub Actions. Es la “capa 0” para poder desplegar después la infraestructura Live.',
    answer_en:
      'GCS Infra Bootstrap is the project that creates the base GCP project, service accounts and OIDC federation with GitHub Actions. It is the “layer 0” required before deploying the Live infrastructure.'
  },
  {
    repo: 'https://github.com/S4M73l09/GCS-Infra-Live',
    tags: ['live', 'gcs', 'monitorizacion', 'prometheus', 'grafana', 'alertmanager', 'os login', 'iap'],
    answer_es:
      'GCS Infra Live despliega la infraestructura real en GCP: VMs, red, OS Login + IAP y, mediante Ansible, el stack de monitorización (Prometheus, Grafana, Alertmanager) y una web estática.',
    answer_en:
      'GCS Infra Live deploys the real infrastructure in GCP: VMs, networking, OS Login + IAP and, via Ansible, the monitoring stack (Prometheus, Grafana, Alertmanager) plus a static website.'
  },
  {
    repo: 'https://github.com/S4M73l09/ProyectoServer',
    tags: ['jellyfin', 'azure', 'media server', 'docker'],
    answer_es:
      'El proyecto de Jellyfin monta un servidor multimedia en Azure con despliegue automatizado usando Terraform, GitHub Actions, Ansible y Docker.',
    answer_en:
      'The Jellyfin project sets up a media server on Azure with automated deployment using Terraform, GitHub Actions, Ansible and Docker.'
  },
  {
    repo: 'https://github.com/S4M73l09/scripts-guia-windows',
    tags: ['windows', 'scripts', 'dominio', 'server core', 'powershell'],
    answer_es:
      'El proyecto de Scripts Dominio Windows Core contiene scripts en PowerShell para automatizar la creación y configuración de un dominio en Windows Server Core.',
    answer_en:
      'The Windows Core Domain Scripts project contains PowerShell scripts to automate the creation and configuration of a domain on Windows Server Core.'
  },
  {
    repo: 'https://github.com/S4M73l09/Obversabilidad-Obverssility',
    tags: ['stack', 'tecnologias', 'skills', 'devops', 'que sabes', 'habilidades', 'observabilidad'],
    answer_es:
      'Mi stack gira en torno a Terraform, Ansible, Docker, GitHub Actions (CI/CD), monitorización con Prometheus/Grafana y cloud (Azure y GCP). También tengo experiencia con Windows Server, scripting y VPNs como WireGuard.',
    answer_en:
      'My stack focuses on Terraform, Ansible, Docker, GitHub Actions (CI/CD), monitoring with Prometheus/Grafana and cloud (Azure and GCP). I also have experience with Windows Server, scripting and VPNs like WireGuard.'
  }
];

// --- README a cargar (raw GitHub) ---
// Para cada repo, intentamos cargar README.md (es) y README.en.md (en).
const AI_DOC_SOURCES = [
  // GCS Bootstrap
  {
    repo: 'https://github.com/S4M73l09/GCS-Bootstrap---Live',
    url: 'https://raw.githubusercontent.com/S4M73l09/GCS-Bootstrap---Live/main/README.md',
    lang: 'es'
  },
  {
    repo: 'https://github.com/S4M73l09/GCS-Bootstrap---Live',
    url: 'https://raw.githubusercontent.com/S4M73l09/GCS-Bootstrap---Live/main/README.en.md',
    lang: 'en'
  },

  // GCS Infra Live
  {
    repo: 'https://github.com/S4M73l09/GCS-Infra-Live',
    url: 'https://raw.githubusercontent.com/S4M73l09/GCS-Infra-Live/main/README.md',
    lang: 'es'
  },
  {
    repo: 'https://github.com/S4M73l09/GCS-Infra-Live',
    url: 'https://raw.githubusercontent.com/S4M73l09/GCS-Infra-Live/feat%2Fdev/README.md',
    lang: 'es'
  },
  {
    repo: 'https://github.com/S4M73l09/GCS-Infra-Live',
    url: 'https://raw.githubusercontent.com/S4M73l09/GCS-Infra-Live/feat%2Fdev/README.en.md',
    lang: 'en'
  },
  {
    repo: 'https://github.com/S4M73l09/GCS-Infra-Live',
    url: 'https://raw.githubusercontent.com/S4M73l09/GCS-Infra-Live/main/README.en.md',
    lang: 'en'
  },

  // Proyecto Jellyfin
  {
    repo: 'https://github.com/S4M73l09/ProyectoServer',
    url: 'https://raw.githubusercontent.com/S4M73l09/ProyectoServer/main/README.md',
    lang: 'es'
  },
  {
    repo: 'https://github.com/S4M73l09/ProyectoServer',
    url: 'https://raw.githubusercontent.com/S4M73l09/ProyectoServer/main/README.en.md',
    lang: 'en'
  },

  // Scripts Windows
  {
    repo: 'https://github.com/S4M73l09/scripts-guia-windows',
    url: 'https://raw.githubusercontent.com/S4M73l09/scripts-guia-windows/main/README.md',
    lang: 'es'
  },
  {
    repo: 'https://github.com/S4M73l09/scripts-guia-windows',
    url: 'https://raw.githubusercontent.com/S4M73l09/scripts-guia-windows/main/README.en.md',
    lang: 'en'
  },

  // Observabilidad
  {
    repo: 'https://github.com/S4M73l09/Obversabilidad-Obverssility',
    url: 'https://raw.githubusercontent.com/S4M73l09/Obversabilidad-Obverssility/main/README.md',
    lang: 'es'
  },
  {
    repo: 'https://github.com/S4M73l09/Obversabilidad-Obverssility',
    url: 'https://raw.githubusercontent.com/S4M73l09/Obversabilidad-Obverssility/main/README.en.md',
    lang: 'en'
  },
  {
    repo: 'https://github.com/S4M73l09/Obversabilidad-Obverssility',
    url: 'https://raw.githubusercontent.com/S4M73l09/Obversabilidad-Obverssility/prueba/README.md',
    lang: 'es'
  },
  {
    rep: 'https://github.com/S4M73l09/Obversabilidad-Obverssility',
    url: 'https://raw.githubusercontent.com/S4M73l09/Obversabilidad-Obverssility/prueba/Readme.en.md',
    lang: 'en'
  }
];

// Aquí guardaremos párrafos reales de los README
const AI_PARAGRAPHS = [];

// --- Pesos de tags ---
const AI_TAG_WEIGHTS = {
  gcs: 3,
  bootstrap: 3,
  live: 3,
  infra: 2,
  monitorizacion: 2,
  prometheus: 2,
  grafana: 2,
  alertmanager: 2,
  azure: 1,
  jellyfin: 1,
  windows: 1,
  scripts: 1,
  'server core': 1,
  devops: 1,
  observabilidad: 1
};

// --- Sinónimos / términos relacionados ---
const AI_SYNONYMS = {
  gcs: ['gcp', 'google cloud'],
  bootstrap: ['capa 0', 'layer 0', 'inicio'],
  live: ['produccion', 'prod', 'infra live'],
  monitorizacion: ['observabilidad', 'monitoring'],
  scripts: ['script', 'scripting', 'automatizacion'],
  'server core': ['core server', 'windows core'],
  devops: ['infraestructura', 'pipeline', 'ci/cd']
};

// Normaliza texto a palabras "limpias"
function aiTokenize(text) {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

// Detecta idioma actual a partir del <html lang="...">
function aiCurrentLang() {
  const htmlLang = (document.documentElement.lang || 'es').toLowerCase();
  return htmlLang.startsWith('en') ? 'en' : 'es';
}

// --- Cargar README y trocear en párrafos ---
async function aiLoadDocs() {
  for (const src of AI_DOC_SOURCES) {
    try {
      const res = await fetch(src.url, { cache: 'no-store' });
      if (!res.ok) continue; // si no existe README.en.md o similar, pasamos

      const text = await res.text();

      // Troceamos por párrafos (separados por líneas en blanco)
      const chunks = text.split(/\n\s*\n+/);
      for (const ch of chunks) {
        const clean = ch.trim();
        // Ignorar títulos muy cortos o demasiado pequeños
        if (clean.length < 80) continue;
        if (clean.startsWith('#')) continue; // ignorar encabezados Markdown

        AI_PARAGRAPHS.push({
          text: clean,
          repo: src.repo,
          lang: src.lang || 'es'
        });
      }
    } catch (e) {
      console.warn('No se pudo cargar README de', src.repo, e);
    }
  }
}

// --- Búsqueda en KB manual: pesos + sinónimos + bonus por repo ---
function aiFindAnswer(question) {
  const q = question.toLowerCase();
  const words = aiTokenize(question);

  let bestScore = 0;
  let bestEntry = null;

  for (const entry of AI_KB) {
    let score = 0;

    // 1) Coincidencias por tags
    for (const canonicalTag of entry.tags) {
      const forms = [canonicalTag];
      if (AI_SYNONYMS[canonicalTag]) {
        forms.push(...AI_SYNONYMS[canonicalTag]);
      }

      const weight = AI_TAG_WEIGHTS[canonicalTag] || 1;
      let matched = false;

      for (const form of forms) {
        const trimmed = form.toLowerCase().trim();
        if (!trimmed) continue;

        if (trimmed.includes(' ')) {
          if (q.includes(trimmed)) {
            matched = true;
            break;
          }
        } else {
          if (words.includes(trimmed)) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        score += weight;
      }
    }

    // 2) BONUS: mención directa a URL o slug de repo
    if (entry.repo) {
      const repoUrl = entry.repo.toLowerCase();
      const repoSlug = repoUrl.split('/').pop();
      if (q.includes(repoUrl)) {
        score += 6;
      } else if (repoSlug && q.includes(repoSlug.toLowerCase())) {
        score += 4;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (!bestEntry || bestScore === 0) {
    return null;
  }
  return bestEntry;
}

// --- Buscar mejor párrafo de los README ---
function aiFindBestParagraph(question, preferredRepo) {
  if (!AI_PARAGRAPHS.length) return null;

  const wordsQ = aiTokenize(question);
  if (!wordsQ.length) return null;

  const currentLang = aiCurrentLang();

  let bestScore = 0;
  let bestPara = null;

  for (const p of AI_PARAGRAPHS) {
    const wordsP = aiTokenize(p.text);
    if (!wordsP.length) continue;

    // coincidencias de palabras
    let common = 0;
    for (const w of wordsQ) {
      if (wordsP.includes(w)) common++;
    }
    if (common === 0) continue;

    // boosts
    const repoBoost = preferredRepo && p.repo === preferredRepo ? 2 : 1;
    const langBoost = p.lang === currentLang ? 2 : 0.7; // preferimos idioma actual, pero no lo excluimos

    const score = common * repoBoost * langBoost;

    if (score > bestScore) {
      bestScore = score;
      bestPara = p;
    }
  }

  // pequeño umbral para no sacar cosas muy random
  if (!bestPara || bestScore < 2) return null;
  return bestPara;
}

// Mensaje por defecto cuando no se encuentra nada
function aiDefaultAnswer() {
  const lang = aiCurrentLang();
  if (lang === 'en') {
    return "I don't have information about that in my portfolio yet. Try asking about “Bootstrap”, “Live”, “Jellyfin” or “Windows Core scripts”.";
  }
  return 'No tengo información sobre eso en mi portfolio todavía. Prueba a preguntar por “Bootstrap”, “Live”, “Jellyfin” o “scripts de Windows Core”.';
}

// --- Crear UI de chat (burbuja + ventana) ---
function aiCreateChatUI() {
  const bubble = document.createElement('div');
  bubble.id = 'ai-chat-bubble';
  bubble.title = 'Asistente sobre mi portfolio';
  bubble.textContent = '💬';

  const win = document.createElement('div');
  win.id = 'ai-chat-window';

  const header = document.createElement('div');
  header.className = 'ai-chat-header';
  const title = document.createElement('span');
  title.textContent = 'Asistente portfolio';
  const closeBtn = document.createElement('button');
  closeBtn.id = 'ai-chat-close';
  closeBtn.textContent = '✕';
  header.appendChild(title);
  header.appendChild(closeBtn);

  const msgs = document.createElement('div');
  msgs.id = 'ai-chat-messages';

  const form = document.createElement('form');
  form.id = 'ai-chat-form';

  const input = document.createElement('input');
  input.id = 'ai-chat-input';
  input.type = 'text';
  input.placeholder = aiCurrentLang() === 'en'
    ? 'Ask about my projects...'
    : 'Pregunta sobre mis proyectos...';
  input.autocomplete = 'off';

  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit';
  sendBtn.textContent = aiCurrentLang() === 'en' ? 'Send' : 'Enviar';

  form.appendChild(input);
  form.appendChild(sendBtn);

  win.appendChild(header);
  win.appendChild(msgs);
  win.appendChild(form);

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  return { bubble, win, closeBtn, msgs, form, input };
}

// Añadir mensaje a la ventana
function aiAddMsg(container, text, who) {
  const div = document.createElement('div');
  div.className = 'msg ' + who;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// --- Inicializar comportamiento del bot ---
function aiInitBot() {
  const { bubble, win, closeBtn, msgs, form, input } = aiCreateChatUI();

  bubble.onclick = () => {
    win.style.display = 'flex';
    input.focus();
  };

  closeBtn.onclick = () => {
    win.style.display = 'none';
  };

  const lang = aiCurrentLang();
  const welcome =
    lang === 'en'
      ? 'Hi! I can answer questions about my portfolio projects, like GCS Bootstrap / Live, Jellyfin or Windows Core scripts.'
      : '¡Hola! Puedo responder preguntas sobre mis proyectos del portfolio, como GCS Bootstrap / Live, Jellyfin o los scripts de Windows Core.';
  aiAddMsg(msgs, welcome, 'bot');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    aiAddMsg(msgs, text, 'me');

    // 1) Buscar entrada de KB manual
    const entry = aiFindAnswer(text);

    // 2) Buscar mejor párrafo de README (si hay repo preferido, lo usamos)
    const preferredRepo = entry && entry.repo ? entry.repo : null;
    const para = aiFindBestParagraph(text, preferredRepo);

    // 3) Construir respuesta final
    if (!entry && !para) {
      aiAddMsg(msgs, aiDefaultAnswer(), 'bot');
      return;
    }

    let answer = '';

    if (entry) {
      const lang = aiCurrentLang();
      answer = lang === 'en' ? entry.answer_en : entry.answer_es;

      if (entry.repo) {
        if (lang === 'en') {
          answer += `\n\nMore details in the repo:\n${entry.repo}`;
        } else {
          answer += `\n\nPuedes ver más detalles en el repositorio:\n${entry.repo}`;
        }
      }
    }

    if (para) {
      const lang = aiCurrentLang();
      const intro =
        lang === 'en'
          ? '\n\nExcerpt from the README:\n'
          : '\n\nFragmento del README:\n';
      answer += intro + para.text;
    }

    aiAddMsg(msgs, answer.trim(), 'bot');
  });
}

// Arranque: UI + carga de README en segundo plano
document.addEventListener('DOMContentLoaded', () => {
  aiInitBot();
  aiLoadDocs();
});
