class Task {
  constructor(config) {
    this.prompt = config.prompt;
    this.subagent_type = config.subagent_type;
    this.description = config.description || 'Task execution';
    this.metadata = config.metadata || {};
    this.priority = config.priority || 'medium';
    this.timeout = config.timeout || 120000;
  }

  toJSON() {
    return {
      prompt: this.prompt,
      subagent_type: this.subagent_type,
      description: this.description,
      metadata: this.metadata,
      priority: this.priority,
      timeout: this.timeout
    };
  }
}

class TaskDelegationManager {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.activeTasks = new Map();
    this.taskHistory = [];
  }

  async delegateTask(task, targetAgent = null) {
    try {
      const taskId = this.generateTaskId();
      const taskWithId = { ...task.toJSON(), taskId };
      
      this.activeTasks.set(taskId, {
        task: taskWithId,
        startTime: Date.now(),
        targetAgent,
        status: 'executing'
      });

      console.log(`🎯 Delegating task ${taskId} to ${targetAgent || task.subagent_type}`);
      
      // Use the orchestrator's Task tool to delegate to Claude Code agents
      const result = await this.orchestrator.callTool('Task', taskWithId);
      
      const completedTask = this.activeTasks.get(taskId);
      completedTask.status = 'completed';
      completedTask.endTime = Date.now();
      completedTask.duration = completedTask.endTime - completedTask.startTime;
      completedTask.result = result;
      
      this.taskHistory.push(completedTask);
      this.activeTasks.delete(taskId);
      
      console.log(`✅ Task ${taskId} completed in ${completedTask.duration}ms`);
      
      return result;
    } catch (error) {
      console.error('Task delegation failed:', error);
      throw error;
    }
  }

  async delegateToClaudeCodeAgent(agentId, taskConfig) {
    const task = new Task({
      prompt: taskConfig.prompt,
      subagent_type: 'general-purpose',
      description: `Delegate to ${agentId}`,
      metadata: { targetAgent: agentId, ...taskConfig.metadata }
    });
    
    return await this.delegateTask(task, agentId);
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getActiveTaskCount() {
    return this.activeTasks.size;
  }

  getTaskHistory(limit = 10) {
    return this.taskHistory.slice(-limit);
  }

  getTaskStats() {
    const completedTasks = this.taskHistory;
    const avgDuration = completedTasks.reduce((sum, task) => sum + (task.duration || 0), 0) / completedTasks.length;
    
    return {
      totalTasksCompleted: completedTasks.length,
      activeTasks: this.activeTasks.size,
      averageDuration: Math.round(avgDuration),
      successRate: completedTasks.filter(t => t.status === 'completed').length / completedTasks.length
    };
  }
}

module.exports = { Task, TaskDelegationManager };