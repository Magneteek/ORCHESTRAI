---
name: warn-dangerous-commands
enabled: true
event: bash
pattern: (chmod\s+777|npm\s+install\s+-g|sudo\s+rm|>\/dev\/|dd\s+if=)
action: warn
---

# ⚠️ Potentially Dangerous Command Detected

This command could cause security or system issues.

## 🚨 Detected Pattern

Your command matches one of these dangerous patterns:

### `chmod 777` - Security Risk
```bash
# ❌ NEVER USE THIS
chmod 777 file.txt

# ✅ Use specific permissions
chmod 644 file.txt  # Read/write for owner, read for others
chmod 755 script.sh # Execute for owner, read/execute for others
```
**Why dangerous**: Gives everyone full permissions (read/write/execute)

### `npm install -g` - System Pollution
```bash
# ❌ Avoid global installs
npm install -g some-package

# ✅ Use local project dependencies
npm install some-package --save-dev

# ✅ Or use npx for one-time usage
npx some-package
```
**Why dangerous**: Pollutes global namespace, version conflicts

### `sudo rm` - Accidental System Damage
```bash
# ❌ Extremely dangerous
sudo rm -rf /

# ✅ Be specific and careful
rm -rf ./temp/
# Or use trash instead of rm
```
**Why dangerous**: Can delete system files, no recovery

### `> /dev/` - Device Corruption
```bash
# ❌ Can corrupt devices
echo "data" > /dev/sda

# ✅ Use proper APIs for device operations
```
**Why dangerous**: Can damage hardware, corrupt disks

### `dd if=` - Disk Destruction
```bash
# ❌ One wrong parameter = data loss
dd if=/dev/zero of=/dev/sda

# ✅ Triple-check parameters
# ✅ Use safer alternatives when possible
```
**Why dangerous**: Can wipe entire disks instantly

## ✅ Safe Alternatives

1. **Review the command** - Is there a safer way?
2. **Use specific paths** - Avoid wildcards and broad operations
3. **Test in safe location** - Try in `/temp/` first
4. **Use version control** - Commit before dangerous operations
5. **Have backups** - Ensure critical data is backed up

## 📋 Before Proceeding

- [ ] Verified command is correct
- [ ] Tested in safe environment
- [ ] Have backup/recovery plan
- [ ] Documented why this command is necessary

---

**If you're certain this is needed**, proceed with caution.

**If you're unsure**, ask for help or find a safer alternative.

*This warning helps prevent accidental system damage and security vulnerabilities.*
