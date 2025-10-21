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
   * Execute a kubectl command by running it in a pod
   * @param {string} command - Command to execute
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Command execution result
   */
  async executeKubectlCommand(command, options = {}) {
    try {
      const { namespace = 'default', allowedCommands = ['get', 'describe', 'logs', 'top'] } = options;

      // Parse and validate command
      const commandParts = command.trim().split(/\s+/);
      const mainCommand = commandParts[0];

      // Security: Only allow safe read-only commands
      if (!allowedCommands.includes(mainCommand)) {
        throw new Error(`Command '${mainCommand}' is not allowed. Allowed commands: ${allowedCommands.join(', ')}`);
      }

      // Execute the command using kubectl wrapper
      const result = await this.runKubectlCommand(commandParts, namespace);

      return {
        command: command,
        namespace: namespace,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error executing kubectl command '${command}':`, error.message);
      throw error;
    }
  }

  /**
   * Run kubectl command using the Kubernetes API
   * @private
   */
  async runKubectlCommand(commandParts, namespace) {
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      const args = ['--namespace', namespace, ...commandParts];
      const kubectl = spawn('kubectl', args);

      let stdout = '';
      let stderr = '';

      kubectl.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      kubectl.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      kubectl.on('close', (code) => {
        resolve({
          stdout: stdout,
          stderr: stderr,
          exitCode: code
        });
      });

      kubectl.on('error', (err) => {
        reject(err);
      });
    });
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
