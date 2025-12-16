# ORCHESTRAI Data Import Guide

## Quick Start

### Import client data from another system:

```bash
node orchestrai-domains/client-intelligence/scripts/import-client-data.js \
  /path/to/your/data.json \
  "Client Name"
```

## Supported Source Formats

The import script automatically detects and maps from multiple formats:

### Format 1: VAIBE Format
```json
{
  "systemName": "VAIBE",
  "coreValues": [...],
  "idealCustomerProfile": {...},
  "customerSegments": [...],
  "psychographics": {...}
}
```

### Format 2: Generic Format
```json
{
  "eos": {
    "coreValues": [
      {"name": "Value 1", "description": "..."},
      {"name": "Value 2", "description": "..."}
    ],
    "coreFocus": {
      "purpose": "...",
      "niche": "..."
    }
  },
  "icp": {...},
  "personas": [...],
  "psychographic": {...}
}
```

### Format 3: Simple Format (Auto-normalized)
```json
{
  "values": ["Value 1", "Value 2"],  // ← Converted to object array
  "purpose": "...",                   // ← Converted to coreFocus object
  "painPoints": "1. ...\n2. ...",    // ← Converted to array
  "customerSegments": [...]
}
```

## What Gets Created

After import, you'll have:

```
/projects/[clientname-uuid]/
├── client-intelligence/
│   └── comprehensive-intelligence-aggregated.json  ← Your data (ORCHESTRAI format)
├── deliverables/
│   ├── research/  ← Generate HTML reports here
│   ├── seo/
│   └── content/
├── project-metadata.json  ← Project info
└── crystalline-memory-index.json  ← Memory entities & relations
```

## Memory Entities Created

The script automatically creates:

### Client Entity
```json
{
  "entityType": "Client",
  "name": "Client Name",
  "observations": [
    "Project ID: clientname-uuid",
    "Imported: 2025-11-28...",
    "Data completeness: 95%",
    "Source: VAIBE"
  ]
}
```

### Project Entity
```json
{
  "entityType": "Project",
  "name": "Client Name Intelligence Project",
  "observations": [
    "Type: Client Intelligence",
    "Status: Active",
    "Created: 2025-11-28..."
  ]
}
```

### Persona Entities (one per persona)
```json
{
  "entityType": "CustomerPersona",
  "name": "Client Name - Persona Name",
  "observations": [
    "Primary motivation: ...",
    "Primary goal: ...",
    "Key fear: ..."
  ]
}
```

### Relations
```
Client --[has_project]--> Project
Client --[has_persona]--> Persona 1
Client --[has_persona]--> Persona 2
Project --[managed_by]--> Client Intelligence Domain
```

## Data Mapping Details

### EOS Framework
**Source fields** → **ORCHESTRAI fields**
- `values` or `coreValues` → `eos.coreValues` (normalized to objects)
- `purpose` or `mission` → `eos.coreFocus.purpose`
- `focus` or `niche` → `eos.coreFocus.niche`
- `vision.tenYear` → `eos.tenYearTarget`
- `vision.threeYear` → `eos.threeYearPicture`

### ICP Data
**Source fields** → **ORCHESTRAI fields**
- `idealCustomerProfile` → `icp`
- `painPoints` → `icp.before` (normalized to array)
- `results` → `icp.after`
- `valuePropositions` → `icp.promises`
- `failedAttempts` → `icp.pastExperiences`

### Personas
**Source fields** → **ORCHESTRAI fields**
- `customerSegments` → `personas`
- `motivations` → `persona.motivation`
- `concerns` → `persona.fears`
- `objectives` → `persona.goals`
- `buyingReasons` → `persona.reasons`

## Example: Import from VAIBE

```bash
# 1. Export your VAIBE data to JSON
# (Assuming you have vaibe-client-data.json)

# 2. Import into ORCHESTRAI
node orchestrai-domains/client-intelligence/scripts/import-client-data.js \
  ~/Downloads/vaibe-client-data.json \
  "QuartzIQ"

# Output:
# ======================================================================
# ORCHESTRAI Client Data Import
# ======================================================================
#
# 📂 Loading source data...
#    ✓ Loaded from: ~/Downloads/vaibe-client-data.json
#
# 📁 Creating project structure...
#    ✓ Project ID: quartziq-EA511E99-BB89-4CD0-9C88-AE5584D2E010
#    ✓ Project path: /Users/kris/CLAUDEtools/ORCHESTRAI/projects/quartziq-EA511E99-BB89-4CD0-9C88-AE5584D2E010
#
# 🔄 Mapping data to ORCHESTRAI format...
#    ✓ Data completeness: 95%
#    ✓ Source system: VAIBE
#
# 💾 Saving data files...
#    ✓ Saved: comprehensive-intelligence-aggregated.json
#    ✓ Saved: project-metadata.json
#
# 🧠 Creating crystalline memory entities...
#    ✓ Created 5 entities
#    ✓ Created 6 relations
#    ✓ Saved: crystalline-memory-index.json
#
# ======================================================================
# ✅ Import Complete!
# ======================================================================
```

## Next Steps After Import

### 1. Generate HTML Reports
```bash
# Generate all reports for imported client
node temp/regenerate-nasmehpg-comprehensive.js
# (Update script name to match your project)
```

### 2. Review Imported Data
```bash
# Open the aggregated data file
open /projects/quartziq-EA511E99-BB89-4CD0-9C88-AE5584D2E010/client-intelligence/comprehensive-intelligence-aggregated.json
```

### 3. Validate Data Completeness
The script reports data completeness percentage. If < 100%, you may need to:
- Add missing sections manually
- Re-import with updated source data
- Use data completion agents

### 4. Generate Missing Sections
If any sections are missing:
```bash
# Use specialized agents to fill gaps
# (Future: automated completion workflow)
```

## Manual Import (Alternative Method)

If you prefer manual import:

### 1. Create project structure manually
```bash
mkdir -p /projects/clientname-UUID/client-intelligence
mkdir -p /projects/clientname-UUID/deliverables/research
```

### 2. Copy your data file
```bash
cp your-data.json /projects/clientname-UUID/client-intelligence/comprehensive-intelligence-aggregated.json
```

### 3. Create project metadata manually
```json
{
  "clientName": "Client Name",
  "projectId": "clientname-UUID",
  "createdAt": "2025-11-28T...",
  "status": "active",
  "type": "client-intelligence"
}
```

### 4. Create memory entities manually
```json
{
  "entities": [
    {
      "entityType": "Client",
      "name": "Client Name",
      "observations": ["..."]
    }
  ],
  "relations": [
    {
      "from": "Client Name",
      "to": "Client Name Intelligence Project",
      "relationType": "has_project"
    }
  ]
}
```

### 5. Generate reports
```bash
node orchestrai-domains/client-intelligence/scripts/generate-reports.js clientname-UUID
```

## Data Validation

After import, validate your data:

```bash
# Check data completeness
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./projects/clientname-UUID/client-intelligence/comprehensive-intelligence-aggregated.json', 'utf8'));
console.log('EOS:', data.eos ? '✓' : '✗');
console.log('ICP:', data.icp ? '✓' : '✗');
console.log('Personas:', data.personas?.length || 0);
console.log('Completeness:', data.metadata.completeness + '%');
"
```

## Troubleshooting

### Issue: Data not mapping correctly
**Solution**: Check source data structure
```bash
node -e "
const data = require('./your-source-data.json');
console.log('Available fields:', Object.keys(data));
"
```

### Issue: Missing sections after import
**Solution**: Re-import with updated source or add manually
```javascript
// Edit the aggregated.json file directly
// Add missing sections following ORCHESTRAI structure
```

### Issue: Memory entities not created
**Solution**: Run import script again or create manually
```bash
node orchestrai-domains/client-intelligence/scripts/import-client-data.js source.json "Client"
```

## Best Practices

1. **Always backup source data** before import
2. **Review mapped data** before generating reports
3. **Validate completeness** - aim for 80%+ before report generation
4. **Use consistent naming** - match client names across systems
5. **Document source system** - helps with future re-imports

## Memory Key Consistency

The import script uses **consistent memory keys**:
- Client entities: `{clientName}`
- Project entities: `{clientName} Intelligence Project`
- Persona entities: `{clientName} - {personaName}`

This ensures:
- ✅ No duplicate entities
- ✅ Proper relation mapping
- ✅ Cross-system compatibility
- ✅ Query consistency

## Support

For import issues or custom mapping needs:
- Check source data format
- Review import script logs
- Adjust mapping functions in `import-client-data.js`
- Contact ORCHESTRAI support
