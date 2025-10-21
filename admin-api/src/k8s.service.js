const k8s = require('@kubernetes/client-node');

class KubernetesService {
  constructor() {
    this.kc = new k8s.KubeConfig();

    // Load kubeconfig - tries in-cluster first, then local
    try {
      this.kc.loadFromCluster();
      console.log('✅ Loaded Kubernetes config from cluster');
    } catch (e) {
      try {
        this.kc.loadFromDefault();
        console.log('✅ Loaded Kubernetes config from default');
      } catch (err) {
        console.error('❌ Failed to load Kubernetes config:', err.message);
        throw err;
      }
    }

    this.coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
    this.exec = new k8s.Exec(this.kc);
  }

  /**
   * List all pods across specified namespaces
   * @param {string[]} namespaces - Array of namespace names to query
   * @returns {Promise<Array>} Array of pod objects
   */
  async listPods(namespaces = ['librechat', 'snow-mcp', 'default']) {
    try {
      const allPods = [];

      for (const namespace of namespaces) {
        try {
          const response = await this.coreApi.listNamespacedPod(namespace);
          const pods = response.body.items.map(pod => this.formatPodInfo(pod));
          allPods.push(...pods);
        } catch (err) {
          console.error(`Error listing pods in namespace ${namespace}:`, err.message);
          // Continue with other namespaces even if one fails
        }
      }

      return allPods;
    } catch (error) {
      console.error('Error listing pods:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific pod
   * @param {string} namespace - Namespace name
   * @param {string} podName - Pod name
   * @returns {Promise<Object>} Pod details
   */
  async getPod(namespace, podName) {
    try {
      const response = await this.coreApi.readNamespacedPod(podName, namespace);
      return this.formatPodInfo(response.body);
    } catch (error) {
      console.error(`Error getting pod ${namespace}/${podName}:`, error.message);
      throw error;
    }
  }

  /**
   * Get logs from a specific pod
   * @param {string} namespace - Namespace name
   * @param {string} podName - Pod name
   * @param {Object} options - Log options (tailLines, timestamps, etc.)
   * @returns {Promise<string>} Pod logs
   */
  async getPodLogs(namespace, podName, options = {}) {
    try {
      const {
        tailLines = 100,
        timestamps = true,
        container = null,
      } = options;

      const logOptions = {
        follow: false,
        tailLines: tailLines,
        timestamps: timestamps,
      };

      if (container) {
        logOptions.container = container;
      }

      const response = await this.coreApi.readNamespacedPodLog(
        podName,
        namespace,
        container,
        logOptions.follow,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        logOptions.tailLines,
        logOptions.timestamps
      );

      return response.body;
    } catch (error) {
      console.error(`Error getting logs for ${namespace}/${podName}:`, error.message);
      throw error;
    }
  }

  /**
   * Stream logs from a specific pod (returns a stream)
   * @param {string} namespace - Namespace name
   * @param {string} podName - Pod name
   * @param {Object} options - Log options
   * @returns {Promise<Stream>} Log stream
   */
  async streamPodLogs(namespace, podName, options = {}) {
    try {
      const {
        tailLines = 100,
        timestamps = true,
        container = null,
      } = options;

      const logStream = new k8s.Log(this.kc);

      return await logStream.log(
        namespace,
        podName,
        container,
        process.stdout, // We'll pipe this to response in the endpoint
        {
          follow: true,
          tailLines: tailLines,
          timestamps: timestamps,
        }
      );
    } catch (error) {
      console.error(`Error streaming logs for ${namespace}/${podName}:`, error.message);
      throw error;
    }
  }

  /**
   * Format pod information for consistent API responses
   * @private
   */
  formatPodInfo(pod) {
    const containerStatuses = pod.status.containerStatuses || [];
    const conditions = pod.status.conditions || [];

    // Determine pod status
    let status = 'Unknown';
    let statusReason = '';

    if (pod.status.phase === 'Running') {
      const allReady = containerStatuses.every(c => c.ready);
      status = allReady ? 'Running' : 'Not Ready';
    } else {
      status = pod.status.phase;
      const failedCondition = conditions.find(c => c.status === 'False');
      if (failedCondition) {
        statusReason = failedCondition.reason || failedCondition.message;
      }
    }

    // Calculate age
    const createdAt = new Date(pod.metadata.creationTimestamp);
    const age = this.calculateAge(createdAt);

    // Get restart count
    const restarts = containerStatuses.reduce((sum, c) => sum + (c.restartCount || 0), 0);

    return {
      id: `${pod.metadata.namespace}::${pod.metadata.name}`,
      name: pod.metadata.name,
      namespace: pod.metadata.namespace,
      status: status,
      statusReason: statusReason,
      phase: pod.status.phase,
      ready: containerStatuses.filter(c => c.ready).length + '/' + containerStatuses.length,
      restarts: restarts,
      age: age,
      createdAt: createdAt.toISOString(),
      ip: pod.status.podIP || 'N/A',
      node: pod.spec.nodeName || 'N/A',
      containers: containerStatuses.map(c => ({
        name: c.name,
        ready: c.ready,
        restartCount: c.restartCount,
        image: c.image,
        state: Object.keys(c.state || {})[0],
      })),
      labels: pod.metadata.labels || {},
    };
  }

  /**
   * Calculate human-readable age from timestamp
   * @private
   */
  calculateAge(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }

  /**
   * List all deployments across specified namespaces
   * @param {string[]} namespaces - Array of namespace names to query
   * @returns {Promise<Array>} Array of deployment objects
   */
  async listDeployments(namespaces = ['librechat', 'snow-mcp', 'default']) {
    try {
      const allDeployments = [];

      for (const namespace of namespaces) {
        try {
          const response = await this.appsApi.listNamespacedDeployment(namespace);
          const deployments = response.body.items.map(deployment => this.formatDeploymentInfo(deployment));
          allDeployments.push(...deployments);
        } catch (err) {
          console.error(`Error listing deployments in namespace ${namespace}:`, err.message);
          // Continue with other namespaces even if one fails
        }
      }

      return allDeployments;
    } catch (error) {
      console.error('Error listing deployments:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific deployment
   * @param {string} namespace - Namespace name
   * @param {string} deploymentName - Deployment name
   * @returns {Promise<Object>} Deployment details
   */
  async getDeployment(namespace, deploymentName) {
    try {
      const response = await this.appsApi.readNamespacedDeployment(deploymentName, namespace);
      return this.formatDeploymentInfo(response.body);
    } catch (error) {
      console.error(`Error getting deployment ${namespace}/${deploymentName}:`, error.message);
      throw error;
    }
  }

  /**
   * Restart a deployment by updating its annotations
   * @param {string} namespace - Namespace name
   * @param {string} deploymentName - Deployment name
   * @returns {Promise<Object>} Updated deployment info
   */
  async restartDeployment(namespace, deploymentName) {
    try {
      const now = new Date().toISOString();

      // Patch the deployment to trigger a rollout restart
      const patch = {
        spec: {
          template: {
            metadata: {
              annotations: {
                'kubectl.kubernetes.io/restartedAt': now
              }
            }
          }
        }
      };

      const options = {
        headers: { 'Content-Type': 'application/strategic-merge-patch+json' }
      };

      const response = await this.appsApi.patchNamespacedDeployment(
        deploymentName,
        namespace,
        patch,
        undefined,
        undefined,
        undefined,
        undefined,
        options
      );

      return this.formatDeploymentInfo(response.body);
    } catch (error) {
      console.error(`Error restarting deployment ${namespace}/${deploymentName}:`, error.message);
      throw error;
    }
  }

  /**
   * Execute a kubectl-like command using Kubernetes API
   * @param {string} command - Command to execute
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Command execution result
   */
  async executeKubectlCommand(command, options = {}) {
    try {
      const { namespace = 'default', allowedCommands = ['get', 'describe', 'logs', 'top', 'explain'] } = options;

      // Parse and validate command
      const commandParts = command.trim().split(/\s+/);
      const mainCommand = commandParts[0];
      const resourceType = commandParts[1];
      const resourceName = commandParts[2];

      // Security: Only allow safe read-only commands
      if (!allowedCommands.includes(mainCommand)) {
        throw new Error(`Command '${mainCommand}' is not allowed. Allowed commands: ${allowedCommands.join(', ')}`);
      }

      // Execute the command using Kubernetes API
      const result = await this.executeK8sCommand(mainCommand, resourceType, resourceName, namespace);

      return {
        command: command,
        namespace: namespace,
        output: result.output,
        error: result.error || '',
        exitCode: result.exitCode,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error executing kubectl command '${command}':`, error.message);
      return {
        command: command,
        namespace: namespace,
        output: '',
        error: error.message,
        exitCode: 1,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute Kubernetes API command
   * @private
   */
  async executeK8sCommand(command, resourceType, resourceName, namespace) {
    try {
      switch (command) {
        case 'get':
          return await this.handleGetCommand(resourceType, resourceName, namespace);
        case 'describe':
          return await this.handleDescribeCommand(resourceType, resourceName, namespace);
        case 'logs':
          return await this.handleLogsCommand(resourceType, namespace);
        case 'explain':
          return await this.handleExplainCommand(resourceType);
        default:
          throw new Error(`Command '${command}' not implemented`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle 'get' command
   * @private
   */
  async handleGetCommand(resourceType, resourceName, namespace) {
    try {
      let output = '';

      if (resourceType === 'pods') {
        const response = await this.coreApi.listNamespacedPod(namespace);
        const pods = response.body.items;

        if (resourceName) {
          const pod = pods.find(p => p.metadata.name === resourceName);
          if (!pod) {
            throw new Error(`Pod "${resourceName}" not found`);
          }
          output = JSON.stringify(pod, null, 2);
        } else {
          output = this.formatPodsTable(pods);
        }
      } else if (resourceType === 'deployments') {
        const response = await this.appsApi.listNamespacedDeployment(namespace);
        const deployments = response.body.items;

        if (resourceName) {
          const deployment = deployments.find(d => d.metadata.name === resourceName);
          if (!deployment) {
            throw new Error(`Deployment "${resourceName}" not found`);
          }
          output = JSON.stringify(deployment, null, 2);
        } else {
          output = this.formatDeploymentsTable(deployments);
        }
      } else if (resourceType === 'services' || resourceType === 'svc') {
        const response = await this.coreApi.listNamespacedService(namespace);
        const services = response.body.items;

        if (resourceName) {
          const service = services.find(s => s.metadata.name === resourceName);
          if (!service) {
            throw new Error(`Service "${resourceName}" not found`);
          }
          output = JSON.stringify(service, null, 2);
        } else {
          output = this.formatServicesTable(services);
        }
      } else {
        throw new Error(`Resource type '${resourceType}' not supported. Try: pods, deployments, services`);
      }

      return { output, exitCode: 0 };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle 'describe' command
   * @private
   */
  async handleDescribeCommand(resourceType, resourceName, namespace) {
    try {
      if (!resourceName) {
        throw new Error('Resource name is required for describe command');
      }

      let output = '';

      if (resourceType === 'pod') {
        const response = await this.coreApi.readNamespacedPod(resourceName, namespace);
        output = this.formatPodDescription(response.body);
      } else if (resourceType === 'deployment') {
        const response = await this.appsApi.readNamespacedDeployment(resourceName, namespace);
        output = this.formatDeploymentDescription(response.body);
      } else {
        throw new Error(`Resource type '${resourceType}' not supported for describe. Try: pod, deployment`);
      }

      return { output, exitCode: 0 };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle 'logs' command
   * @private
   */
  async handleLogsCommand(podName, namespace) {
    try {
      if (!podName) {
        throw new Error('Pod name is required for logs command');
      }

      const logs = await this.getPodLogs(namespace, podName, { tailLines: 100, timestamps: true });
      return { output: logs, exitCode: 0 };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle 'explain' command
   * @private
   */
  async handleExplainCommand(resourceType) {
    const explanations = {
      pod: 'Pod is the smallest deployable unit in Kubernetes. A Pod represents a single instance of a running process in your cluster.',
      deployment: 'Deployment provides declarative updates for Pods and ReplicaSets. It manages the deployment and scaling of a set of Pods.',
      service: 'Service is an abstraction which defines a logical set of Pods and a policy by which to access them.',
      namespace: 'Namespace provides a mechanism for isolating groups of resources within a single cluster.',
    };

    const output = explanations[resourceType] || `No explanation available for '${resourceType}'. Try: pod, deployment, service, namespace`;
    return { output, exitCode: 0 };
  }

  /**
   * Format pods as table
   * @private
   */
  formatPodsTable(pods) {
    const header = 'NAME'.padEnd(50) + 'READY'.padEnd(10) + 'STATUS'.padEnd(15) + 'RESTARTS'.padEnd(10) + 'AGE';
    const rows = pods.map(pod => {
      const containerStatuses = pod.status.containerStatuses || [];
      const ready = containerStatuses.filter(c => c.ready).length + '/' + containerStatuses.length;
      const restarts = containerStatuses.reduce((sum, c) => sum + (c.restartCount || 0), 0);
      const age = this.calculateAge(new Date(pod.metadata.creationTimestamp));

      return pod.metadata.name.padEnd(50) +
             ready.padEnd(10) +
             pod.status.phase.padEnd(15) +
             restarts.toString().padEnd(10) +
             age;
    });

    return header + '\n' + rows.join('\n');
  }

  /**
   * Format deployments as table
   * @private
   */
  formatDeploymentsTable(deployments) {
    const header = 'NAME'.padEnd(40) + 'READY'.padEnd(10) + 'UP-TO-DATE'.padEnd(12) + 'AVAILABLE'.padEnd(12) + 'AGE';
    const rows = deployments.map(deployment => {
      const ready = (deployment.status.readyReplicas || 0) + '/' + (deployment.spec.replicas || 0);
      const age = this.calculateAge(new Date(deployment.metadata.creationTimestamp));

      return deployment.metadata.name.padEnd(40) +
             ready.padEnd(10) +
             (deployment.status.updatedReplicas || 0).toString().padEnd(12) +
             (deployment.status.availableReplicas || 0).toString().padEnd(12) +
             age;
    });

    return header + '\n' + rows.join('\n');
  }

  /**
   * Format services as table
   * @private
   */
  formatServicesTable(services) {
    const header = 'NAME'.padEnd(40) + 'TYPE'.padEnd(20) + 'CLUSTER-IP'.padEnd(20) + 'PORT(S)';
    const rows = services.map(service => {
      const ports = (service.spec.ports || []).map(p => `${p.port}/${p.protocol}`).join(',');

      return service.metadata.name.padEnd(40) +
             service.spec.type.padEnd(20) +
             (service.spec.clusterIP || 'None').padEnd(20) +
             ports;
    });

    return header + '\n' + rows.join('\n');
  }

  /**
   * Format pod description
   * @private
   */
  formatPodDescription(pod) {
    return `Name:         ${pod.metadata.name}
Namespace:    ${pod.metadata.namespace}
Status:       ${pod.status.phase}
IP:           ${pod.status.podIP || 'N/A'}
Node:         ${pod.spec.nodeName || 'N/A'}
Start Time:   ${pod.metadata.creationTimestamp}
Labels:       ${JSON.stringify(pod.metadata.labels || {}, null, 2)}
Containers:   ${(pod.spec.containers || []).map(c => c.name).join(', ')}
`;
  }

  /**
   * Format deployment description
   * @private
   */
  formatDeploymentDescription(deployment) {
    return `Name:         ${deployment.metadata.name}
Namespace:    ${deployment.metadata.namespace}
Replicas:     ${deployment.spec.replicas} desired | ${deployment.status.updatedReplicas || 0} updated | ${deployment.status.availableReplicas || 0} available
Strategy:     ${deployment.spec.strategy.type}
Selector:     ${JSON.stringify(deployment.spec.selector.matchLabels || {}, null, 2)}
Labels:       ${JSON.stringify(deployment.metadata.labels || {}, null, 2)}
Containers:   ${(deployment.spec.template.spec.containers || []).map(c => `${c.name} (${c.image})`).join(', ')}
`;
  }

  /**
   * Format deployment information for consistent API responses
   * @private
   */
  formatDeploymentInfo(deployment) {
    const status = deployment.status;
    const spec = deployment.spec;

    // Determine deployment status
    let deploymentStatus = 'Unknown';
    if (status.availableReplicas === spec.replicas) {
      deploymentStatus = 'Ready';
    } else if (status.availableReplicas > 0) {
      deploymentStatus = 'Partial';
    } else {
      deploymentStatus = 'Not Ready';
    }

    // Calculate age
    const createdAt = new Date(deployment.metadata.creationTimestamp);
    const age = this.calculateAge(createdAt);

    return {
      id: `${deployment.metadata.namespace}::${deployment.metadata.name}`,
      name: deployment.metadata.name,
      namespace: deployment.metadata.namespace,
      status: deploymentStatus,
      replicas: `${status.readyReplicas || 0}/${spec.replicas || 0}`,
      availableReplicas: status.availableReplicas || 0,
      unavailableReplicas: status.unavailableReplicas || 0,
      updatedReplicas: status.updatedReplicas || 0,
      desiredReplicas: spec.replicas || 0,
      age: age,
      createdAt: createdAt.toISOString(),
      images: spec.template.spec.containers.map(c => c.image),
      containers: spec.template.spec.containers.map(c => ({
        name: c.name,
        image: c.image,
      })),
      labels: deployment.metadata.labels || {},
      selector: spec.selector.matchLabels || {},
    };
  }
}

module.exports = new KubernetesService();
