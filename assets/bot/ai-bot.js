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

// --- Base de conocimiento manual (distintas vistas por intención) ---
const AI_KB = [
  {
    repo: 'https://github.com/S4M73l09/GCS-Bootstrap---Live',
    tags: ['bootstrap', 'gcs', 'infra', 'inicio', 'oidc', 'federacion', 'federación'],
    // Resumen general
    summary_es:
      'GCS Infra Bootstrap es la “capa 0” de tu infraestructura en GCP: crea el proyecto base, las service accounts y la federación OIDC con GitHub Actions para que después puedas desplegar la infraestructura Live de forma segura.',
    summary_en:
      'GCS Infra Bootstrap is the “layer 0” of your GCP infrastructure: it creates the base project, service accounts and OIDC federation with GitHub Actions so that you can safely deploy the Live infrastructure afterwards.',
    // Cómo se despliega / CI-CD
    deploy_es:
      'El proyecto GCS Infra Bootstrap se despliega con Terraform y GitHub Actions usando OIDC: la pipeline ejecuta terraform plan/apply sobre el proyecto de bootstrap y crea los recursos iniciales (proyecto, service accounts, roles y proveedor de OIDC) sin exponer credenciales estáticas.',
    deploy_en:
      'The GCS Infra Bootstrap project is deployed with Terraform and GitHub Actions using OIDC: the pipeline runs terraform plan/apply against the bootstrap project and creates the initial resources (project, service accounts, roles and OIDC provider) without exposing static credentials.',
    // Monitorización (en Bootstrap casi no hay)
    monitor_es:
      'GCS Infra Bootstrap no monta el stack de monitorización en sí, sino que prepara la base de proyecto y permisos para que Infra Live pueda desplegar Prometheus, Grafana y Alertmanager de forma segura sobre GCP.',
    monitor_en:
      'GCS Infra Bootstrap does not deploy the monitoring stack itself; instead, it prepares the base project and permissions so that Infra Live can safely deploy Prometheus, Grafana and Alertmanager on top of GCP.',
    // Stack / tecnologías
    stack_es:
      'En GCS Infra Bootstrap utilizas principalmente Terraform para definir recursos de GCP y GitHub Actions con OIDC para autenticar sin secretos estáticos, siguiendo buenas prácticas de separación Bootstrap/Live.',
    stack_en:
      'In GCS Infra Bootstrap you mainly use Terraform to define GCP resources and GitHub Actions with OIDC to authenticate without static secrets, following best practices for separating Bootstrap and Live.',
    // Fallback genérico
    answer_es:
      'GCS Infra Bootstrap es el proyecto que crea el proyecto base en GCP, las service accounts y la federación OIDC con GitHub Actions. Es la “capa 0” para poder desplegar después la infraestructura Live.',
    answer_en:
      'GCS Infra Bootstrap is the project that creates the base GCP project, service accounts and OIDC federation with GitHub Actions. It is the “layer 0” required before deploying the Live infrastructure.'
  },
  {
    repo: 'https://github.com/S4M73l09/GCS-Infra-Live',
    tags: ['live', 'gcs', 'monitorizacion', 'monitorización', 'prometheus', 'grafana', 'alertmanager', 'os login', 'iap'],
    summary_es:
      'GCS Infra Live despliega la infraestructura real en GCP: red, VMs, OS Login + IAP y, mediante Ansible, el stack de monitorización (Prometheus, Grafana, Alertmanager) junto con tu web estática.',
    summary_en:
      'GCS Infra Live deploys the real infrastructure in GCP: networking, VMs, OS Login + IAP and, via Ansible, the monitoring stack (Prometheus, Grafana, Alertmanager) plus your static website.',
    deploy_es:
      'GCS Infra Live se despliega con Terraform y GitHub Actions: la pipeline aplica la infraestructura (red, firewall, VM, OS Login + IAP) y luego encadena un playbook de Ansible que se conecta por IAP para provisionar Docker, Prometheus, Grafana, Alertmanager y tu web estática dentro de la VM.',
    deploy_en:
      'GCS Infra Live is deployed with Terraform and GitHub Actions: the pipeline applies the infrastructure (network, firewall, VM, OS Login + IAP) and then chains an Ansible playbook that connects through IAP to provision Docker, Prometheus, Grafana, Alertmanager and your static website inside the VM.',
    monitor_es:
      'En GCS Infra Live el stack de monitorización incluye Prometheus, Node Exporter, Alertmanager y Grafana. Prometheus recoge métricas de la VM, Alertmanager gestiona las alertas y Grafana expone dashboards personalizados para observar el estado de la infraestructura y los servicios.',
    monitor_en:
      'In GCS Infra Live the monitoring stack includes Prometheus, Node Exporter, Alertmanager and Grafana. Prometheus scrapes metrics from the VM, Alertmanager manages alerts and Grafana exposes custom dashboards to observe the state of the infrastructure and services.',
    stack_es:
      'GCS Infra Live combina Terraform, GitHub Actions, Ansible y Docker sobre GCP: Terraform define la red y las VMs, GitHub Actions orquesta el CI/CD con OIDC, Ansible configura los servicios dentro de la VM y Docker ejecuta el stack de monitorización y la web.',
    stack_en:
      'GCS Infra Live combines Terraform, GitHub Actions, Ansible and Docker on top of GCP: Terraform defines networking and VMs, GitHub Actions orchestrates CI/CD with OIDC, Ansible configures services inside the VM and Docker runs the monitoring stack and the website.',
    answer_es:
      'GCS Infra Live despliega la infraestructura real en GCP: VMs, red, OS Login + IAP y, mediante Ansible, el stack de monitorización (Prometheus, Grafana, Alertmanager) y una web estática.',
    answer_en:
      'GCS Infra Live deploys the real infrastructure in GCP: VMs, networking, OS Login + IAP and, via Ansible, the monitoring stack (Prometheus, Grafana, Alertmanager) plus a static website.'
  },
  {
    repo: 'https://github.com/S4M73l09/ProyectoServer',
    tags: ['jellyfin', 'azure', 'media server', 'docker'],
    summary_es:
      'El proyecto ProyectoServer monta un servidor multimedia con Jellyfin en Azure, automatizando la creación de la VM y la instalación del stack con Terraform, GitHub Actions, Ansible y Docker.',
    summary_en:
      'The ProyectoServer repo sets up a Jellyfin media server on Azure, automating VM creation and stack installation with Terraform, GitHub Actions, Ansible and Docker.',
    deploy_es:
      'El servidor Jellyfin se despliega creando la infraestructura en Azure con Terraform (red, VM, seguridad) y usando GitHub Actions para ejecutar Ansible, que instala Docker y levanta los contenedores necesarios para Jellyfin y sus dependencias.',
    deploy_en:
      'The Jellyfin server is deployed by creating Azure infrastructure with Terraform (network, VM, security) and using GitHub Actions to run Ansible, which installs Docker and starts the containers required for Jellyfin and its dependencies.',
    monitor_es:
      'La monitorización del servidor Jellyfin puede integrarse con el mismo enfoque de Prometheus y Grafana que usas en otros proyectos, añadiendo exporters en la VM de Azure para observar rendimiento y uso de recursos.',
    monitor_en:
      'Monitoring for the Jellyfin server can be integrated with the same Prometheus and Grafana approach you use in other projects, adding exporters on the Azure VM to observe performance and resource usage.',
    stack_es:
      'En ProyectoServer utilizas Terraform para Azure, GitHub Actions como CI/CD, Ansible para la configuración de la VM y Docker para ejecutar Jellyfin como contenedor.',
    stack_en:
      'In ProyectoServer you use Terraform for Azure, GitHub Actions for CI/CD, Ansible for VM configuration and Docker to run Jellyfin as a container.',
    answer_es:
      'El proyecto de Jellyfin monta un servidor multimedia en Azure con despliegue automatizado usando Terraform, GitHub Actions, Ansible y Docker.',
    answer_en:
      'The Jellyfin project sets up a media server on Azure with automated deployment using Terraform, GitHub Actions, Ansible and Docker.'
  },
  {
    repo: 'https://github.com/S4M73l09/scripts-guia-windows',
    tags: ['windows', 'scripts', 'dominio', 'server core', 'powershell'],
    summary_es:
      'El repositorio de Scripts Dominio Windows Core agrupa scripts en PowerShell para automatizar la creación y configuración de un dominio en Windows Server Core, evitando tener que hacerlo todo a mano.',
    summary_en:
      'The Windows Core Domain Scripts repository groups PowerShell scripts to automate creating and configuring a domain on Windows Server Core, so you don\'t have to do everything manually.',
    deploy_es:
      'Para usar los scripts de dominio en Windows Server Core, se ejecutan desde PowerShell siguiendo el orden de la guía: se configuran roles, servicios y parámetros del dominio de forma automatizada para dejar el controlador de dominio listo.',
    deploy_en:
      'To use the domain scripts on Windows Server Core, you run them from PowerShell following the guide’s order: they configure roles, services and domain parameters automatically to leave the domain controller ready.',
    monitor_es:
      'Estos scripts están centrados en la configuración del dominio; la monitorización se suele complementar desde otros proyectos (por ejemplo, integrando ese servidor en el stack de Prometheus y Grafana).',
    monitor_en:
      'These scripts are focused on domain configuration; monitoring is usually complemented from other projects (for example, by integrating that server into the Prometheus and Grafana stack).',
    stack_es:
      'En este proyecto el foco está en PowerShell y Windows Server Core, aplicando automatización sobre servicios de Directorio Activo y configuración de dominio.',
    stack_en:
      'In this project the focus is on PowerShell and Windows Server Core, applying automation on Active Directory services and domain configuration.',
    answer_es:
      'El proyecto de Scripts Dominio Windows Core contiene scripts en PowerShell para automatizar la creación y configuración de un dominio en Windows Server Core.',
    answer_en:
      'The Windows Core Domain Scripts project contains PowerShell scripts to automate the creation and configuration of a domain on Windows Server Core.'
  },
  {
    repo: 'https://github.com/S4M73l09/Obversabilidad-Obverssility',
    tags: ['stack', 'tecnologias', 'tecnologías', 'skills', 'devops', 'que sabes', 'habilidades', 'observabilidad'],
    summary_es:
      'El repositorio de observabilidad resume tu stack orientado a monitorización y buenas prácticas DevOps, combinando infraestructura como código, CI/CD, contenedores y herramientas de métricas y dashboards.',
    summary_en:
      'The observability repository summarizes your stack focused on monitoring and DevOps best practices, combining infrastructure as code, CI/CD, containers and metrics/dashboard tools.',
    deploy_es:
      'Los componentes de observabilidad (exporters, Prometheus, Grafana, Alertmanager) se despliegan normalmente a través de Docker y Ansible, integrados en pipelines de GitHub Actions y definidos con Terraform donde aplica.',
    deploy_en:
      'The observability components (exporters, Prometheus, Grafana, Alertmanager) are usually deployed through Docker and Ansible, integrated into GitHub Actions pipelines and defined with Terraform where it applies.',
    monitor_es:
      'Tu enfoque de observabilidad se basa en Prometheus para métricas, Alertmanager para alertas y Grafana para dashboards, siguiendo un modelo pull con exporters en las VMs y paneles personalizados para ver el estado de la infraestructura y servicios.',
    monitor_en:
      'Your observability approach is based on Prometheus for metrics, Alertmanager for alerts and Grafana for dashboards, following a pull model with exporters on the VMs and custom panels to see infrastructure and service health.',
    stack_es:
      'Tu stack principal gira en torno a Terraform, Ansible, Docker, GitHub Actions (CI/CD), Prometheus, Grafana y Alertmanager, trabajando sobre clouds como Azure y GCP, además de Windows Server, scripting y VPNs como WireGuard.',
    stack_en:
      'Your main stack revolves around Terraform, Ansible, Docker, GitHub Actions (CI/CD), Prometheus, Grafana and Alertmanager, working on clouds such as Azure and GCP, plus Windows Server, scripting and VPNs like WireGuard.',
    answer_es:
      'Mi stack gira en torno a Terraform, Ansible, Docker, GitHub Actions (CI/CD), monitorización con Prometheus/Grafana y cloud (Azure y GCP). También tengo experiencia con Windows Server, scripting y VPNs como WireGuard.',
    answer_en:
      'My stack focuses on Terraform, Ansible, Docker, GitHub Actions (CI/CD), monitoring with Prometheus/Grafana and cloud (Azure and GCP). I also have experience with Windows Server, scripting and VPNs like WireGuard.'
  }
];

// --- README a cargar (raw GitHub) ---
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

  // GCS Infra Live (main)
  {
    repo: 'https://github.com/S4M73l09/GCS-Infra-Live',
    url: 'https://raw.githubusercontent.com/S4M73l09/GCS-Infra-Live/main/README.md',
    lang: 'es'
  },
  {
    repo: 'https://github.com/S4M73l09/GCS-Infra-Live',
    url: 'https://raw.githubusercontent.com/S4M73l09/GCS-Infra-Live/main/README.en.md',
    lang: 'en'
  },
  // GCS Infra Live (rama feat/dev)
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

  // Observabilidad (main)
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
  // Observabilidad (rama prueba)
  {
    repo: 'https://github.com/S4M73l09/Obversabilidad-Obverssility',
    url: 'https://raw.githubusercontent.com/S4M73l09/Obversabilidad-Obverssility/prueba/README.md',
    lang: 'es'
  },
  {
    repo: 'https://github.com/S4M73l09/Obversabilidad-Obverssility',
    url: 'https://raw.githubusercontent.com/S4M73l09/Obversabilidad-Obverssility/prueba/README.en.md',
    lang: 'en'
  }
];

// Aquí guardaremos párrafos reales de los README
const AI_PARAGRAPHS = [];

// Memoria de conversación muy corta
let AI_LAST_REPO = null;
let AI_LAST_INTENT = null;

// --- Pesos de tags ---
const AI_TAG_WEIGHTS = {
  gcs: 3,
  bootstrap: 3,
  live: 3,
  infra: 2,
  monitorizacion: 2,
  'monitorización': 2,
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
  live: ['produccion', 'producción', 'prod', 'infra live'],
  monitorizacion: ['monitorización', 'observabilidad', 'observability', 'monitoring'],
  'monitorización': ['monitorizacion', 'observabilidad', 'monitoring'],
  scripts: ['script', 'scripting', 'automatizacion', 'automatización'],
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

// Detecta idioma global de la página (fallback)
function aiCurrentLang() {
  const htmlLang = (document.documentElement.lang || 'es').toLowerCase();
  return htmlLang.startsWith('en') ? 'en' : 'es';
}

// Detectar idioma aproximado de la PREGUNTA
function aiDetectLangFromQuestion(question) {
  const q = question.toLowerCase();
  const hasEs = /( qué| que | cómo| como | por qué| porque| proyecto|infraestructura|despliegue|monitorización|monitorizacion)/.test(q);
  const hasEn = /( what| how | why | project|infrastructure|deploy|deployment|monitoring)/.test(q);

  if (hasEs && !hasEn) return 'es';
  if (hasEn && !hasEs) return 'en';
  return null;
}

// Idioma final a usar para la RESPUESTA
function aiResponseLang(question) {
  const detected = aiDetectLangFromQuestion(question);
  return detected || aiCurrentLang();
}

// --- Cargar README y trocear en párrafos ---
async function aiLoadDocs() {
  for (const src of AI_DOC_SOURCES) {
    try {
      const res = await fetch(src.url, { cache: 'no-store' });
      if (!res.ok) continue;

      const text = await res.text();

      // Troceamos por párrafos (separados por líneas en blanco)
      const chunks = text.split(/\n\s*\n+/);
      chunks.forEach((ch, idx) => {
        const clean = ch.trim();
        if (clean.length < 80) return;
        if (clean.startsWith('#')) return;

        AI_PARAGRAPHS.push({
          text: clean,
          repo: src.repo,
          lang: src.lang || 'es',
          index: idx
        });
      });
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

    // tags
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

    // bonus repo
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

// --- Detectar tipo de pregunta (intención) ---
function aiDetectQuestionIntent(question) {
  const q = question.toLowerCase();

  if (/^(y|ya|y entonces|¿y)\s/.test(q) || /^and\s/.test(q)) {
    return 'followup';
  }

  const summaryPatterns = [
    'que es', 'qué es', 'que hace', 'qué hace', 'que se hace', 'qué se hace',
    'what is', "what's", 'what does', 'explain', 'explícame', 'explicame',
    'resumen', 'summary'
  ];
  for (const p of summaryPatterns) if (q.includes(p)) return 'summary';

  const deployPatterns = [
    'como se despliega', 'cómo se despliega', 'como despliegas', 'cómo despliegas',
    'como deploy', 'how do you deploy', 'how is it deployed',
    'deploy', 'deployment', 'despliegue', 'pipeline', 'ci/cd', 'workflow',
    'github actions', 'actions', 'apply', 'terraform apply'
  ];
  for (const p of deployPatterns) if (q.includes(p)) return 'deploy';

  const monitorPatterns = [
    'monitorizacion', 'monitorización', 'monitoring', 'observabilidad', 'observability',
    'metrics', 'métricas', 'logs', 'alertas', 'alerts', 'prometheus', 'grafana', 'alertmanager'
  ];
  for (const p of monitorPatterns) if (q.includes(p)) return 'monitor';

  const stackPatterns = [
    'stack', 'stack tecnico', 'stack técnico', 'tecnologias', 'tecnologías',
    'skills', 'habilidades', 'tech stack', 'que usas', 'qué usas',
    'technologies you use'
  ];
  for (const p of stackPatterns) if (q.includes(p)) return 'stack';

  return 'other';
}

// --- Buscar mejor párrafo de los README ---
function aiFindBestParagraph(question, preferredRepo, preferredLang, intent) {
  if (!AI_PARAGRAPHS.length) return null;

  const wordsQ = aiTokenize(question);
  if (!wordsQ.length) return null;

  const currentLang = preferredLang || aiCurrentLang();

  let bestScore = 0;
  let bestPara = null;

  const intentKeywords = {
    deploy: ['deploy', 'deployment', 'despliegue', 'pipeline', 'ci/cd', 'github actions', 'workflow'],
    monitor: ['monitorizacion', 'monitorización', 'monitoring', 'observabilidad', 'prometheus', 'grafana', 'alertmanager', 'metrics', 'métricas', 'alertas', 'alerts'],
    stack: ['terraform', 'ansible', 'docker', 'github actions', 'prometheus', 'grafana', 'wireguard', 'windows server']
  };

  for (const p of AI_PARAGRAPHS) {
    const wordsP = aiTokenize(p.text);
    if (!wordsP.length) continue;

    let common = 0;
    for (const w of wordsQ) {
      if (wordsP.includes(w)) common++;
    }
    if (common === 0) continue;

    const repoBoost = preferredRepo && p.repo === preferredRepo ? 2 : 1;
    const langBoost = p.lang === currentLang ? 2 : 0.7;
    const positionBoost = p.index <= 2 ? 1.5 : 1;

    let intentBoost = 1;
    if (intent && intentKeywords[intent]) {
      const kwList = intentKeywords[intent];
      const pLower = p.text.toLowerCase();
      if (kwList.some(k => pLower.includes(k))) {
        intentBoost = 1.7;
      }
    }

    const score = common * repoBoost * langBoost * positionBoost * intentBoost;

    if (score > bestScore) {
      bestScore = score;
      bestPara = p;
    }
  }

  if (!bestPara || bestScore < 2) return null;
  return bestPara;
}

// --- Compactar un párrafo del README para que no suelte todo el tocho ---
function aiCondenseParagraph(text) {
  if (!text) return '';

  let cleaned = text.replace(/^\s*[-*]\s*/gm, '').trim();
  cleaned = cleaned.replace(/\s+/g, ' ');

  const MAX = 280;

  if (cleaned.length <= MAX) return cleaned;

  const cutAt = cleaned.lastIndexOf('.', MAX);
  if (cutAt > 80) {
    return cleaned.slice(0, cutAt + 1) + ' …';
  }

  return cleaned.slice(0, MAX) + ' …';
}

// --- Elegir la mejor respuesta base según intención ---
function aiPickBaseAnswer(entry, lang, intent) {
  const isEn = lang === 'en';

  const fields = {
    summary: isEn ? entry.summary_en : entry.summary_es,
    deploy: isEn ? entry.deploy_en : entry.deploy_es,
    monitor: isEn ? entry.monitor_en : entry.monitor_es,
    stack: isEn ? entry.stack_en : entry.stack_es
  };

  let base = null;

  if (intent === 'summary' && fields.summary) base = fields.summary;
  else if (intent === 'deploy' && fields.deploy) base = fields.deploy;
  else if (intent === 'monitor' && fields.monitor) base = fields.monitor;
  else if (intent === 'stack' && fields.stack) base = fields.stack;

  if (!base) {
    base = isEn ? entry.answer_en : entry.answer_es;
  }

  return base || '';
}

// Mensaje por defecto cuando no se encuentra nada
function aiDefaultAnswer(langOverride) {
  const lang = langOverride || aiCurrentLang();
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

  const welcomeLang = aiCurrentLang();
  const welcome =
    welcomeLang === 'en'
      ? 'Hi! I can answer questions about my portfolio projects, like GCS Bootstrap / Live, Jellyfin or Windows Core scripts.'
      : '¡Hola! Puedo responder preguntas sobre mis proyectos del portfolio, como GCS Bootstrap / Live, Jellyfin o los scripts de Windows Core.';
  aiAddMsg(msgs, welcome, 'bot');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    aiAddMsg(msgs, text, 'me');

    const intent = aiDetectQuestionIntent(text);
    const respLang = aiResponseLang(text);

    let entry = aiFindAnswer(text);

    if (!entry && AI_LAST_REPO && (intent === 'followup' || intent === 'deploy' || intent === 'monitor' || intent === 'stack')) {
      entry = AI_KB.find(e => e.repo === AI_LAST_REPO) || null;
    }

    let preferredRepo = entry && entry.repo ? entry.repo : null;
    if (!preferredRepo && AI_LAST_REPO) {
      preferredRepo = AI_LAST_REPO;
    }

    const para = aiFindBestParagraph(text, preferredRepo, respLang, intent);

    if (!entry && !para) {
      aiAddMsg(msgs, aiDefaultAnswer(respLang), 'bot');
      return;
    }

    if (entry && entry.repo) {
      AI_LAST_REPO = entry.repo;
    } else if (preferredRepo) {
      AI_LAST_REPO = preferredRepo;
    }
    AI_LAST_INTENT = intent;

    let answer = '';

    if (entry) {
      answer = aiPickBaseAnswer(entry, respLang, intent);

      if (entry.repo) {
        if (respLang === 'en') {
          answer += `\n\nMore details in the repo:\n${entry.repo}`;
        } else {
          answer += `\n\nPuedes ver más detalles en el repositorio:\n${entry.repo}`;
        }
      }
    }

    if (para) {
      const intro =
        respLang === 'en'
          ? '\n\nExcerpt from the README:\n'
          : '\n\nFragmento del README:\n';
      const snippet = aiCondenseParagraph(para.text);
      answer += intro + snippet;
    }

    aiAddMsg(msgs, answer.trim(), 'bot');
  });
}

// Arranque: UI + carga de README en segundo plano
document.addEventListener('DOMContentLoaded', () => {
  aiInitBot();
  aiLoadDocs();
});

