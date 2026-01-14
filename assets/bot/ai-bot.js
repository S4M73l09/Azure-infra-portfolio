// ai-bot.js - Versión 2.1 con Búsqueda Semántica y Contexto Conversacional

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// --- Estado del Bot ---
let modelExtractor = null;
let modelEmbeddings = null;
let isBotReady = false;
let lastContext = { repo: null }; // CONTEXTO: Guardar el último repo mencionado

// --- Funciones de Lógica de IA ---

/**
 * Calcula la similitud coseno entre dos vectores.
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Determina si la intención de la pregunta es un resumen general.
 * @param {string} question La pregunta del usuario.
 * @returns {boolean}
 */
function isSummaryIntent(question) {
    const q = question.toLowerCase();
    const summaryKeywords = [
        'resumen', 'qué es', 'que es', 'de qué trata', 'acerca de', 
        'summary', 'what is', "what's", 'tell me about'
    ];
    // La pregunta es corta y contiene una palabra clave de resumen.
    return summaryKeywords.some(kw => q.includes(kw));
}

/**
 * Busca la respuesta más relevante en la base de conocimiento de embeddings.
 * @param {string} question La pregunta del usuario.
 * @param {object} context El contexto de la conversación actual.
 * @returns {Promise<object|null>} El objeto de embedding con la mejor puntuación o null.
 */
async function findAnswerWithEmbeddings(question, context) {
  if (!isBotReady) {
    return {
      text: "El bot todavía está cargando, por favor espera un momento.",
      source: "bot", repo: "", lang: aiCurrentLang(),
    };
  }

  const questionEmbedding = await modelExtractor(question, { pooling: 'mean', normalize: true });

  let bestScore = -1;
  let bestMatch = null;
  const summaryIntent = isSummaryIntent(question);

  for (const entry of modelEmbeddings) {
    let score = cosineSimilarity(questionEmbedding.data, entry.embedding);

    // Aumentar puntuación si el repo coincide con el contexto de la conversación
    if (context.repo && entry.repo === context.repo) {
      score *= 1.2; // 20% de boost
    }

    // Aumentar puntuación si la intención es un resumen y la fuente es un resumen
    if (summaryIntent && entry.source === 'kb-summary') {
        score *= 1.4; // 40% de boost para resúmenes
    }
    
    // Penalizar ligeramente los fragmentos de README si no se pide un resumen, para priorizar respuestas curadas
    if (!summaryIntent && entry.source === 'readme') {
        score *= 0.95;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestScore > 0.55) { // Umbral de confianza ligeramente más alto
    return bestMatch;
  }

  return null;
}

// --- Interfaz y Flujo de Chat ---

(function () {
  const css = `
#ai-chat-bubble{position:fixed;right:18px;bottom:18px;width:52px;height:52px;border-radius:999px;background:#2563eb;color:white;display:flex;align-items:center;justify-content:center;font-size:1.4rem;cursor:pointer;box-shadow:0 10px 25px rgba(15,23,42,.6);z-index:50;}
#ai-chat-window{position:fixed;right:18px;bottom:80px;width:320px;max-height:420px;background:#020617;border-radius:16px;border:1px solid rgba(148,163,184,.6);display:none;flex-direction:column;overflow:hidden;z-index:50;}
.ai-chat-header{padding:8px 10px;display:flex;justify-content:space-between;align-items:center;background:#0b1120;border-bottom:1px solid rgba(148,163,184,.4);font-size:.9rem;}
#ai-chat-messages{padding:8px;flex:1;overflow-y:auto;font-size:.85rem;}
#ai-chat-messages .msg{margin-bottom:6px;line-height:1.4;}
#ai-chat-messages .me{text-align:right;color:#e5e7eb;}
#ai-chat-messages .bot{text-align:left;color:#cbd5f5;}
#ai-chat-messages .bot .source-link{font-size: 0.75rem; color: #93c5fd; text-decoration: none; display: block; margin-top: 4px;}
#ai-chat-actions{display:flex;flex-direction:column;gap:8px;padding:8px;border-top:1px solid rgba(148,163,184,.4);}
.ai-actions-title{font-size:.75rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;}
.ai-btn-group{display:flex;flex-wrap:wrap;gap:6px;}
.ai-btn{padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.5);background:#0b1120;color:#e5e7eb;font-weight:600;cursor:pointer;font-size:.78rem;transition:transform .15s,border-color .15s,background .15s;}
.ai-btn:hover{border-color:rgba(148,163,184,.9);transform:translateY(-1px);}
.ai-btn.primary{background:#2563eb;border-color:transparent;color:#fff;}
.ai-btn.active{border-color:#93c5fd;background:#1e293b;}
.ai-btn:disabled{opacity:.55;cursor:not-allowed;transform:none;}
.loader {width: 12px; height: 12px; border-radius: 50%; display: inline-block; border-top: 2px solid #FFF; border-right: 2px solid transparent; box-sizing: border-box; animation: rotation 1s linear infinite; margin-left: 10px;}
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`;
  const style = document.createElement('style');
  style.id = 'ai-chat-style';
  style.textContent = css;
  document.head.appendChild(style);
})();

function aiCreateChatUI() {
  const bubble = document.createElement('div');
  bubble.id = 'ai-chat-bubble';
  bubble.title = 'Asistente sobre mi portfolio';
  bubble.innerHTML = '💬';

  const win = document.createElement('div');
  win.id = 'ai-chat-window';
  win.innerHTML = `
    <div class="ai-chat-header">
      <span>Asistente portfolio</span>
      <button id="ai-chat-close">✕</button>
    </div>
    <div id="ai-chat-messages"></div>
    <div id="ai-chat-actions">
      <div class="ai-actions-title" id="ai-projects-title">Proyectos</div>
      <div class="ai-btn-group" id="ai-project-buttons"></div>
      <div class="ai-actions-title" id="ai-actions-title">Acciones</div>
      <div class="ai-btn-group" id="ai-action-buttons"></div>
    </div>`;

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  return {
    bubble, win,
    closeBtn: document.getElementById('ai-chat-close'),
    msgs: document.getElementById('ai-chat-messages'),
    projectTitle: document.getElementById('ai-projects-title'),
    actionTitle: document.getElementById('ai-actions-title'),
    projectButtons: document.getElementById('ai-project-buttons'),
    actionButtons: document.getElementById('ai-action-buttons'),
  };
}

function aiAddMsg(container, text, who, sourceRepo = '') {
  const div = document.createElement('div');
  div.className = 'msg ' + who;
  
  let formattedText = text.replace(/\n/g, '<br>');

  if (who === 'bot' && sourceRepo) {
    formattedText += `<br><a href="${sourceRepo}" target="_blank" class="source-link">Fuente: ${sourceRepo.split('/').pop()}</a>`;
  }
  
  div.innerHTML = formattedText;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function aiCurrentLang() {
  return (document.documentElement.lang || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
}

function aiDefaultAnswer(lang) {
  return lang === 'en'
    ? "I couldn't find a specific answer in my knowledge base. Could you try rephrasing the question?"
    : 'No encontré una respuesta específica en mi base de conocimiento. ¿Podrías reformular la pregunta?';
}

const AI_PROJECTS = [
  {
    id: 'gcs-bootstrap',
    repo: 'https://github.com/S4M73l09/GCS-Bootstrap---Live',
    name: { es: 'GCS Infra Bootstrap', en: 'GCS Infra Bootstrap' },
  },
  {
    id: 'gcs-live',
    repo: 'https://github.com/S4M73l09/GCS-Infra-Live',
    name: { es: 'GCS Infra Live', en: 'GCS Infra Live' },
  },
  {
    id: 'jellyfin',
    repo: 'https://github.com/S4M73l09/ProyectoServer',
    name: { es: 'Servidor Jellyfin', en: 'Jellyfin Server' },
  },
  {
    id: 'observabilidad',
    repo: 'https://github.com/S4M73l09/Obversabilidad-Obverssility',
    name: { es: 'Observabilidad', en: 'Observability' },
  },
  {
    id: 'windows-core',
    repo: 'https://github.com/S4M73l09/scripts-guia-windows',
    name: { es: 'Windows Core Scripts', en: 'Windows Core Scripts' },
  },
];

const AI_ACTIONS = [
  {
    key: 'summary',
    label: { es: 'Resumen', en: 'Summary' },
    question: (project, lang) =>
      lang === 'en'
        ? `Summary of ${project.name.en}`
        : `Resumen de ${project.name.es}`,
  },
  {
    key: 'deploy',
    label: { es: 'Despliegue', en: 'Deploy' },
    question: (project, lang) =>
      lang === 'en'
        ? `How is ${project.name.en} deployed`
        : `Cómo se despliega ${project.name.es}`,
  },
  {
    key: 'monitor',
    label: { es: 'Monitorización', en: 'Monitoring' },
    question: (project, lang) =>
      lang === 'en'
        ? `Monitoring in ${project.name.en}`
        : `Monitorización de ${project.name.es}`,
  },
  {
    key: 'stack',
    label: { es: 'Stack', en: 'Stack' },
    question: (project, lang) =>
      lang === 'en'
        ? `Tech stack of ${project.name.en}`
        : `Stack de ${project.name.es}`,
  },
];

async function main() {
  const {
    bubble,
    win,
    closeBtn,
    msgs,
    projectTitle,
    actionTitle,
    projectButtons,
    actionButtons,
  } = aiCreateChatUI();
  let activeProject = null;

  bubble.onclick = () => {
    win.style.display = 'flex';
  };
  closeBtn.onclick = () => { win.style.display = 'none'; };

  const setButtonsDisabled = (disabled) => {
    projectButtons.querySelectorAll('button').forEach(btn => {
      btn.disabled = disabled;
    });
    actionButtons.querySelectorAll('button').forEach(btn => {
      btn.disabled = disabled || !activeProject;
    });
  };

  const setActiveProject = (project) => {
    activeProject = project;
    lastContext.repo = project.repo;
    projectButtons.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.projectId === project.id);
    });
    actionButtons.querySelectorAll('button').forEach(btn => {
      btn.disabled = !isBotReady;
    });
  };

  const renderButtons = () => {
    const lang = aiCurrentLang();
    projectTitle.textContent = lang === 'en' ? 'Projects' : 'Proyectos';
    actionTitle.textContent = lang === 'en' ? 'Actions' : 'Acciones';

    projectButtons.innerHTML = '';
    AI_PROJECTS.forEach((project) => {
      const btn = document.createElement('button');
      btn.className = 'ai-btn';
      btn.dataset.projectId = project.id;
      btn.textContent = project.name[lang];
      btn.onclick = () => {
        setActiveProject(project);
        handleAsk(AI_ACTIONS[0].question(project, lang), project.repo);
      };
      projectButtons.appendChild(btn);
    });

    actionButtons.innerHTML = '';
    AI_ACTIONS.forEach((action) => {
      const btn = document.createElement('button');
      btn.className = 'ai-btn primary';
      btn.textContent = action.label[lang];
      btn.disabled = !activeProject || !isBotReady;
      btn.onclick = () => {
        if (!activeProject) {
          aiAddMsg(msgs, lang === 'en' ? 'Select a project first.' : 'Elige un proyecto primero.', 'bot');
          return;
        }
        handleAsk(action.question(activeProject, lang), activeProject.repo);
      };
      actionButtons.appendChild(btn);
    });

    setButtonsDisabled(!isBotReady);
  };

  const handleAsk = async (question, repoOverride = '') => {
    if (!isBotReady) return;
    const lang = aiCurrentLang();
    aiAddMsg(msgs, question, 'me');

    const thinkingMsg = document.createElement('div');
    thinkingMsg.className = 'msg bot';
    thinkingMsg.innerHTML = `${lang === 'en' ? 'Searching' : 'Buscando'}... <div class="loader"></div>`;
    msgs.appendChild(thinkingMsg);
    msgs.scrollTop = msgs.scrollHeight;

    const bestMatch = await findAnswerWithEmbeddings(question, lastContext);
    thinkingMsg.remove();

    if (bestMatch) {
      aiAddMsg(msgs, bestMatch.text, 'bot', bestMatch.repo || repoOverride);
      if (bestMatch.repo) {
        lastContext.repo = bestMatch.repo;
      }
    } else {
      aiAddMsg(msgs, aiDefaultAnswer(aiCurrentLang()), 'bot');
    }
  };

  const initialMsg = aiCurrentLang() === 'en' ? 'Loading AI assistant...' : 'Cargando asistente de IA...';
  aiAddMsg(msgs, initialMsg, 'bot');
  renderButtons();

  const langObserver = new MutationObserver(() => {
    renderButtons();
  });
  langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  try {
    const [extractor, embeddingsResponse] = await Promise.all([
      pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        progress_callback: (progress) => {
          const statusMsg = aiCurrentLang() === 'en'
            ? `Downloading model... (${Math.round(progress.progress)}%)`
            : `Descargando modelo... (${Math.round(progress.progress)}%)`;
          msgs.lastChild.textContent = statusMsg;
        }
      }),
      fetch('assets/bot/embeddings.json')
    ]);

    modelExtractor = extractor;

    if (!embeddingsResponse.ok) {
        throw new Error('Could not load embeddings.json. Make sure the file exists and is accessible.');
    }

    modelEmbeddings = await embeddingsResponse.json();
    
    isBotReady = true;
    const readyMsg = aiCurrentLang() === 'en' 
        ? 'Hi! I can answer questions about the projects in this portfolio. How can I help?'
        : '¡Hola! Puedo responder preguntas sobre los proyectos de este portfolio. ¿En qué te puedo ayudar?';
    msgs.lastChild.textContent = readyMsg;
    renderButtons();

  } catch (error) {
    console.error('Error initializing AI bot:', error);
    const errorMsg = aiCurrentLang() === 'en' ? 'Error loading AI assistant.' : 'Error al cargar el asistente de IA.';
    aiAddMsg(msgs, errorMsg, 'bot');
  }
}

document.addEventListener('DOMContentLoaded', main);
