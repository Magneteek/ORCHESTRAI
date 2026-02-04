# Phase 1 Deployment Checklist

**Migration:** `20260127125133_add_dynamic_fields_and_simplify_roles`
**Date:** 2026-01-27
**Phase:** 1 of 5 - Database Schema Extensions

## Pre-Deployment

### Code Review
- [ ] Review schema changes in `/prisma/schema.prisma`
- [ ] Review migration SQL in `/prisma/migrations/.../migration.sql`
- [ ] Verify all relations are correct
- [ ] Check indexes for performance
- [ ] Validate field types and defaults

### Local Testing
- [ ] Create local test database
- [ ] Run migration on local database
  ```bash
  cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend
  npx prisma migrate deploy
  ```
- [ ] Verify role conversion with test data
- [ ] Run verification queries from `role_conversion_verification.sql`
- [ ] Test dynamic field creation
- [ ] Test template launch workflow

### Code Updates
- [ ] Search for string-based role checks
  ```bash
  grep -rn "role === 'admin'" src/
  grep -rn "role === 'manager'" src/
  grep -rn "role === 'member'" src/
  ```
- [ ] Update all role comparisons to use `UserRole` enum
- [ ] Import `UserRole` from `@prisma/client`
- [ ] Update middleware/auth logic
- [ ] Update API endpoints
- [ ] Update React components

### Testing
- [ ] Run unit tests
  ```bash
  npm test
  ```
- [ ] Run integration tests
- [ ] Run E2E tests
  ```bash
  npm run test:e2e
  ```
- [ ] Test authentication flow
- [ ] Test admin permissions
- [ ] Test user permissions
- [ ] Test template CRUD
- [ ] Test template launch

### Documentation
- [ ] Update API documentation
- [ ] Update user guides
- [ ] Update developer docs
- [ ] Document new endpoints
- [ ] Add examples for dynamic fields

## Staging Deployment

### Pre-Migration
- [ ] Backup staging database
  ```bash
  pg_dump $STAGING_DATABASE_URL > staging_backup_$(date +%Y%m%d).sql
  ```
- [ ] Verify backup is valid
- [ ] Run pre-migration verification
  ```sql
  -- Check current role distribution
  SELECT role, COUNT(*) FROM users GROUP BY role;
  ```
- [ ] Document current state

### Migration
- [ ] Deploy code to staging
- [ ] Run Prisma migration
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Monitor for errors
- [ ] Run post-migration verification
  ```sql
  -- Verify role conversion
  SELECT role, COUNT(*) FROM users GROUP BY role;
  -- Should only show ADMIN and USER
  ```

### Post-Migration Testing
- [ ] Test authentication
- [ ] Verify admin user access
- [ ] Verify regular user access
- [ ] Test template creation with dynamic fields
- [ ] Test campaign launch from template
- [ ] Query global templates
- [ ] Check template launch history
- [ ] Verify performance (indexes working)

### Rollback Test (Optional)
- [ ] Restore from backup to separate database
- [ ] Run rollback SQL
- [ ] Verify rollback successful
- [ ] Document rollback procedure

## Production Deployment

### Pre-Deployment
- [ ] **CRITICAL: Backup production database**
  ```bash
  pg_dump $DATABASE_URL > production_backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Verify backup completed successfully
- [ ] Store backup in secure location
- [ ] Run pre-migration verification queries
- [ ] Document current metrics:
  - [ ] Total users
  - [ ] Admin count
  - [ ] Manager count
  - [ ] Member count
  - [ ] Total templates
  - [ ] Total campaigns

### Deployment Window
- [ ] Schedule maintenance window (recommended: 15-30 minutes)
- [ ] Notify users of maintenance
- [ ] Put application in maintenance mode (optional)

### Code Deployment
- [ ] Deploy updated code to production
- [ ] Verify build successful
- [ ] Verify environment variables

### Database Migration
- [ ] Run migration
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Monitor migration progress
- [ ] Check for errors
- [ ] Run post-migration verification
  ```sql
  -- Verify role conversion
  SELECT role, COUNT(*) as count FROM users GROUP BY role;

  -- Check new columns
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'ad_templates'
  AND column_name IN ('dynamicFields', 'fieldSchema', 'isGlobal', 'requiresApproval');

  -- Verify template_launches table
  SELECT table_name FROM information_schema.tables
  WHERE table_name = 'template_launches';
  ```

### Post-Migration Verification
- [ ] All role checks return only ADMIN and USER
- [ ] No orphaned roles exist
- [ ] Dynamic fields columns exist on ad_templates
- [ ] template_launches table created
- [ ] All indexes created
- [ ] Foreign keys working
- [ ] Cascade deletes configured

### Application Testing
- [ ] Test user login (ADMIN role)
- [ ] Test user login (USER role)
- [ ] Verify admin dashboard access
- [ ] Verify user permissions
- [ ] Create new template with dynamic fields
- [ ] Launch campaign from template
- [ ] Verify field values stored
- [ ] Query global templates
- [ ] Check analytics/reporting

### Monitoring
- [ ] Watch application logs for errors
- [ ] Monitor authentication errors
- [ ] Check API error rates
- [ ] Monitor database performance
- [ ] Watch for role-related errors

## Post-Deployment

### Immediate (First Hour)
- [ ] Monitor error logs
- [ ] Check user authentication success rate
- [ ] Verify no 403 errors spike
- [ ] Monitor database performance
- [ ] Check template creation/launch rates

### Short Term (First Day)
- [ ] Review application metrics
- [ ] Check user feedback
- [ ] Monitor template usage
- [ ] Verify dynamic field validation working
- [ ] Check global template queries

### Medium Term (First Week)
- [ ] Analyze template launch data
- [ ] Review performance metrics
- [ ] Gather user feedback
- [ ] Identify any issues
- [ ] Plan Phase 2 based on insights

## Rollback Procedure (If Needed)

### When to Rollback
Rollback if:
- Migration fails midway
- Critical authentication issues
- Data integrity problems
- Severe performance degradation

### Rollback Steps
1. **Stop Application**
   ```bash
   # Stop application servers
   ```

2. **Restore Database**
   ```bash
   # Drop current database (CAREFUL!)
   dropdb facebook_ads_manager

   # Create fresh database
   createdb facebook_ads_manager

   # Restore from backup
   psql facebook_ads_manager < production_backup_TIMESTAMP.sql
   ```

3. **Rollback Code**
   ```bash
   # Revert to previous version
   git revert HEAD
   git push origin main

   # Redeploy previous version
   ```

4. **Verify Rollback**
   - [ ] Application starts successfully
   - [ ] Users can authenticate
   - [ ] Old role system working
   - [ ] Templates function correctly

5. **Investigate Issues**
   - [ ] Review error logs
   - [ ] Identify root cause
   - [ ] Create fix plan
   - [ ] Schedule retry

## Success Metrics

### Technical Metrics
- [ ] Migration completed without errors
- [ ] All users retained (no data loss)
- [ ] Role conversion 100% successful
- [ ] Zero authentication failures
- [ ] Template operations working
- [ ] Performance within normal range

### Functional Metrics
- [ ] Users can log in with new role system
- [ ] Admin permissions working correctly
- [ ] User permissions working correctly
- [ ] Templates with dynamic fields can be created
- [ ] Campaigns can be launched from templates
- [ ] Field values properly validated
- [ ] Global templates accessible

### Business Metrics
- [ ] No user-reported issues
- [ ] Template usage maintained or increased
- [ ] Campaign launch rate maintained
- [ ] Zero downtime (or within planned window)

## Communication Plan

### Before Deployment
- [ ] Notify stakeholders of deployment plan
- [ ] Inform users of maintenance window
- [ ] Prepare support team for questions

### During Deployment
- [ ] Update status page (if applicable)
- [ ] Internal team communication channel active
- [ ] Ready to communicate issues

### After Deployment
- [ ] Announce successful deployment
- [ ] Update documentation
- [ ] Send user guide for new features
- [ ] Provide feedback channel

## Contact Information

### On-Call Team
- Database Admin: [Contact]
- Backend Lead: [Contact]
- DevOps: [Contact]
- Product Owner: [Contact]

### Escalation Path
1. Backend Developer
2. Tech Lead
3. CTO

## Notes & Observations

### Pre-Deployment Notes
```
[Date/Time]
-
-
```

### Deployment Notes
```
[Date/Time]
-
-
```

### Post-Deployment Notes
```
[Date/Time]
-
-
```

## Sign-Off

### Code Review
- [ ] Reviewed by: _________________ Date: _________
- [ ] Approved by: _________________ Date: _________

### Testing
- [ ] Unit tests passed by: _________________ Date: _________
- [ ] Integration tests passed by: _________________ Date: _________
- [ ] E2E tests passed by: _________________ Date: _________

### Deployment Authorization
- [ ] Approved for staging by: _________________ Date: _________
- [ ] Approved for production by: _________________ Date: _________

### Post-Deployment Verification
- [ ] Verified by: _________________ Date: _________
- [ ] Sign-off by: _________________ Date: _________

---

**Status:** 🟡 READY FOR REVIEW
**Next Step:** Local testing and code updates
**Expected Timeline:** 2-3 days (testing) → 1 week (staging) → Production
