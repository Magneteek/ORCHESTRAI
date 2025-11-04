/**
 * ORCHESTRAI Intelligent Pipeline Assembly System
 *
 * Main export module for automatic pipeline assembly from project specifications.
 *
 * Usage:
 * ```javascript
 * const { IntelligentPipelineAssembler } = require('./pipeline-assembly');
 *
 * const assembler = new IntelligentPipelineAssembler(
 *   coordinationPatterns,
 *   dynamicAgentSelection,
 *   crystallineMemory,
 *   redis
 * );
 *
 * // Assemble and execute pipeline from simple specification
 * const result = await assembler.assemblePipelineFromProject({
 *   description: "Create comprehensive SEO research for Dutch dental market",
 *   clientName: "DentalPro",
 *   targetMarket: "Netherlands",
 *   language: "Dutch"
 * });
 * ```
 */

const IntelligentPipelineAssembler = require('./intelligent-pipeline-assembler');
const ProjectSpecificationAnalyzer = require('./project-specification-analyzer');
const PipelineTemplateLibrary = require('./pipeline-template-library');
const WorkflowConfigGenerator = require('./workflow-config-generator');
const QualityGateValidator = require('./quality-gate-validator');
const PipelineRegistry = require('./pipeline-registry');

module.exports = {
  IntelligentPipelineAssembler,
  ProjectSpecificationAnalyzer,
  PipelineTemplateLibrary,
  WorkflowConfigGenerator,
  QualityGateValidator,
  PipelineRegistry
};
