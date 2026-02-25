/**
 * GitHub Handler - Process GitHub webhook events
 *
 * Supported events:
 * - pull_request (opened, closed, reopened, synchronize)
 * - push
 * - issues (opened, closed, reopened)
 * - issue_comment
 * - pull_request_review
 * - workflow_run
 */

class GitHubHandler {
  constructor(options = {}) {
    this.config = {
      secret: options.secret || process.env.GITHUB_WEBHOOK_SECRET,
      ...options
    };
  }

  /**
   * Handle GitHub webhook event
   */
  async handleEvent(payload, headers = {}) {
    // Verify signature if secret is configured
    if (this.config.secret) {
      const isValid = this.verifySignature(payload, headers['x-hub-signature-256'], this.config.secret);
      if (!isValid) {
        throw new Error('Invalid GitHub webhook signature');
      }
    }

    // Parse event
    const eventType = headers['x-github-event'];
    const action = payload.action;

    // Normalize event
    const event = {
      type: 'github',
      event: `github.${eventType}.${action || 'default'}`,
      data: this.extractEventData(eventType, payload),
      metadata: {
        deliveryId: headers['x-github-delivery'],
        eventType,
        action,
        receivedAt: new Date().toISOString()
      },
      raw: payload
    };

    return event;
  }

  /**
   * Extract relevant data from GitHub payload
   */
  extractEventData(eventType, payload) {
    const data = {
      eventType,
      action: payload.action
    };

    // Repository info
    if (payload.repository) {
      data.repository = {
        id: payload.repository.id,
        name: payload.repository.name,
        fullName: payload.repository.full_name,
        owner: payload.repository.owner.login,
        url: payload.repository.html_url,
        defaultBranch: payload.repository.default_branch
      };
    }

    // Sender info
    if (payload.sender) {
      data.sender = {
        login: payload.sender.login,
        id: payload.sender.id,
        type: payload.sender.type
      };
    }

    // Event-specific data
    switch (eventType) {
      case 'pull_request':
        data.pullRequest = this.extractPullRequestData(payload.pull_request);
        break;

      case 'push':
        data.push = this.extractPushData(payload);
        break;

      case 'issues':
        data.issue = this.extractIssueData(payload.issue);
        break;

      case 'issue_comment':
        data.issue = this.extractIssueData(payload.issue);
        data.comment = this.extractCommentData(payload.comment);
        break;

      case 'pull_request_review':
        data.pullRequest = this.extractPullRequestData(payload.pull_request);
        data.review = this.extractReviewData(payload.review);
        break;

      case 'workflow_run':
        data.workflowRun = this.extractWorkflowRunData(payload.workflow_run);
        break;
    }

    return data;
  }

  /**
   * Extract pull request data
   */
  extractPullRequestData(pr) {
    return {
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      url: pr.html_url,
      author: pr.user.login,
      base: {
        ref: pr.base.ref,
        sha: pr.base.sha
      },
      head: {
        ref: pr.head.ref,
        sha: pr.head.sha
      },
      draft: pr.draft,
      merged: pr.merged,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at
    };
  }

  /**
   * Extract push data
   */
  extractPushData(payload) {
    return {
      ref: payload.ref,
      before: payload.before,
      after: payload.after,
      commits: payload.commits.map(c => ({
        id: c.id,
        message: c.message,
        author: c.author.name,
        url: c.url
      })),
      pusher: payload.pusher.name,
      forced: payload.forced
    };
  }

  /**
   * Extract issue data
   */
  extractIssueData(issue) {
    return {
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      url: issue.html_url,
      author: issue.user.login,
      labels: issue.labels.map(l => l.name),
      assignees: issue.assignees.map(a => a.login),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at
    };
  }

  /**
   * Extract comment data
   */
  extractCommentData(comment) {
    return {
      id: comment.id,
      body: comment.body,
      author: comment.user.login,
      url: comment.html_url,
      createdAt: comment.created_at
    };
  }

  /**
   * Extract review data
   */
  extractReviewData(review) {
    return {
      id: review.id,
      body: review.body,
      state: review.state,
      author: review.user.login,
      url: review.html_url,
      submittedAt: review.submitted_at
    };
  }

  /**
   * Extract workflow run data
   */
  extractWorkflowRunData(run) {
    return {
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      url: run.html_url,
      branch: run.head_branch,
      sha: run.head_sha,
      triggeredBy: run.triggering_actor.login
    };
  }

  /**
   * Verify GitHub webhook signature
   */
  verifySignature(payload, signature, secret) {
    if (!signature) {
      return false;
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = 'sha256=' + hmac.update(payloadString).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

module.exports = GitHubHandler;
