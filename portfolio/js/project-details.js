/**
 * Detailed information database for Experience and Projects.
 * Used to populate the detail modal when cards are clicked.
 * Includes detailed reasons, architecture details, and local screenshots.
 */

const PROJECT_DETAILS = {
  // --- Experience ---
  'ourora': {
    title: 'Founding Engineer',
    subtitle: 'Ourora',
    duration: 'Feb 2026 – Present',
    tags: ['Flutter', 'Dart', 'WebRTC', 'Encryption', 'Firebase'],
    description: 'Leading Flutter development for Android & iOS at a privacy-first couples app, in close collaboration with the founder. Owning architecture decisions for encrypted chat, voice/video, and shared media vault systems.',
    why: 'Intimate communication should be genuinely private. Traditional messaging apps sell data and don\'t provide strong, opt-in privacy boundaries for couples. We wanted to build a secure space where intimate chat, calls, and shared memories are fully encrypted and private by design.',
    features: [
      'Architected end-to-end encrypted messaging systems and shared media vaults.',
      'Designed and integrated WebRTC-based real-time voice and video calling.',
      'Collaborated closely with the founder to set technical roadmap and product strategy.',
      'Shipped rapid weekly iterations from initial wireframes to a launched beta app.'
    ],
    images: [],
    links: [
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.ourora.connect&hl=en_IN', icon: 'play' },
      { label: 'Launch X Post', url: 'https://x.com/0p3nsky_/status/2055249561841795282', icon: 'twitter' },
      { label: 'Website', url: 'https://ourora.in', icon: 'external' }
    ]
  },
  'khwaaish': {
    title: 'Lead Flutter Developer',
    subtitle: 'Khwaaish AI / Eastri',
    duration: 'Oct 2025 – Present',
    tags: ['Flutter', 'AI Agents', 'System Design', 'API Integration'],
    description: 'Developing a personal AI agent mobile application for autonomous cross-app booking/purchasing, and maintaining a Laundry services app.',
    why: 'Autonomous AI agents are normally restricted to CLI tools or web consoles. Khwaaish brings that power directly into a consumer\'s pocket, letting users instruct an agent to order, book, or buy across multiple mobile platforms autonomously.',
    features: [
      'Khwaaish AI: Architected mobile app integrating multi-service APIs for autonomous AI bookings.',
      'Designed system flows enabling local execution of prompt schedules.',
      'Eastri: Optimizing laundry services app connecting local service providers with customers.',
      'Worked with the founder to build product strategy, system design, and rapid sprint cycles.'
    ],
    images: [],
    links: [
      { label: 'Khwaaish AI', url: 'https://www.linkedin.com/company/khwaaish/', icon: 'external' },
      { label: 'Eastri', url: 'https://www.linkedin.com/company/eastri/', icon: 'external' }
    ]
  },
  'sociante': {
    title: 'SDE (Flutter) Intern',
    subtitle: 'Sociante Pvt Ltd',
    duration: 'Oct 2024 – Apr 2025',
    tags: ['Flutter', 'Google Maps API', 'Razorpay SDK', 'Figma'],
    description: 'Enhanced user engagement by 20% and operational efficiency by 15% via Customer/Merchant apps (40+ screens) for an Automated Parking Management System.',
    why: 'Navigating, parking, and checking out at crowded venues is highly friction-filled. We wanted to build a merchant-customer ecosystem where parking spaces are discoverable in real-time, payments are handled seamlessly, and tickets are fully digitized.',
    features: [
      'Crafted over 40 highly responsive UI screens in Flutter based on custom Figma templates.',
      'Integrated Google Maps API for plaza location search, status, and navigation routing.',
      'Engineered backend integration for vehicle tracking and payment ticketing.',
      'Integrated Razorpay SDK for seamless, cashless ticket checkout.'
    ],
    images: [],
    links: [
      { label: 'Internship Certificate', url: 'https://drive.google.com/file/d/1NO2Im8o_qOnMwfTwqbFCPNMqVFYMAkYi/view?usp=sharing', icon: 'external' }
    ]
  },

  // --- Featured Projects ---
  'parallax-connect': {
    title: 'Parallax Connect',
    subtitle: 'Hackathon Winner',
    duration: 'Jan 2026',
    tags: ['Flutter', 'Dart', 'Python', 'FastAPI', 'Local AI', 'OCR'],
    description: 'Winner at Gradient Network Hackathon 2026. A mobile app for local AI featuring chat, vision/OCR, and web search capabilities, routing processing securely between mobile and server.',
    why: 'Running open-source LLMs locally on your home GPU is incredible, but it normally pins you to your desktop. I built Parallax Connect to serve as a personal, secure mobile bridge. You can leave your local computer running your AI models, and access them securely from your phone anywhere in the world without paying API subscription costs or relying on proprietary cloud backends.',
    reason: 'Traditional AI assistants operate on centralized cloud infrastructures, meaning your data, conversations, and document contents are uploaded to third-party servers. This poses massive privacy risks and high recurrent costs. Parallax Connect solves this by keeping your data entirely local, routing connections through a password-protected FastAPI middleware tunnel directly to your local GPU.',
    architecture: 'The application uses a 3-tier architecture:\n\n1. Mobile Frontend (Flutter): Offers a premium UI with real-time SSE chat streaming, vision capture, history export, and terminal QR scanner connection.\n2. Middleware Server (FastAPI): Coordinates advanced capabilities like Google/Brave query routing, PDF parsing (PyMuPDF), and hybrid OCR management.\n3. Local GPU Inference Engine (Parallax / Ollama): Serves open-source LLMs (like Llama 3, Phi 3) on your hardware.',
    tech: 'Built using:\n\n- Flutter & Dart: Cross-platform mobile client handling local state, markdown rendering, on-device ML Kit OCR, and responsive styling.\n- Python & FastAPI: Lightweight web server running on the host machine. Implements SSE (Server-Sent Events) streaming, DuckDuckGo/Brave scraper pipelines, and PyMuPDF document extraction.\n- Docker & Ngrok/Localtunnel: For exposing the local server to the internet securely via password authentication.',
    images: [
      { url: 'images/parallax-connect/architecture.png', caption: 'System Architecture Flow diagram' },
      { url: 'images/parallax-connect/Qr_plus_normal_chat.gif', caption: 'Scanning QR Code to launch mobile chat' },
      { url: 'images/parallax-connect/private_chat.gif', caption: 'Local streaming chat in action' },
      { url: 'images/parallax-connect/settings.gif', caption: 'Middleware settings and mode configurations' },
      { url: 'images/parallax-connect/export.gif', caption: 'Exporting history and options' }
    ],
    links: [
      { label: 'GitHub Source', url: 'https://github.com/ManishModak/parallax-connect-mobile', icon: 'github' },
      { label: 'YouTube Demo', url: 'https://youtu.be/1G5gAEA_tz8', icon: 'demo' }
    ]
  },
  'necro-pet': {
    title: 'Necro-Pet: Undead Coding Companion',
    subtitle: 'Desktop Virtual Pet',
    duration: 'Jan 2026',
    tags: ['Electron', 'TypeScript', 'Node.js', 'Pixel Art', 'MCP'],
    description: 'Desktop virtual pet that gamifies your coding workflow — file saves feed the pet, neglect causes it to die.',
    why: 'Writing code for hours can get lonely and repetitive. I wanted to add some visual progression and fun feedback. I built Necro-Pet as a lightweight companion that reacts to actual filesystem saves, giving you a reason to keep coding to keep your pet alive.',
    reason: 'Traditional virtual pets are restricted to mobile apps or standalone gadgets that feel separated from a developer\'s real workflow, turning into a distraction. Necro-Pet directly links the pet\'s health and evolution stage to filesystem events (such as Git commits and file saves) in your active workspace, transforming coding activity into a fun pet-raising game.',
    architecture: 'The system operates through:\n\n1. Desktop App (Electron + React): Renders a retro 8-bit companion frame with nostalgic CRT scanline effects.\n2. File Watcher Daemon: Monitors local workspace directories for saves, builds, and code additions, converting them to \'food\' and \'experience\' points.\n3. Open-Meteo Weather Integration: Synchronizes the virtual pet\'s environment weather (clear, rain, snow, storm) with your real physical location.',
    tech: 'Built using:\n\n- Electron: Enables the overlay companion to float smoothly on your desktop.\n- TypeScript & React: Renders the state and triggers custom pixel animations for each phase.\n- MCP (Model Context Protocol): Uses Open-Meteo weather APIs to match desktop visual theme weather to real-world coordinates.\n- Node.js FS API: Performs low-overhead directory and file change monitoring.',
    images: [
      { url: 'images/necro-pet/demo-optimized.gif', caption: 'Necro-Pet companion active on desktop' },
      { url: 'images/necro-pet/egg.gif', caption: 'Egg Stage: resting and waiting for filesystem saves to hatch' },
      { url: 'images/necro-pet/larva.gif', caption: 'Larva Stage: wiggling and crawling companion' },
      { url: 'images/necro-pet/beast.gif', caption: 'Beast Stage: evolved pet for high activity' },
      { url: 'images/necro-pet/ghost.gif', caption: 'Ghost Stage: when you stop saving files, it dies and haunts you' }
    ],
    links: [
      { label: 'GitHub Source', url: 'https://github.com/ManishModak/necro-pet', icon: 'github' },
      { label: 'YouTube Demo', url: 'https://youtu.be/VSRB3CIGBws', icon: 'demo' }
    ]
  },
  'data-hive': {
    title: 'Data Hive',
    subtitle: 'Containerized Emulation',
    duration: 'Late 2025',
    tags: ['Docker', 'Node.js', 'Web Scraping', 'Docker Compose'],
    description: 'Reverse-engineered a browser extension and containerized it to run headless on Docker.',
    why: 'Many useful browser extension tools require leaving a GUI browser window open continuously, which consumes massive RAM and CPU. I wanted to run a specific extension headless 24/7 on a home server, so I containerized its client communication protocol.',
    reason: 'Eliminating resource-heavy browser windows while retaining data-scraping capabilities.',
    architecture: 'Emulates browser-websocket Handshake via headless Node.js client running in Docker.',
    tech: 'Built using Docker, Node.js, WebSockets, and Docker Compose.',
    images: [],
    links: [
      { label: 'GitHub Source', url: 'https://github.com/ManishModak/data_hive', icon: 'github' }
    ]
  },
  'specgen-chatbot': {
    title: 'SpecGen Chatbot',
    subtitle: 'AI Specification Generator',
    duration: 'In Progress',
    tags: ['Flutter', 'Python', 'FastAPI', 'Crawl4AI', 'LLMs'],
    description: 'AI-powered product specification generator with Crawl4AI scraper integration.',
    why: 'Writing product spec sheets by reading long articles, feature lists, and doc sheets manually is highly tedious. I wanted a simple chat interface where I drop a link, and the system extracts, structures, and compiles a comprehensive specification sheet instantly.',
    reason: 'Manual collection of specifications from complex landing pages takes hours.',
    architecture: 'Flutter frontend queries Python FastAPI backend running Crawl4AI parsing pipelines.',
    tech: 'Built using Flutter, Python, FastAPI, and Crawl4AI.',
    images: [],
    links: [
      { label: 'GitHub Source', url: 'https://github.com/ManishModak/specgen-chatbot', icon: 'github' }
    ]
  }
};

window.PROJECT_DETAILS = PROJECT_DETAILS;
