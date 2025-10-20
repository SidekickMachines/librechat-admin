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
}

module.exports = new KubernetesService();
