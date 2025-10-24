#!/usr/bin/env python3
"""
Extract Training Data from ORCHESTRAI Crystalline Memory.

This script:
1. Connects to ORCHESTRAI's crystalline memory (MCP Memory + Redis)
2. Extracts historical workflow and task data
3. Transforms into ML-ready training format
4. Validates and cleans the data
5. Outputs training CSV for model training

Usage:
    python training/extract_training_data.py --output training_data.csv --min-samples 100
"""

import sys
import os
from pathlib import Path
import argparse
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from redis import Redis

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ORCHESTRAIDataExtractor:
    """
    Extract training data from ORCHESTRAI crystalline memory.
    """

    def __init__(
        self,
        redis_url: str = "redis://localhost:6379",
        min_performance: float = 0.0,
        lookback_days: int = 90
    ):
        """
        Initialize data extractor.

        Args:
            redis_url: Redis connection URL
            min_performance: Minimum performance score to include
            lookback_days: Number of days of history to extract
        """
        self.redis_url = redis_url
        self.min_performance = min_performance
        self.lookback_days = lookback_days

        # Connect to Redis
        try:
            self.redis = Redis.from_url(redis_url, decode_responses=True)
            self.redis.ping()
            logger.info(f"✅ Connected to Redis: {redis_url}")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise

        # Data storage
        self.raw_workflows = []
        self.training_samples = []

    def extract_workflows_from_redis(self) -> List[Dict[str, Any]]:
        """
        Extract workflow data from Redis.

        Returns:
            List of workflow dictionaries
        """
        logger.info("🔍 Extracting workflows from Redis...")

        workflows = []

        try:
            # Search for workflow keys
            # Pattern: orchestrai:workflow:*
            cursor = 0
            total_keys = 0

            while True:
                cursor, keys = self.redis.scan(
                    cursor=cursor,
                    match="orchestrai:workflow:*",
                    count=100
                )

                for key in keys:
                    try:
                        workflow_data = self.redis.get(key)
                        if workflow_data:
                            workflow = json.loads(workflow_data)
                            workflows.append(workflow)
                            total_keys += 1

                    except json.JSONDecodeError as e:
                        logger.warning(f"Failed to parse workflow {key}: {e}")
                        continue

                if cursor == 0:
                    break

            logger.info(f"   Found {total_keys} workflow records")

        except Exception as e:
            logger.error(f"Error extracting workflows: {e}")

        return workflows

    def extract_agent_performance_data(self) -> List[Dict[str, Any]]:
        """
        Extract agent performance metrics from Redis.

        Returns:
            List of performance records
        """
        logger.info("📊 Extracting agent performance data...")

        performance_records = []

        try:
            # Search for agent performance keys
            # Pattern: orchestrai:agent-performance:*
            cursor = 0

            while True:
                cursor, keys = self.redis.scan(
                    cursor=cursor,
                    match="orchestrai:agent-performance:*",
                    count=100
                )

                for key in keys:
                    try:
                        perf_data = self.redis.get(key)
                        if perf_data:
                            record = json.loads(perf_data)
                            performance_records.append(record)

                    except json.JSONDecodeError:
                        continue

                if cursor == 0:
                    break

            logger.info(f"   Found {len(performance_records)} performance records")

        except Exception as e:
            logger.error(f"Error extracting performance data: {e}")

        return performance_records

    def extract_from_crystalline_memory(self) -> List[Dict[str, Any]]:
        """
        Extract data from crystalline memory structure.

        Returns:
            List of memory entities with workflow data
        """
        logger.info("🔮 Extracting from crystalline memory structure...")

        entities = []

        try:
            # Search for memory entities
            # Pattern: orchestrai:memory:entity:*
            cursor = 0

            while True:
                cursor, keys = self.redis.scan(
                    cursor=cursor,
                    match="orchestrai:memory:entity:*",
                    count=100
                )

                for key in keys:
                    try:
                        entity_data = self.redis.get(key)
                        if entity_data:
                            entity = json.loads(entity_data)

                            # Only include workflow-related entities
                            if entity.get('type') in ['workflow', 'task', 'agent-execution']:
                                entities.append(entity)

                    except json.JSONDecodeError:
                        continue

                if cursor == 0:
                    break

            logger.info(f"   Found {len(entities)} memory entities")

        except Exception as e:
            logger.error(f"Error extracting memory entities: {e}")

        return entities

    def transform_to_training_format(
        self,
        workflows: List[Dict[str, Any]],
        performance_records: List[Dict[str, Any]]
    ) -> pd.DataFrame:
        """
        Transform raw data into training format.

        Expected columns:
        - task_type, domain, complexity, priority
        - required_capabilities (JSON list)
        - client_name, project_uuid
        - agent_id (target)
        - actual_performance (target)
        - actual_duration_ms (target)

        Args:
            workflows: List of workflow records
            performance_records: List of performance records

        Returns:
            DataFrame ready for training
        """
        logger.info("🔧 Transforming data to training format...")

        training_data = []

        # Create performance lookup
        perf_lookup = {}
        for record in performance_records:
            agent_id = record.get('agentId') or record.get('agent_id')
            if agent_id:
                perf_lookup[agent_id] = record

        for workflow in workflows:
            try:
                sample = self._extract_training_sample(workflow, perf_lookup)
                if sample:
                    training_data.append(sample)

            except Exception as e:
                logger.debug(f"Failed to extract sample: {e}")
                continue

        logger.info(f"   Extracted {len(training_data)} training samples")

        if not training_data:
            logger.warning("⚠️  No training samples extracted!")
            return pd.DataFrame()

        df = pd.DataFrame(training_data)
        return df

    def _extract_training_sample(
        self,
        workflow: Dict[str, Any],
        perf_lookup: Dict[str, Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Extract a single training sample from workflow.

        Args:
            workflow: Workflow data
            perf_lookup: Agent performance lookup

        Returns:
            Training sample dict or None
        """
        # Extract agent information
        agent_id = (
            workflow.get('agentId') or
            workflow.get('agent_id') or
            workflow.get('executingAgent')
        )

        if not agent_id:
            return None

        # Extract task context
        task_type = (
            workflow.get('taskType') or
            workflow.get('type') or
            workflow.get('deliverableType') or
            'general'
        )

        domain = (
            workflow.get('domain') or
            workflow.get('agentDomain') or
            self._infer_domain_from_type(task_type)
        )

        complexity = (
            workflow.get('complexity') or
            workflow.get('taskComplexity') or
            'medium'
        )

        priority = (
            workflow.get('priority') or
            workflow.get('taskPriority') or
            'medium'
        )

        # Extract capabilities
        required_capabilities = (
            workflow.get('requiredCapabilities') or
            workflow.get('capabilities') or
            []
        )

        if isinstance(required_capabilities, str):
            try:
                required_capabilities = json.loads(required_capabilities)
            except:
                required_capabilities = []

        # Extract client context
        client_name = workflow.get('clientName') or workflow.get('client')
        project_uuid = workflow.get('projectUuid') or workflow.get('project')

        # Extract performance metrics
        actual_performance = self._extract_performance_score(workflow, perf_lookup, agent_id)
        actual_duration_ms = self._extract_duration(workflow)

        # Validate data quality
        if actual_performance is None or actual_performance < self.min_performance:
            return None

        if actual_duration_ms is None or actual_duration_ms <= 0:
            return None

        # Extract additional features for richer training
        estimated_word_count = workflow.get('estimatedWordCount') or workflow.get('wordCount')
        target_languages = workflow.get('targetLanguages') or ['en']
        quality_threshold = workflow.get('qualityThreshold') or 0.95
        psychographic_targeting = workflow.get('psychographicTargeting') or False

        return {
            'task_type': task_type,
            'domain': domain,
            'complexity': complexity,
            'priority': priority,
            'required_capabilities': json.dumps(required_capabilities),
            'client_name': client_name,
            'project_uuid': project_uuid,
            'agent_id': agent_id,
            'actual_performance': float(actual_performance),
            'actual_duration_ms': int(actual_duration_ms),
            'estimated_word_count': estimated_word_count,
            'target_languages': json.dumps(target_languages),
            'quality_threshold': quality_threshold,
            'psychographic_targeting': psychographic_targeting,
            'timestamp': workflow.get('completedAt') or workflow.get('timestamp')
        }

    def _infer_domain_from_type(self, task_type: str) -> str:
        """Infer domain from task type."""
        task_type_lower = task_type.lower()

        if any(x in task_type_lower for x in ['content', 'writing', 'article']):
            return 'content'
        elif any(x in task_type_lower for x in ['seo', 'keyword', 'optimization']):
            return 'seo'
        elif any(x in task_type_lower for x in ['research', 'analysis']):
            return 'research'
        elif any(x in task_type_lower for x in ['technical', 'development']):
            return 'technical'
        elif any(x in task_type_lower for x in ['design', 'wireframe']):
            return 'design'
        else:
            return 'general'

    def _extract_performance_score(
        self,
        workflow: Dict[str, Any],
        perf_lookup: Dict[str, Dict[str, Any]],
        agent_id: str
    ) -> Optional[float]:
        """Extract performance score from workflow or lookup."""

        # Try direct from workflow
        performance = (
            workflow.get('performanceScore') or
            workflow.get('qualityScore') or
            workflow.get('actualPerformance')
        )

        if performance is not None:
            return float(performance)

        # Try from performance lookup
        if agent_id in perf_lookup:
            perf_record = perf_lookup[agent_id]
            performance = (
                perf_record.get('averagePerformance') or
                perf_record.get('successRate')
            )
            if performance is not None:
                return float(performance)

        # Try from result status
        status = workflow.get('status') or workflow.get('result', {}).get('status')
        if status == 'success' or status == 'completed':
            # Estimate performance from success
            return 0.85

        return None

    def _extract_duration(self, workflow: Dict[str, Any]) -> Optional[int]:
        """Extract task duration in milliseconds."""

        # Try direct duration field
        duration = (
            workflow.get('duration') or
            workflow.get('actualDuration') or
            workflow.get('executionTime')
        )

        if duration is not None:
            return int(duration)

        # Try to calculate from timestamps
        start_time = workflow.get('startTime') or workflow.get('createdAt')
        end_time = workflow.get('endTime') or workflow.get('completedAt')

        if start_time and end_time:
            try:
                if isinstance(start_time, str):
                    start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                if isinstance(end_time, str):
                    end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))

                duration_seconds = (end_time - start_time).total_seconds()
                return int(duration_seconds * 1000)
            except:
                pass

        return None

    def validate_and_clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Validate and clean training data.

        Args:
            df: Raw training DataFrame

        Returns:
            Cleaned DataFrame
        """
        logger.info("🧹 Validating and cleaning data...")

        initial_count = len(df)

        # Remove duplicates
        df = df.drop_duplicates(subset=['agent_id', 'timestamp'], keep='first')
        logger.info(f"   Removed {initial_count - len(df)} duplicates")

        # Validate performance scores (0-1 range)
        df = df[df['actual_performance'].between(0, 1)]

        # Validate durations (positive, reasonable)
        df = df[df['actual_duration_ms'] > 0]
        df = df[df['actual_duration_ms'] < 7200000]  # Max 2 hours

        # Remove rows with missing critical fields
        critical_fields = ['task_type', 'domain', 'agent_id', 'actual_performance', 'actual_duration_ms']
        df = df.dropna(subset=critical_fields)

        # Standardize categorical values
        df['complexity'] = df['complexity'].str.lower()
        df['priority'] = df['priority'].str.lower()
        df['domain'] = df['domain'].str.lower()
        df['task_type'] = df['task_type'].str.lower()

        # Fill missing optional fields
        df['client_name'] = df['client_name'].fillna('unknown')
        df['project_uuid'] = df['project_uuid'].fillna('unknown')
        df['estimated_word_count'] = df['estimated_word_count'].fillna(1000)
        df['quality_threshold'] = df['quality_threshold'].fillna(0.95)

        logger.info(f"   Final dataset: {len(df)} samples")
        logger.info(f"   Removed {initial_count - len(df)} invalid samples")

        return df

    def generate_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate statistics about the training data.

        Args:
            df: Training DataFrame

        Returns:
            Statistics dictionary
        """
        stats = {
            'total_samples': len(df),
            'unique_agents': df['agent_id'].nunique(),
            'unique_clients': df['client_name'].nunique(),
            'date_range': {
                'earliest': df['timestamp'].min() if 'timestamp' in df.columns else None,
                'latest': df['timestamp'].max() if 'timestamp' in df.columns else None
            },
            'task_types': df['task_type'].value_counts().to_dict(),
            'domains': df['domain'].value_counts().to_dict(),
            'complexity_distribution': df['complexity'].value_counts().to_dict(),
            'agent_distribution': df['agent_id'].value_counts().head(10).to_dict(),
            'performance_stats': {
                'mean': float(df['actual_performance'].mean()),
                'median': float(df['actual_performance'].median()),
                'std': float(df['actual_performance'].std()),
                'min': float(df['actual_performance'].min()),
                'max': float(df['actual_performance'].max())
            },
            'duration_stats': {
                'mean_ms': float(df['actual_duration_ms'].mean()),
                'median_ms': float(df['actual_duration_ms'].median()),
                'std_ms': float(df['actual_duration_ms'].std())
            }
        }

        return stats

    def extract(self, output_path: str, min_samples: int = 100) -> bool:
        """
        Complete extraction pipeline.

        Args:
            output_path: Path to save training CSV
            min_samples: Minimum samples required

        Returns:
            True if successful
        """
        logger.info("🚀 Starting data extraction pipeline...")

        # Step 1: Extract raw data
        workflows = self.extract_workflows_from_redis()
        performance_records = self.extract_agent_performance_data()
        memory_entities = self.extract_from_crystalline_memory()

        # Combine all data sources
        all_workflows = workflows + [e for e in memory_entities if e.get('type') == 'workflow']

        if not all_workflows:
            logger.error("❌ No workflow data found in Redis!")
            return False

        # Step 2: Transform to training format
        df = self.transform_to_training_format(all_workflows, performance_records)

        if df.empty:
            logger.error("❌ No valid training samples extracted!")
            return False

        # Step 3: Validate and clean
        df = self.validate_and_clean_data(df)

        # Step 4: Check minimum samples
        if len(df) < min_samples:
            logger.warning(
                f"⚠️  Only {len(df)} samples extracted (minimum: {min_samples})"
            )
            logger.warning("   Consider:")
            logger.warning("   - Reducing min_samples")
            logger.warning("   - Increasing lookback_days")
            logger.warning("   - Lowering min_performance threshold")

        # Step 5: Generate statistics
        stats = self.generate_statistics(df)

        logger.info("\n📊 Dataset Statistics:")
        logger.info(f"   Total samples: {stats['total_samples']}")
        logger.info(f"   Unique agents: {stats['unique_agents']}")
        logger.info(f"   Unique clients: {stats['unique_clients']}")
        logger.info(f"   Avg performance: {stats['performance_stats']['mean']:.3f}")
        logger.info(f"   Avg duration: {stats['duration_stats']['mean_ms']:.0f}ms")

        logger.info("\n🎯 Agent Distribution:")
        for agent, count in list(stats['agent_distribution'].items())[:5]:
            logger.info(f"   {agent}: {count} samples")

        logger.info("\n📋 Task Types:")
        for task_type, count in stats['task_types'].items():
            logger.info(f"   {task_type}: {count} samples")

        # Step 6: Save to CSV
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        df.to_csv(output_file, index=False)
        logger.info(f"\n✅ Training data saved to: {output_file}")
        logger.info(f"   Rows: {len(df)}")
        logger.info(f"   Columns: {len(df.columns)}")

        # Save statistics
        stats_file = output_file.parent / f"{output_file.stem}_stats.json"
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2, default=str)

        logger.info(f"✅ Statistics saved to: {stats_file}")

        return True


def main():
    parser = argparse.ArgumentParser(
        description="Extract training data from ORCHESTRAI crystalline memory"
    )
    parser.add_argument(
        "--redis-url",
        type=str,
        default="redis://localhost:6379",
        help="Redis connection URL"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./data/training_data.csv",
        help="Output CSV file path"
    )
    parser.add_argument(
        "--min-samples",
        type=int,
        default=100,
        help="Minimum number of training samples required"
    )
    parser.add_argument(
        "--min-performance",
        type=float,
        default=0.5,
        help="Minimum performance score to include (0-1)"
    )
    parser.add_argument(
        "--lookback-days",
        type=int,
        default=90,
        help="Number of days of history to extract"
    )

    args = parser.parse_args()

    # Create extractor
    extractor = ORCHESTRAIDataExtractor(
        redis_url=args.redis_url,
        min_performance=args.min_performance,
        lookback_days=args.lookback_days
    )

    # Run extraction
    success = extractor.extract(
        output_path=args.output,
        min_samples=args.min_samples
    )

    if success:
        logger.info("\n🎉 Data extraction completed successfully!")
        logger.info(f"\nNext steps:")
        logger.info(f"1. Review the extracted data: {args.output}")
        logger.info(f"2. Train the model:")
        logger.info(f"   python training/train_agent_selector.py --data {args.output}")
        sys.exit(0)
    else:
        logger.error("\n❌ Data extraction failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
