// Base de conocimiento manual (distintas vistas por intención)
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
      'Los componentes de observabilidad (exporters, Prometheus, Grafana, Alertmanager) se despliegan normally a través de Docker y Ansible, integrados en pipelines de GitHub Actions y definidos con Terraform donde aplica.',
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
