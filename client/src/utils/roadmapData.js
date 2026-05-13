export const ROADMAPS = {
  'full-stack': {
    label: 'Full-Stack Developer',
    icon: '🚀',
    color: '#667eea',
    sections: [
      { section: 'Frontend', color: '#4facfe', icon: '🎨', topics: ['HTML & Semantic Markup', 'CSS & Flexbox/Grid', 'JavaScript ES6+', 'React Fundamentals', 'State Management', 'TypeScript', 'Tailwind CSS', 'Testing (Jest/RTL)', 'Performance Optimization', 'Accessibility (a11y)'] },
      { section: 'Backend', color: '#f5576c', icon: '⚙️', topics: ['Node.js & Express', 'REST API Design', 'Authentication (JWT/OAuth)', 'Input Validation', 'Error Handling', 'File Uploads', 'WebSockets', 'GraphQL Basics', 'Caching (Redis)', 'Rate Limiting & Security'] },
      { section: 'Database', color: '#43e97b', icon: '🗄️', topics: ['MongoDB & Mongoose', 'SQL Fundamentals', 'PostgreSQL', 'Database Design', 'Indexing & Optimization', 'ORMs (Prisma/Sequelize)', 'Migrations', 'Redis'] },
      { section: 'DevOps & Tools', color: '#f093fb', icon: '🚀', topics: ['Git & GitHub', 'Docker Basics', 'CI/CD Pipelines', 'Linux Command Line', 'Nginx/Reverse Proxy', 'AWS/Cloud Basics', 'Monitoring & Logging', 'Environment Management'] },
      { section: 'CS Fundamentals', color: '#fee140', icon: '🧠', topics: ['Data Structures', 'Algorithms', 'System Design Basics', 'Design Patterns', 'Networking (HTTP/DNS)', 'OS Concepts'] },
    ]
  },
  'frontend': {
    label: 'Frontend Developer',
    icon: '🎨',
    color: '#4facfe',
    sections: [
      { section: 'HTML & CSS', color: '#f5576c', icon: '📄', topics: ['HTML5 Semantic Elements', 'CSS Box Model', 'Flexbox Layout', 'CSS Grid', 'Responsive Design', 'CSS Variables', 'Animations & Transitions', 'Sass/SCSS', 'BEM Methodology', 'CSS-in-JS'] },
      { section: 'JavaScript', color: '#f7df1e', icon: '⚡', topics: ['ES6+ Syntax', 'DOM Manipulation', 'Event Handling', 'Promises & Async/Await', 'Closures & Scope', 'Prototypes & Classes', 'Modules (ESM)', 'Error Handling', 'Fetch API', 'Web Storage'] },
      { section: 'React', color: '#61dafb', icon: '⚛️', topics: ['JSX & Components', 'Props & State', 'Hooks (useState, useEffect)', 'Context API', 'Custom Hooks', 'React Router', 'Forms & Validation', 'Performance (memo, useMemo)', 'Suspense & Lazy Loading', 'Server Components'] },
      { section: 'Styling & UI', color: '#43e97b', icon: '🎨', topics: ['Tailwind CSS', 'Framer Motion', 'Component Libraries (shadcn)', 'Design Systems', 'Figma to Code', 'Dark Mode', 'Accessibility (ARIA)', 'Mobile-First Design'] },
      { section: 'Tools & Testing', color: '#f093fb', icon: '🛠️', topics: ['Vite / Webpack', 'TypeScript', 'ESLint & Prettier', 'Jest & React Testing Library', 'Cypress E2E', 'Storybook', 'Chrome DevTools', 'Lighthouse Audits'] },
      { section: 'Advanced', color: '#667eea', icon: '🔥', topics: ['Next.js / SSR', 'PWA', 'Web Workers', 'WebSockets', 'State Management (Zustand/Redux)', 'Micro-Frontends', 'SEO Optimization', 'Internationalization (i18n)'] },
    ]
  },
  'backend': {
    label: 'Backend Developer',
    icon: '⚙️',
    color: '#f5576c',
    sections: [
      { section: 'Language & Runtime', color: '#43e97b', icon: '💻', topics: ['Node.js Fundamentals', 'Python Basics', 'Go Basics', 'TypeScript', 'Package Management (npm/pip)', 'Environment Variables', 'Process Management', 'Error Handling Patterns'] },
      { section: 'APIs & Frameworks', color: '#4facfe', icon: '🔌', topics: ['Express.js', 'REST API Design', 'GraphQL', 'gRPC Basics', 'API Versioning', 'Rate Limiting', 'CORS', 'API Documentation (Swagger)', 'Middleware Patterns', 'WebSockets'] },
      { section: 'Databases', color: '#f59e0b', icon: '🗄️', topics: ['SQL (PostgreSQL/MySQL)', 'MongoDB', 'Redis (Caching)', 'Database Design & Normalization', 'Indexing & Query Optimization', 'ORMs (Prisma/Sequelize/SQLAlchemy)', 'Migrations', 'Transactions', 'Replication & Sharding'] },
      { section: 'Authentication & Security', color: '#f5576c', icon: '🔐', topics: ['JWT Tokens', 'OAuth 2.0', 'Session Management', 'Password Hashing (bcrypt)', 'HTTPS/TLS', 'Input Sanitization', 'SQL Injection Prevention', 'XSS/CSRF Protection', 'RBAC (Role-Based Access)'] },
      { section: 'Architecture', color: '#667eea', icon: '🏗️', topics: ['MVC Pattern', 'Microservices', 'Event-Driven Architecture', 'Message Queues (RabbitMQ/Kafka)', 'CQRS Pattern', 'Domain-Driven Design', 'Clean Architecture', 'Serverless Functions'] },
      { section: 'DevOps & Deployment', color: '#f093fb', icon: '🚀', topics: ['Docker & Containers', 'CI/CD Pipelines', 'Nginx & Reverse Proxy', 'PM2 / Process Managers', 'Logging (Winston/Pino)', 'Monitoring (Prometheus)', 'Load Balancing', 'Cloud Deployment (AWS/GCP)'] },
    ]
  },
  'mobile': {
    label: 'Mobile Developer',
    icon: '📱',
    color: '#43e97b',
    sections: [
      { section: 'React Native', color: '#61dafb', icon: '⚛️', topics: ['React Native Setup', 'Core Components (View, Text, Image)', 'StyleSheet & Flexbox', 'Navigation (React Navigation)', 'State Management', 'Platform-Specific Code', 'Custom Hooks', 'Animations (Reanimated)', 'Gesture Handler', 'Expo vs Bare'] },
      { section: 'Flutter (Alternative)', color: '#02569B', icon: '🦋', topics: ['Dart Language', 'Widgets (Stateless/Stateful)', 'Layouts', 'Navigation & Routing', 'State Management (Provider/Riverpod)', 'Animations', 'Platform Channels', 'Packages & Plugins'] },
      { section: 'Native Features', color: '#43e97b', icon: '📲', topics: ['Camera & Gallery', 'Push Notifications', 'Local Storage (AsyncStorage/SQLite)', 'Geolocation', 'Biometric Auth', 'Deep Linking', 'Background Tasks', 'File System Access', 'Bluetooth/NFC'] },
      { section: 'APIs & Backend', color: '#f59e0b', icon: '🔌', topics: ['REST API Integration', 'Firebase (Auth, Firestore, Storage)', 'GraphQL Client', 'Offline-First Architecture', 'WebSocket Real-time', 'Image Upload', 'Payment Integration'] },
      { section: 'Testing & Deployment', color: '#f5576c', icon: '🚀', topics: ['Unit Testing (Jest)', 'Component Testing', 'E2E Testing (Detox)', 'App Store Submission', 'Play Store Submission', 'Code Signing', 'OTA Updates (EAS)', 'Crash Reporting (Sentry)', 'Analytics'] },
    ]
  },
  'devops': {
    label: 'DevOps Engineer',
    icon: '☁️',
    color: '#f093fb',
    sections: [
      { section: 'Linux & Scripting', color: '#f59e0b', icon: '🐧', topics: ['Linux Fundamentals', 'Bash Scripting', 'File Permissions', 'Process Management', 'Networking (TCP/IP, DNS)', 'SSH & Keys', 'Cron Jobs', 'System Monitoring'] },
      { section: 'Containers', color: '#4facfe', icon: '🐳', topics: ['Docker Fundamentals', 'Dockerfile Best Practices', 'Docker Compose', 'Container Networking', 'Volume Management', 'Multi-Stage Builds', 'Container Security', 'Registry (Docker Hub/ECR)'] },
      { section: 'Orchestration', color: '#326ce5', icon: '☸️', topics: ['Kubernetes Basics', 'Pods & Deployments', 'Services & Ingress', 'ConfigMaps & Secrets', 'Helm Charts', 'Scaling (HPA)', 'Monitoring (Prometheus/Grafana)', 'Service Mesh (Istio)'] },
      { section: 'CI/CD', color: '#43e97b', icon: '🔄', topics: ['GitHub Actions', 'Jenkins', 'GitLab CI', 'Build Pipelines', 'Testing in CI', 'Deployment Strategies (Blue-Green, Canary)', 'Artifact Management', 'Infrastructure as Code'] },
      { section: 'Cloud (AWS)', color: '#ff9900', icon: '☁️', topics: ['EC2 & VPC', 'S3 & CloudFront', 'RDS & DynamoDB', 'Lambda & API Gateway', 'IAM & Security', 'ECS/EKS', 'CloudWatch', 'Terraform', 'Cost Optimization'] },
      { section: 'Monitoring & Security', color: '#f5576c', icon: '🔒', topics: ['Logging (ELK Stack)', 'Metrics & Alerting', 'Incident Response', 'Secrets Management (Vault)', 'Network Security', 'SSL/TLS Certificates', 'Vulnerability Scanning', 'Compliance (SOC2)'] },
    ]
  },
  'ml': {
    label: 'ML / Data Science',
    icon: '🤖',
    color: '#06b6d4',
    sections: [
      { section: 'Python & Math', color: '#3776ab', icon: '🐍', topics: ['Python Advanced', 'NumPy', 'Pandas', 'Matplotlib/Seaborn', 'Linear Algebra', 'Probability & Statistics', 'Calculus Basics', 'Jupyter Notebooks'] },
      { section: 'Machine Learning', color: '#f59e0b', icon: '🧠', topics: ['Supervised Learning', 'Unsupervised Learning', 'Linear/Logistic Regression', 'Decision Trees & Random Forest', 'SVM', 'K-Means Clustering', 'Feature Engineering', 'Model Evaluation (Precision/Recall)', 'Cross-Validation', 'Scikit-Learn'] },
      { section: 'Deep Learning', color: '#f5576c', icon: '🔥', topics: ['Neural Networks Basics', 'TensorFlow / PyTorch', 'CNNs (Image)', 'RNNs & LSTMs (Sequence)', 'Transfer Learning', 'GANs', 'Transformers & Attention', 'Model Optimization', 'GPU Training'] },
      { section: 'NLP', color: '#43e97b', icon: '💬', topics: ['Text Preprocessing', 'Word Embeddings (Word2Vec)', 'Sentiment Analysis', 'Named Entity Recognition', 'Hugging Face Transformers', 'BERT/GPT Fine-tuning', 'LangChain Basics', 'RAG (Retrieval Augmented Generation)'] },
      { section: 'MLOps & Deployment', color: '#667eea', icon: '🚀', topics: ['Model Versioning (MLflow)', 'Data Pipelines', 'Model Serving (FastAPI/Flask)', 'Docker for ML', 'Cloud ML (AWS SageMaker)', 'A/B Testing Models', 'Monitoring Model Drift', 'CI/CD for ML'] },
    ]
  },
};
