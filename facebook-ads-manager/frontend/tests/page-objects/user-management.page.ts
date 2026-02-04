/**
 * User Management Page Object Model
 * Encapsulates admin user management interactions
 */

import { Page, Locator, expect } from '@playwright/test';

export class UserManagementPage {
  readonly page: Page;
  readonly inviteButton: Locator;
  readonly searchInput: Locator;
  readonly roleFilter: Locator;
  readonly userTable: Locator;
  readonly statsCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inviteButton = page.locator('button:has-text("Invite User")');
    this.searchInput = page.locator('[placeholder="Search users..."]');
    this.roleFilter = page.locator('[data-testid="role-filter"]');
    this.userTable = page.locator('[data-testid="user-table"]');
    this.statsCards = page.locator('[data-testid^="stat-"]');
  }

  async goto() {
    await this.page.goto('/dashboard/admin/users');
    await this.page.waitForLoadState('networkidle');
  }

  async clickInviteUser() {
    await this.inviteButton.click();
    await this.page.waitForSelector('[data-testid="invite-user-dialog"]', {
      state: 'visible',
      timeout: 5000
    });
  }

  async searchUsers(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }

  async filterByRole(role: 'ADMIN' | 'USER' | 'all') {
    await this.roleFilter.selectOption(role);
    await this.page.waitForTimeout(300);
  }

  async getUserRow(email: string): Promise<Locator> {
    return this.page.locator(`[data-testid="user-row"]:has-text("${email}")`);
  }

  async changeUserRole(email: string, newRole: 'ADMIN' | 'USER') {
    const userRow = await this.getUserRow(email);
    await userRow.locator('[data-testid="role-select"]').selectOption(newRole);
  }

  async confirmRoleChange() {
    await this.page.locator('[data-testid="confirm-role-change"]').click();
  }

  async cancelRoleChange() {
    await this.page.locator('[data-testid="cancel-role-change"]').click();
  }

  async viewUserCampaigns(email: string) {
    const userRow = await this.getUserRow(email);
    await userRow.locator('[data-testid="view-campaigns-button"]').click();
  }

  async getUserCount(): Promise<number> {
    return await this.page.locator('[data-testid="user-row"]').count();
  }

  async getStatValue(statName: string): Promise<string | null> {
    const stat = this.page.locator(`[data-testid="stat-${statName}"] .text-2xl`);
    return await stat.textContent();
  }

  async sortByColumn(columnName: string) {
    const header = this.page.locator(`th:has-text("${columnName}")`);
    await header.click();
    await this.page.waitForTimeout(500);
  }

  async verifyUserExists(email: string) {
    await expect(this.page.locator(`text=${email}`)).toBeVisible();
  }

  async verifyUserNotExists(email: string) {
    await expect(this.page.locator(`text=${email}`)).not.toBeVisible();
  }

  async verifyUserRole(email: string, expectedRole: 'Admin' | 'User') {
    const userRow = await this.getUserRow(email);
    await expect(userRow.locator('[data-testid="user-role"]')).toContainText(expectedRole);
  }
}

/**
 * Invite User Dialog Page Object
 */
export class InviteUserDialogPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly emailInput: Locator;
  readonly roleSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('[data-testid="invite-user-dialog"]');
    this.emailInput = page.locator('[data-testid="invite-email"]');
    this.roleSelect = page.locator('[data-testid="invite-role"]');
    this.submitButton = page.locator('[data-testid="submit-invite"]');
    this.cancelButton = page.locator('[data-testid="cancel-invite"]');
  }

  async verifyDialogVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async fillInvitation(email: string, role: 'ADMIN' | 'USER') {
    await this.emailInput.fill(email);
    await this.roleSelect.selectOption(role);
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async verifyEmailError(errorMessage: string) {
    const error = this.page.locator('[data-testid="email-error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText(errorMessage);
  }
}

/**
 * Role Change Confirmation Dialog Page Object
 */
export class RoleChangeDialogPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly userName: Locator;
  readonly currentRole: Locator;
  readonly newRole: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('[data-testid="confirm-role-change-dialog"]');
    this.userName = page.locator('[data-testid="change-user-name"]');
    this.currentRole = page.locator('[data-testid="current-role"]');
    this.newRole = page.locator('[data-testid="new-role"]');
    this.confirmButton = page.locator('[data-testid="confirm-role-change"]');
    this.cancelButton = page.locator('[data-testid="cancel-role-change"]');
  }

  async verifyDialogVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async verifyUserName(name: string) {
    await expect(this.userName).toContainText(name);
  }

  async verifyRoleChange(from: string, to: string) {
    await expect(this.currentRole).toContainText(from);
    await expect(this.newRole).toContainText(to);
  }

  async confirm() {
    await this.confirmButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}

/**
 * User Table Page Object
 */
export class UserTablePage {
  readonly page: Page;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('[data-testid="user-table"]');
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = await this.table.locator('th').allTextContents();
    return headers;
  }

  async sortByColumn(columnName: string) {
    const header = this.table.locator(`th:has-text("${columnName}")`);
    await header.click();
    await this.page.waitForTimeout(500);
  }

  async getRowByEmail(email: string): Promise<Locator> {
    return this.table.locator(`tr:has-text("${email}")`);
  }

  async getRowData(email: string): Promise<{
    name: string | null;
    email: string | null;
    role: string | null;
    campaigns: string | null;
  }> {
    const row = await this.getRowByEmail(email);

    return {
      name: await row.locator('[data-testid="user-name"]').textContent(),
      email: await row.locator('[data-testid="user-email"]').textContent(),
      role: await row.locator('[data-testid="user-role"]').textContent(),
      campaigns: await row.locator('[data-testid="campaign-count"]').textContent()
    };
  }

  async verifyRowCount(expectedCount: number) {
    const rows = await this.table.locator('[data-testid="user-row"]').count();
    expect(rows).toBe(expectedCount);
  }

  async verifyEmptyState() {
    await expect(this.page.locator('text=No users found')).toBeVisible();
  }
}
