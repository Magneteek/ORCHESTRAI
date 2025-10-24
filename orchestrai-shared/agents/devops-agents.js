/**
 * Deployment & DevOps Domain Specialized Agents
 *
 * This module implements 6 specialized Claude Code subagents for deployment,
 * DevOps automation, CI/CD, and infrastructure management.
 *
 * Agents:
 * 1. CICDPipelineArchitect - Designs and implements CI/CD pipelines
 * 2. DockerContainerSpecialist - Creates Docker configurations and optimizations
 * 3. KubernetesDeploymentExpert - Manages Kubernetes deployments and scaling
 * 4. CloudInfrastructureManager - Handles AWS/GCP/Azure infrastructure
 * 5. MonitoringAlertingSpecialist - Sets up monitoring, logging, and alerts
 * 6. DeploymentStrategyCoordinator - Coordinates blue-green, canary deployments
 */

const BaseSpecializedAgent = require('./base-specialized-agent');

// ============================================================================
// 1. CI/CD PIPELINE ARCHITECT
// ============================================================================

class CICDPipelineArchitect extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'cicd-pipeline-architect',
      domain: 'devops',
      capabilities: [
        'cicd-design',
        'github-actions',
        'gitlab-ci',
        'jenkins-pipelines',
        'pipeline-optimization',
        'automated-testing',
        'deployment-automation'
      ],
      description: 'Designs and implements CI/CD pipelines with automated testing and deployment',
      priority: 0.94
    });

    this.supportedPlatforms = ['github-actions', 'gitlab-ci', 'jenkins', 'circleci'];
  }

  async executeTask(task, context) {
    const {
      platform = 'github-actions',
      projectType = 'nodejs',
      includeTests = true,
      deploymentTargets = ['staging', 'production']
    } = task.parameters;

    this.log(`Designing ${platform} CI/CD pipeline for ${projectType} project`);

    // Step 1: Design pipeline stages
    const stages = await this.designPipelineStages(
      projectType,
      includeTests,
      deploymentTargets,
      context
    );

    // Step 2: Generate pipeline configuration
    const pipelineConfig = await this.generatePipelineConfig(
      platform,
      stages,
      context
    );

    // Step 3: Create deployment scripts
    const deploymentScripts = await this.createDeploymentScripts(
      deploymentTargets,
      projectType,
      context
    );

    // Step 4: Configure environment variables
    const envConfig = await this.configureEnvironmentVariables(
      deploymentTargets,
      context
    );

    // Step 5: Setup notifications
    const notifications = await this.setupNotifications(platform, context);

    return {
      pipelineConfig,
      stages,
      deploymentScripts,
      envConfig,
      notifications,
      estimatedBuildTime: this.estimateBuildTime(stages)
    };
  }

  async designPipelineStages(projectType, includeTests, deploymentTargets, context) {
    const stages = [];

    // 1. Checkout stage
    stages.push({
      name: 'checkout',
      description: 'Clone repository and checkout code',
      commands: ['git checkout $BRANCH'],
      duration: '10s'
    });

    // 2. Install dependencies
    if (projectType === 'nodejs') {
      stages.push({
        name: 'install',
        description: 'Install Node.js dependencies',
        commands: ['npm ci'],
        duration: '30s'
      });
    } else if (projectType === 'python') {
      stages.push({
        name: 'install',
        description: 'Install Python dependencies',
        commands: ['pip install -r requirements.txt'],
        duration: '20s'
      });
    }

    // 3. Linting
    stages.push({
      name: 'lint',
      description: 'Run code quality checks',
      commands: projectType === 'nodejs' ? ['npm run lint'] : ['flake8 .'],
      duration: '15s'
    });

    // 4. Testing (if enabled)
    if (includeTests) {
      stages.push({
        name: 'test',
        description: 'Run automated tests',
        commands: projectType === 'nodejs' ? ['npm test'] : ['pytest'],
        duration: '2m'
      });

      stages.push({
        name: 'coverage',
        description: 'Generate code coverage report',
        commands: projectType === 'nodejs' ? ['npm run coverage'] : ['coverage report'],
        duration: '30s'
      });
    }

    // 5. Build
    stages.push({
      name: 'build',
      description: 'Build production artifacts',
      commands: projectType === 'nodejs' ? ['npm run build'] : ['python setup.py build'],
      duration: '1m'
    });

    // 6. Security scanning
    stages.push({
      name: 'security',
      description: 'Run security vulnerability scan',
      commands: ['npm audit', 'snyk test'],
      duration: '45s'
    });

    // 7. Deployment stages
    for (const target of deploymentTargets) {
      stages.push({
        name: `deploy-${target}`,
        description: `Deploy to ${target} environment`,
        commands: [`./scripts/deploy-${target}.sh`],
        duration: '3m',
        requiresApproval: target === 'production'
      });
    }

    return stages;
  }

  async generatePipelineConfig(platform, stages, context) {
    if (platform === 'github-actions') {
      return this.generateGitHubActions(stages);
    } else if (platform === 'gitlab-ci') {
      return this.generateGitLabCI(stages);
    } else if (platform === 'jenkins') {
      return this.generateJenkinsfile(stages);
    }

    return '';
  }

  generateGitHubActions(stages) {
    let config = `name: CI/CD Pipeline\n\n`;
    config += `on:\n`;
    config += `  push:\n`;
    config += `    branches: [ main, develop ]\n`;
    config += `  pull_request:\n`;
    config += `    branches: [ main ]\n\n`;

    config += `jobs:\n`;
    config += `  build-and-deploy:\n`;
    config += `    runs-on: ubuntu-latest\n\n`;

    config += `    steps:\n`;

    for (const stage of stages) {
      config += `      - name: ${stage.name}\n`;

      if (stage.name === 'checkout') {
        config += `        uses: actions/checkout@v3\n`;
      } else {
        config += `        run: |\n`;
        for (const command of stage.commands) {
          config += `          ${command}\n`;
        }
      }

      if (stage.requiresApproval) {
        config += `        if: github.ref == 'refs/heads/main'\n`;
      }

      config += `\n`;
    }

    config += `      - name: Upload artifacts\n`;
    config += `        uses: actions/upload-artifact@v3\n`;
    config += `        with:\n`;
    config += `          name: build-artifacts\n`;
    config += `          path: dist/\n`;

    return config;
  }

  generateGitLabCI(stages) {
    let config = `stages:\n`;

    // Extract unique stage categories
    const stageCategories = ['build', 'test', 'deploy'];
    for (const category of stageCategories) {
      config += `  - ${category}\n`;
    }

    config += `\n`;

    for (const stage of stages) {
      config += `${stage.name}:\n`;

      // Determine stage category
      let category = 'build';
      if (stage.name.includes('test') || stage.name.includes('coverage')) {
        category = 'test';
      } else if (stage.name.includes('deploy')) {
        category = 'deploy';
      }

      config += `  stage: ${category}\n`;
      config += `  script:\n`;

      for (const command of stage.commands) {
        config += `    - ${command}\n`;
      }

      if (stage.requiresApproval) {
        config += `  when: manual\n`;
        config += `  only:\n`;
        config += `    - main\n`;
      }

      config += `\n`;
    }

    return config;
  }

  generateJenkinsfile(stages) {
    let config = `pipeline {\n`;
    config += `  agent any\n\n`;

    config += `  stages {\n`;

    for (const stage of stages) {
      config += `    stage('${stage.name}') {\n`;

      if (stage.requiresApproval) {
        config += `      when {\n`;
        config += `        branch 'main'\n`;
        config += `      }\n`;
      }

      config += `      steps {\n`;

      for (const command of stage.commands) {
        config += `        sh '${command}'\n`;
      }

      config += `      }\n`;
      config += `    }\n\n`;
    }

    config += `  }\n\n`;

    config += `  post {\n`;
    config += `    success {\n`;
    config += `      echo 'Pipeline succeeded!'\n`;
    config += `    }\n`;
    config += `    failure {\n`;
    config += `      echo 'Pipeline failed!'\n`;
    config += `    }\n`;
    config += `  }\n`;
    config += `}\n`;

    return config;
  }

  async createDeploymentScripts(deploymentTargets, projectType, context) {
    const scripts = {};

    for (const target of deploymentTargets) {
      scripts[target] = `#!/bin/bash
# Deployment script for ${target} environment

set -e

echo "Deploying to ${target}..."

# Load environment variables
source .env.${target}

# Build Docker image (if applicable)
if [ -f "Dockerfile" ]; then
  docker build -t myapp:${target} .
  docker push myapp:${target}
fi

# Deploy to target environment
if [ "${target}" == "staging" ]; then
  kubectl apply -f k8s/staging/
elif [ "${target}" == "production" ]; then
  # Blue-green deployment
  kubectl apply -f k8s/production/
  kubectl rollout status deployment/myapp-production
fi

echo "Deployment to ${target} completed successfully!"
`;
    }

    return scripts;
  }

  async configureEnvironmentVariables(deploymentTargets, context) {
    const envConfig = {};

    for (const target of deploymentTargets) {
      envConfig[target] = {
        required: [
          'NODE_ENV',
          'DATABASE_URL',
          'API_KEY',
          'SECRET_KEY'
        ],
        optional: [
          'REDIS_URL',
          'SENTRY_DSN',
          'LOG_LEVEL'
        ],
        example: `# Environment variables for ${target}
NODE_ENV=${target}
DATABASE_URL=postgresql://user:password@localhost:5432/db
API_KEY=\${${target.toUpperCase()}_API_KEY}
SECRET_KEY=\${${target.toUpperCase()}_SECRET_KEY}
`
      };
    }

    return envConfig;
  }

  async setupNotifications(platform, context) {
    return {
      slack: {
        enabled: true,
        webhook: '${SLACK_WEBHOOK_URL}',
        channels: ['#deployments', '#ci-cd'],
        events: ['success', 'failure']
      },
      email: {
        enabled: true,
        recipients: ['team@example.com'],
        events: ['failure']
      },
      github: {
        enabled: platform === 'github-actions',
        statusChecks: true,
        comments: true
      }
    };
  }

  estimateBuildTime(stages) {
    let totalSeconds = 0;

    for (const stage of stages) {
      const duration = stage.duration;

      if (duration.endsWith('s')) {
        totalSeconds += parseInt(duration);
      } else if (duration.endsWith('m')) {
        totalSeconds += parseInt(duration) * 60;
      }
    }

    return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
  }

  canHandle(task) {
    const keywords = ['cicd', 'ci/cd', 'pipeline', 'github actions', 'gitlab', 'jenkins'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.includeTests) priority += 0.06;
    if (task.parameters?.deploymentTargets?.includes('production')) priority += 0.1;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 2. DOCKER CONTAINER SPECIALIST
// ============================================================================

class DockerContainerSpecialist extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'docker-container-specialist',
      domain: 'devops',
      capabilities: [
        'dockerfile-creation',
        'docker-compose',
        'container-optimization',
        'multi-stage-builds',
        'image-optimization',
        'security-hardening'
      ],
      description: 'Creates optimized Docker configurations with security best practices',
      priority: 0.91
    });
  }

  async executeTask(task, context) {
    const {
      projectType = 'nodejs',
      includeCompose = true,
      optimizeSize = true,
      includeHealthcheck = true
    } = task.parameters;

    this.log(`Creating Docker configuration for ${projectType} project`);

    // Step 1: Generate Dockerfile
    const dockerfile = await this.generateDockerfile(
      projectType,
      optimizeSize,
      includeHealthcheck,
      context
    );

    // Step 2: Create docker-compose.yml
    const dockerCompose = includeCompose ?
      await this.generateDockerCompose(projectType, context) : null;

    // Step 3: Create .dockerignore
    const dockerignore = await this.generateDockerignore(projectType, context);

    // Step 4: Generate optimization recommendations
    const optimizations = await this.generateOptimizations(projectType, context);

    return {
      dockerfile,
      dockerCompose,
      dockerignore,
      optimizations,
      estimatedImageSize: this.estimateImageSize(projectType, optimizeSize)
    };
  }

  async generateDockerfile(projectType, optimizeSize, includeHealthcheck, context) {
    if (projectType === 'nodejs') {
      return this.generateNodeJsDockerfile(optimizeSize, includeHealthcheck);
    } else if (projectType === 'python') {
      return this.generatePythonDockerfile(optimizeSize, includeHealthcheck);
    }

    return '';
  }

  generateNodeJsDockerfile(optimizeSize, includeHealthcheck) {
    let dockerfile = '';

    if (optimizeSize) {
      // Multi-stage build for smaller image
      dockerfile = `# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

`;
    } else {
      // Single-stage build
      dockerfile = `FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

`;
    }

    if (includeHealthcheck) {
      dockerfile += `# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD node healthcheck.js

`;
    }

    dockerfile += `CMD ["node", "dist/index.js"]
`;

    return dockerfile;
  }

  generatePythonDockerfile(optimizeSize, includeHealthcheck) {
    let dockerfile = '';

    if (optimizeSize) {
      dockerfile = `# Build stage
FROM python:3.11-slim AS builder

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1001 appuser
USER appuser

EXPOSE 8000

`;
    } else {
      dockerfile = `FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

`;
    }

    if (includeHealthcheck) {
      dockerfile += `HEALTHCHECK --interval=30s --timeout=3s CMD python healthcheck.py || exit 1

`;
    }

    dockerfile += `CMD ["python", "app.py"]
`;

    return dockerfile;
  }

  async generateDockerCompose(projectType, context) {
    let compose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "\${PORT:-3000}:3000"
    environment:
      - NODE_ENV=\${NODE_ENV:-development}
      - DATABASE_URL=\${DATABASE_URL}
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=\${DB_NAME:-myapp}
      - POSTGRES_USER=\${DB_USER:-postgres}
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
    ports:
      - "\${DB_PORT:-5432}:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "\${REDIS_PORT:-6379}:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
`;

    return compose;
  }

  async generateDockerignore(projectType, context) {
    let ignore = `# Dependencies
node_modules/
npm-debug.log

# Build outputs
dist/
build/
*.log

# Environment files
.env
.env.*

# Development files
.git/
.gitignore
.vscode/
.idea/

# Documentation
README.md
CHANGELOG.md
docs/

# Test files
test/
tests/
*.test.js
coverage/

# CI/CD files
.github/
.gitlab-ci.yml
Jenkinsfile
`;

    if (projectType === 'python') {
      ignore += `
# Python specific
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
venv/
.pytest_cache/
`;
    }

    return ignore;
  }

  async generateOptimizations(projectType, context) {
    return [
      {
        category: 'Image Size',
        recommendations: [
          'Use Alpine-based images (smaller footprint)',
          'Implement multi-stage builds',
          'Remove dev dependencies in production',
          'Use .dockerignore to exclude unnecessary files'
        ]
      },
      {
        category: 'Build Speed',
        recommendations: [
          'Order Dockerfile commands from least to most frequently changing',
          'Leverage build cache effectively',
          'Use specific package versions to ensure consistent builds',
          'Consider using BuildKit for faster builds'
        ]
      },
      {
        category: 'Security',
        recommendations: [
          'Run container as non-root user',
          'Scan images for vulnerabilities',
          'Keep base images up to date',
          'Use secrets management (not environment variables) for sensitive data'
        ]
      },
      {
        category: 'Runtime Performance',
        recommendations: [
          'Implement health checks',
          'Set resource limits (CPU/memory)',
          'Use read-only root filesystem where possible',
          'Configure proper logging'
        ]
      }
    ];
  }

  estimateImageSize(projectType, optimizeSize) {
    const baseSizes = {
      nodejs: optimizeSize ? '150MB' : '900MB',
      python: optimizeSize ? '120MB' : '800MB'
    };

    return baseSizes[projectType] || '200MB';
  }

  canHandle(task) {
    const keywords = ['docker', 'dockerfile', 'container', 'compose'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.optimizeSize) priority += 0.09;
    if (task.parameters?.includeCompose) priority += 0.05;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 3. KUBERNETES DEPLOYMENT EXPERT
// ============================================================================

class KubernetesDeploymentExpert extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'kubernetes-deployment-expert',
      domain: 'devops',
      capabilities: [
        'kubernetes-deployment',
        'k8s-scaling',
        'helm-charts',
        'service-mesh',
        'ingress-configuration',
        'resource-management'
      ],
      description: 'Manages Kubernetes deployments, scaling, and resource optimization',
      priority: 0.90
    });
  }

  async executeTask(task, context) {
    const {
      appName,
      namespace = 'default',
      replicas = 3,
      includeIngress = true,
      includeHPA = true
    } = task.parameters;

    this.log(`Creating Kubernetes manifests for ${appName}`);

    // Step 1: Generate deployment manifest
    const deployment = await this.generateDeployment(appName, namespace, replicas, context);

    // Step 2: Generate service manifest
    const service = await this.generateService(appName, namespace, context);

    // Step 3: Generate ingress (if requested)
    const ingress = includeIngress ?
      await this.generateIngress(appName, namespace, context) : null;

    // Step 4: Generate HPA (Horizontal Pod Autoscaler)
    const hpa = includeHPA ?
      await this.generateHPA(appName, namespace, replicas, context) : null;

    // Step 5: Generate ConfigMap and Secret templates
    const configMap = await this.generateConfigMap(appName, namespace, context);
    const secret = await this.generateSecret(appName, namespace, context);

    return {
      deployment,
      service,
      ingress,
      hpa,
      configMap,
      secret
    };
  }

  async generateDeployment(appName, namespace, replicas, context) {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  namespace: ${namespace}
  labels:
    app: ${appName}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      containers:
      - name: ${appName}
        image: ${appName}:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: production
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ${appName}-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
`;
  }

  async generateService(appName, namespace, context) {
    return `apiVersion: v1
kind: Service
metadata:
  name: ${appName}
  namespace: ${namespace}
  labels:
    app: ${appName}
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: ${appName}
`;
  }

  async generateIngress(appName, namespace, context) {
    return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${appName}
  namespace: ${namespace}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - ${appName}.example.com
    secretName: ${appName}-tls
  rules:
  - host: ${appName}.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${appName}
            port:
              number: 80
`;
  }

  async generateHPA(appName, namespace, replicas, context) {
    return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${appName}
  namespace: ${namespace}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${appName}
  minReplicas: ${replicas}
  maxReplicas: ${replicas * 3}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
`;
  }

  async generateConfigMap(appName, namespace, context) {
    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${appName}-config
  namespace: ${namespace}
data:
  APP_NAME: "${appName}"
  LOG_LEVEL: "info"
  PORT: "3000"
`;
  }

  async generateSecret(appName, namespace, context) {
    return `apiVersion: v1
kind: Secret
metadata:
  name: ${appName}-secrets
  namespace: ${namespace}
type: Opaque
stringData:
  database-url: "postgresql://user:password@postgres:5432/${appName}"
  api-key: "your-api-key-here"
  secret-key: "your-secret-key-here"
`;
  }

  canHandle(task) {
    const keywords = ['kubernetes', 'k8s', 'deployment', 'helm', 'ingress'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.includeHPA) priority += 0.1;
    if (task.parameters?.replicas > 5) priority += 0.05;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 4-6: Additional DevOps Agents (simplified for space)
// ============================================================================

class CloudInfrastructureManager extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'cloud-infrastructure-manager',
      domain: 'devops',
      capabilities: [
        'aws-infrastructure',
        'gcp-infrastructure',
        'azure-infrastructure',
        'terraform',
        'cloudformation',
        'infrastructure-as-code'
      ],
      description: 'Manages cloud infrastructure with Terraform and CloudFormation',
      priority: 0.89
    });
  }

  async executeTask(task, context) {
    const { provider = 'aws', resources = [] } = task.parameters;

    const terraform = await this.generateTerraform(provider, resources, context);

    return {
      terraform,
      provider,
      resourceCount: resources.length
    };
  }

  async generateTerraform(provider, resources, context) {
    return `terraform {
  required_providers {
    ${provider} = {
      source  = "hashicorp/${provider}"
      version = "~> 5.0"
    }
  }
}

provider "${provider}" {
  region = var.region
}

variable "region" {
  default = "us-east-1"
}

# Example VPC resource
resource "${provider}_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
`;
  }

  canHandle(task) {
    return task.description?.toLowerCase().includes('infrastructure');
  }

  getPriority(task, context) {
    return this.basePriority;
  }
}

class MonitoringAlertingSpecialist extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'monitoring-alerting-specialist',
      domain: 'devops',
      capabilities: [
        'prometheus-monitoring',
        'grafana-dashboards',
        'alerting',
        'log-aggregation',
        'metrics-collection',
        'slo-sli-tracking'
      ],
      description: 'Sets up monitoring, logging, alerting, and observability',
      priority: 0.88
    });
  }

  async executeTask(task, context) {
    const { platform = 'prometheus' } = task.parameters;

    const config = await this.generateMonitoringConfig(platform, context);

    return {
      config,
      platform
    };
  }

  async generateMonitoringConfig(platform, context) {
    return `# Prometheus Configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['localhost:3000']
`;
  }

  canHandle(task) {
    return task.description?.toLowerCase().includes('monitoring');
  }

  getPriority(task, context) {
    return this.basePriority;
  }
}

class DeploymentStrategyCoordinator extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'deployment-strategy-coordinator',
      domain: 'devops',
      capabilities: [
        'blue-green-deployment',
        'canary-deployment',
        'rolling-update',
        'deployment-orchestration',
        'rollback-strategy'
      ],
      description: 'Coordinates deployment strategies with zero-downtime',
      priority: 0.87
    });
  }

  async executeTask(task, context) {
    const { strategy = 'blue-green' } = task.parameters;

    const plan = await this.createDeploymentPlan(strategy, context);

    return {
      strategy,
      plan
    };
  }

  async createDeploymentPlan(strategy, context) {
    return {
      strategy,
      steps: [
        'Deploy new version',
        'Run smoke tests',
        'Switch traffic',
        'Monitor metrics'
      ]
    };
  }

  canHandle(task) {
    return task.description?.toLowerCase().includes('deployment');
  }

  getPriority(task, context) {
    return this.basePriority;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  CICDPipelineArchitect,
  DockerContainerSpecialist,
  KubernetesDeploymentExpert,
  CloudInfrastructureManager,
  MonitoringAlertingSpecialist,
  DeploymentStrategyCoordinator
};
