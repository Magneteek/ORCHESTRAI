#!/usr/bin/env python3
"""
Generate Synthetic Training Data for ORCHESTRAI Agent Selection.

Creates realistic synthetic data for testing and initial model training
when historical data is not yet available.

Usage:
    python training/generate_synthetic_data.py --output synthetic_training_data.csv --samples 1000
"""

import argparse
import logging
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random

import pandas as pd
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SyntheticDataGenerator:
    """
    Generate realistic synthetic training data for agent selection model.
    """

    def __init__(self, seed: int = 42):
        """
        Initialize synthetic data generator.

        Args:
            seed: Random seed for reproducibility
        """
        random.seed(seed)
        np.random.seed(seed)

        # Define ORCHESTRAI agent registry (matching actual agents)
        self.agents = {
            'content-writer-specialist': {
                'domain': 'content',
                'capabilities': ['multi-language', 'seo-optimization', 'content-creation', 'psychographic-targeting'],
                'avg_performance': 0.88,
                'avg_duration_ms': 45000,
                'task_types': ['content-creation', 'article-writing', 'blog-post']
            },
            'seo-keyword-research': {
                'domain': 'seo',
                'capabilities': ['keyword-research', 'competitor-analysis', 'search-intent-analysis'],
                'avg_performance': 0.92,
                'avg_duration_ms': 30000,
                'task_types': ['seo-research', 'keyword-analysis', 'competitor-research']
            },
            'seo-content-optimization': {
                'domain': 'seo',
                'capabilities': ['seo-optimization', 'content-analysis', 'semantic-clustering'],
                'avg_performance': 0.90,
                'avg_duration_ms': 35000,
                'task_types': ['content-optimization', 'seo-enhancement']
            },
            'multi-language-content-adapter': {
                'domain': 'content',
                'capabilities': ['multi-language', 'cultural-adaptation', 'translation'],
                'avg_performance': 0.87,
                'avg_duration_ms': 50000,
                'task_types': ['translation', 'localization', 'multi-language-content']
            },
            'direct-response-copywriter': {
                'domain': 'content',
                'capabilities': ['copywriting', 'conversion-optimization', 'persuasive-writing'],
                'avg_performance': 0.89,
                'avg_duration_ms': 40000,
                'task_types': ['ad-copy', 'sales-copy', 'landing-page-copy']
            },
            'seo-competitor-analysis': {
                'domain': 'seo',
                'capabilities': ['competitor-analysis', 'gap-analysis', 'market-research'],
                'avg_performance': 0.91,
                'avg_duration_ms': 55000,
                'task_types': ['competitor-research', 'market-analysis', 'gap-analysis']
            },
            'wireframe-creation-specialist': {
                'domain': 'design',
                'capabilities': ['wireframing', 'ux-design', 'information-architecture'],
                'avg_performance': 0.86,
                'avg_duration_ms': 60000,
                'task_types': ['wireframe-creation', 'ux-design', 'layout-design']
            },
            'frontend-architect-specialist': {
                'domain': 'development',
                'capabilities': ['frontend-development', 'react', 'typescript', 'architecture'],
                'avg_performance': 0.93,
                'avg_duration_ms': 90000,
                'task_types': ['frontend-development', 'component-creation', 'architecture']
            },
            'backend-development-specialist': {
                'domain': 'development',
                'capabilities': ['backend-development', 'api-design', 'database-design'],
                'avg_performance': 0.94,
                'avg_duration_ms': 120000,
                'task_types': ['api-development', 'backend-development', 'database-design']
            },
            'google-ads-specialist': {
                'domain': 'advertising',
                'capabilities': ['google-ads', 'ppc', 'campaign-optimization'],
                'avg_performance': 0.85,
                'avg_duration_ms': 45000,
                'task_types': ['ad-campaign-creation', 'ppc-optimization', 'google-ads']
            }
        }

        # Define task metadata
        self.task_types = list(set(
            task for agent in self.agents.values()
            for task in agent['task_types']
        ))

        self.domains = list(set(agent['domain'] for agent in self.agents.values()))

        self.complexities = ['low', 'medium', 'high', 'very-high']
        self.priorities = ['low', 'medium', 'high']

        self.client_names = [
            'TechCorp', 'HealthPlus', 'RetailMart', 'FinanceHub', 'EduLearn',
            'TravelWorld', 'FoodDelight', 'AutoMotive', 'RealEstate', 'FashionStyle'
        ]

        self.languages = ['en', 'es', 'nl', 'de', 'sl', 'fr', 'it']

    def generate_samples(self, n_samples: int = 1000) -> pd.DataFrame:
        """
        Generate synthetic training samples.

        Args:
            n_samples: Number of samples to generate

        Returns:
            DataFrame with training data
        """
        logger.info(f"🎲 Generating {n_samples} synthetic training samples...")

        samples = []

        for i in range(n_samples):
            sample = self._generate_single_sample()
            samples.append(sample)

            if (i + 1) % 100 == 0:
                logger.info(f"   Generated {i + 1}/{n_samples} samples")

        df = pd.DataFrame(samples)
        logger.info(f"✅ Generated {len(df)} samples")

        return df

    def _generate_single_sample(self) -> Dict[str, Any]:
        """
        Generate a single realistic training sample.

        Returns:
            Sample dictionary
        """
        # Select agent (this determines many other features)
        agent_id = random.choice(list(self.agents.keys()))
        agent_info = self.agents[agent_id]

        # Select task type from agent's specialization
        task_type = random.choice(agent_info['task_types'])

        # Domain matches agent
        domain = agent_info['domain']

        # Complexity affects performance and duration
        complexity = random.choice(self.complexities)
        complexity_multiplier = {
            'low': 0.7,
            'medium': 1.0,
            'high': 1.3,
            'very-high': 1.6
        }[complexity]

        # Priority
        priority = random.choice(self.priorities)

        # Required capabilities - match agent's capabilities with some noise
        num_capabilities = random.randint(1, min(3, len(agent_info['capabilities'])))
        required_capabilities = random.sample(agent_info['capabilities'], num_capabilities)

        # Add some random capabilities occasionally (20% chance)
        if random.random() < 0.2:
            all_capabilities = set(cap for agent in self.agents.values() for cap in agent['capabilities'])
            other_caps = list(all_capabilities - set(required_capabilities))
            if other_caps:
                required_capabilities.append(random.choice(other_caps))

        # Client and project
        client_name = random.choice(self.client_names)
        project_uuid = f"proj_{random.randint(1000, 9999)}"

        # Performance score - based on agent's avg with noise and complexity penalty
        base_performance = agent_info['avg_performance']
        complexity_penalty = (complexity_multiplier - 1.0) * 0.05  # Harder tasks slightly lower performance
        noise = np.random.normal(0, 0.05)  # ±5% noise
        actual_performance = np.clip(base_performance - complexity_penalty + noise, 0.5, 1.0)

        # Duration - based on agent's avg with complexity multiplier and noise
        base_duration = agent_info['avg_duration_ms']
        noise_factor = np.random.normal(1.0, 0.15)  # ±15% noise
        actual_duration_ms = int(base_duration * complexity_multiplier * noise_factor)
        actual_duration_ms = max(5000, min(300000, actual_duration_ms))  # 5s to 5min range

        # Additional features
        estimated_word_count = None
        if domain == 'content':
            # Content tasks have word counts
            base_words = {
                'low': 500,
                'medium': 1500,
                'high': 3000,
                'very-high': 5000
            }[complexity]
            estimated_word_count = int(base_words * np.random.normal(1.0, 0.2))

        target_languages = ['en']
        if 'multi-language' in required_capabilities:
            num_languages = random.randint(2, 4)
            target_languages = random.sample(self.languages, num_languages)

        quality_threshold = random.choice([0.90, 0.95, 0.98])

        psychographic_targeting = 'psychographic-targeting' in required_capabilities

        # Timestamp - random within last 90 days
        days_ago = random.randint(0, 90)
        timestamp = (datetime.now() - timedelta(days=days_ago)).isoformat()

        return {
            'task_type': task_type,
            'domain': domain,
            'complexity': complexity,
            'priority': priority,
            'required_capabilities': json.dumps(required_capabilities),
            'client_name': client_name,
            'project_uuid': project_uuid,
            'agent_id': agent_id,
            'actual_performance': round(actual_performance, 3),
            'actual_duration_ms': actual_duration_ms,
            'estimated_word_count': estimated_word_count,
            'target_languages': json.dumps(target_languages),
            'quality_threshold': quality_threshold,
            'psychographic_targeting': psychographic_targeting,
            'timestamp': timestamp
        }

    def add_noise_and_variations(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add realistic noise and variations to the dataset.

        Args:
            df: Clean synthetic data

        Returns:
            Data with added noise
        """
        logger.info("🌊 Adding realistic noise and variations...")

        # Some samples with suboptimal agent selection (20%)
        n_suboptimal = int(len(df) * 0.2)
        suboptimal_indices = np.random.choice(df.index, n_suboptimal, replace=False)

        for idx in suboptimal_indices:
            # Select a different agent
            current_agent = df.loc[idx, 'agent_id']
            other_agents = [a for a in self.agents.keys() if a != current_agent]
            df.loc[idx, 'agent_id'] = random.choice(other_agents)

            # Lower performance for wrong agent
            df.loc[idx, 'actual_performance'] *= random.uniform(0.7, 0.9)

            # Higher duration for wrong agent
            df.loc[idx, 'actual_duration_ms'] *= random.uniform(1.1, 1.5)

        # Some missing values (5%)
        n_missing = int(len(df) * 0.05)
        missing_indices = np.random.choice(df.index, n_missing, replace=False)

        for idx in missing_indices:
            field = random.choice(['estimated_word_count', 'client_name', 'project_uuid'])
            df.loc[idx, field] = None

        logger.info(f"   Added {n_suboptimal} suboptimal selections")
        logger.info(f"   Added {n_missing} missing values")

        return df

    def generate_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate statistics about the synthetic dataset.

        Args:
            df: Synthetic DataFrame

        Returns:
            Statistics dictionary
        """
        stats = {
            'total_samples': len(df),
            'unique_agents': df['agent_id'].nunique(),
            'unique_clients': df['client_name'].nunique(),
            'task_types': df['task_type'].value_counts().to_dict(),
            'domains': df['domain'].value_counts().to_dict(),
            'complexity_distribution': df['complexity'].value_counts().to_dict(),
            'priority_distribution': df['priority'].value_counts().to_dict(),
            'agent_distribution': df['agent_id'].value_counts().to_dict(),
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
                'std_ms': float(df['actual_duration_ms'].std()),
                'min_ms': float(df['actual_duration_ms'].min()),
                'max_ms': float(df['actual_duration_ms'].max())
            }
        }

        return stats


def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic training data for ORCHESTRAI agent selection"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./data/synthetic_training_data.csv",
        help="Output CSV file path"
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=1000,
        help="Number of training samples to generate"
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility"
    )
    parser.add_argument(
        "--add-noise",
        action="store_true",
        help="Add realistic noise and variations to data"
    )

    args = parser.parse_args()

    # Create generator
    generator = SyntheticDataGenerator(seed=args.seed)

    # Generate samples
    df = generator.generate_samples(n_samples=args.samples)

    # Add noise if requested
    if args.add_noise:
        df = generator.add_noise_and_variations(df)

    # Generate statistics
    stats = generator.generate_statistics(df)

    logger.info("\n📊 Dataset Statistics:")
    logger.info(f"   Total samples: {stats['total_samples']}")
    logger.info(f"   Unique agents: {stats['unique_agents']}")
    logger.info(f"   Unique clients: {stats['unique_clients']}")
    logger.info(f"   Avg performance: {stats['performance_stats']['mean']:.3f}")
    logger.info(f"   Avg duration: {stats['duration_stats']['mean_ms']:.0f}ms")

    logger.info("\n🎯 Agent Distribution:")
    for agent, count in list(stats['agent_distribution'].items())[:5]:
        logger.info(f"   {agent}: {count} samples")

    logger.info("\n📋 Domain Distribution:")
    for domain, count in stats['domains'].items():
        logger.info(f"   {domain}: {count} samples")

    logger.info("\n⚙️ Complexity Distribution:")
    for complexity, count in stats['complexity_distribution'].items():
        logger.info(f"   {complexity}: {count} samples")

    # Save to CSV
    output_file = Path(args.output)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(output_file, index=False)
    logger.info(f"\n✅ Synthetic data saved to: {output_file}")
    logger.info(f"   Rows: {len(df)}")
    logger.info(f"   Columns: {len(df.columns)}")

    # Save statistics
    stats_file = output_file.parent / f"{output_file.stem}_stats.json"
    with open(stats_file, 'w') as f:
        json.dump(stats, f, indent=2, default=str)

    logger.info(f"✅ Statistics saved to: {stats_file}")

    logger.info("\n🎉 Synthetic data generation completed!")
    logger.info(f"\nNext steps:")
    logger.info(f"1. Review the synthetic data: {output_file}")
    logger.info(f"2. Train the model:")
    logger.info(f"   python training/train_agent_selector.py --data {output_file}")


if __name__ == "__main__":
    main()
