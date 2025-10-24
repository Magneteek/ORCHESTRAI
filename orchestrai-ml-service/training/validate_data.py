#!/usr/bin/env python3
"""
Validate Training Data Quality.

Performs comprehensive validation checks on training data before model training.

Usage:
    python training/validate_data.py --data training_data.csv
"""

import argparse
import logging
import json
from pathlib import Path
from typing import Dict, List, Any, Tuple

import pandas as pd
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TrainingDataValidator:
    """
    Validate training data quality and completeness.
    """

    # Required columns
    REQUIRED_COLUMNS = [
        'task_type', 'domain', 'complexity', 'priority',
        'required_capabilities', 'agent_id',
        'actual_performance', 'actual_duration_ms'
    ]

    # Optional columns
    OPTIONAL_COLUMNS = [
        'client_name', 'project_uuid', 'estimated_word_count',
        'target_languages', 'quality_threshold',
        'psychographic_targeting', 'timestamp'
    ]

    # Valid values for categorical columns
    VALID_COMPLEXITIES = ['low', 'medium', 'high', 'very-high']
    VALID_PRIORITIES = ['low', 'medium', 'high']

    # Validation thresholds
    MIN_SAMPLES = 100
    MIN_AGENTS = 5
    MIN_PERFORMANCE = 0.0
    MAX_PERFORMANCE = 1.0
    MIN_DURATION_MS = 1000  # 1 second
    MAX_DURATION_MS = 600000  # 10 minutes
    MAX_MISSING_PERCENT = 10.0

    def __init__(self, data_path: str):
        """
        Initialize validator.

        Args:
            data_path: Path to training CSV file
        """
        self.data_path = Path(data_path)
        self.df = None
        self.validation_results = {
            'passed': [],
            'warnings': [],
            'errors': []
        }

    def validate(self) -> Tuple[bool, Dict[str, Any]]:
        """
        Run all validation checks.

        Returns:
            Tuple of (is_valid, validation_results)
        """
        logger.info(f"🔍 Validating training data: {self.data_path}")

        # Check file exists
        if not self.data_path.exists():
            self._add_error(f"File not found: {self.data_path}")
            return False, self.validation_results

        # Load data
        try:
            self.df = pd.read_csv(self.data_path)
            self._add_passed(f"Successfully loaded {len(self.df)} rows")
        except Exception as e:
            self._add_error(f"Failed to load CSV: {e}")
            return False, self.validation_results

        # Run validation checks
        self._validate_columns()
        self._validate_data_types()
        self._validate_missing_values()
        self._validate_categorical_values()
        self._validate_numeric_ranges()
        self._validate_data_quality()
        self._validate_distributions()
        self._validate_agent_coverage()

        # Generate summary
        self._print_validation_summary()

        # Determine if validation passed
        is_valid = len(self.validation_results['errors']) == 0

        return is_valid, self.validation_results

    def _validate_columns(self):
        """Validate required columns are present."""
        logger.info("\n📋 Checking columns...")

        missing_cols = [col for col in self.REQUIRED_COLUMNS if col not in self.df.columns]

        if missing_cols:
            self._add_error(f"Missing required columns: {missing_cols}")
        else:
            self._add_passed(f"All {len(self.REQUIRED_COLUMNS)} required columns present")

        # Check optional columns
        present_optional = [col for col in self.OPTIONAL_COLUMNS if col in self.df.columns]
        self._add_passed(f"{len(present_optional)}/{len(self.OPTIONAL_COLUMNS)} optional columns present")

    def _validate_data_types(self):
        """Validate data types are correct."""
        logger.info("\n🔢 Checking data types...")

        # Check numeric columns
        numeric_cols = ['actual_performance', 'actual_duration_ms']
        for col in numeric_cols:
            if col in self.df.columns:
                try:
                    pd.to_numeric(self.df[col])
                    self._add_passed(f"Column '{col}' is numeric")
                except:
                    self._add_error(f"Column '{col}' contains non-numeric values")

        # Check JSON columns
        json_cols = ['required_capabilities', 'target_languages']
        for col in json_cols:
            if col in self.df.columns:
                try:
                    # Test first 10 rows
                    for val in self.df[col].head(10):
                        if pd.notna(val):
                            json.loads(val)
                    self._add_passed(f"Column '{col}' contains valid JSON")
                except:
                    self._add_error(f"Column '{col}' contains invalid JSON")

    def _validate_missing_values(self):
        """Validate missing values are within acceptable limits."""
        logger.info("\n❓ Checking missing values...")

        total_rows = len(self.df)

        for col in self.REQUIRED_COLUMNS:
            if col in self.df.columns:
                missing_count = self.df[col].isnull().sum()
                missing_percent = (missing_count / total_rows) * 100

                if missing_count > 0:
                    if missing_percent > self.MAX_MISSING_PERCENT:
                        self._add_error(
                            f"Column '{col}': {missing_percent:.1f}% missing "
                            f"(max: {self.MAX_MISSING_PERCENT}%)"
                        )
                    else:
                        self._add_warning(
                            f"Column '{col}': {missing_percent:.1f}% missing values"
                        )
                else:
                    self._add_passed(f"Column '{col}': No missing values")

    def _validate_categorical_values(self):
        """Validate categorical values are valid."""
        logger.info("\n📊 Checking categorical values...")

        # Complexity
        if 'complexity' in self.df.columns:
            invalid = self.df[~self.df['complexity'].isin(self.VALID_COMPLEXITIES)]
            if len(invalid) > 0:
                unique_invalid = invalid['complexity'].unique()
                self._add_error(
                    f"Invalid complexity values: {unique_invalid}. "
                    f"Valid: {self.VALID_COMPLEXITIES}"
                )
            else:
                self._add_passed(f"All complexity values are valid")

        # Priority
        if 'priority' in self.df.columns:
            invalid = self.df[~self.df['priority'].isin(self.VALID_PRIORITIES)]
            if len(invalid) > 0:
                unique_invalid = invalid['priority'].unique()
                self._add_error(
                    f"Invalid priority values: {unique_invalid}. "
                    f"Valid: {self.VALID_PRIORITIES}"
                )
            else:
                self._add_passed(f"All priority values are valid")

    def _validate_numeric_ranges(self):
        """Validate numeric values are within expected ranges."""
        logger.info("\n🎯 Checking numeric ranges...")

        # Performance scores
        if 'actual_performance' in self.df.columns:
            out_of_range = self.df[
                ~self.df['actual_performance'].between(self.MIN_PERFORMANCE, self.MAX_PERFORMANCE)
            ]
            if len(out_of_range) > 0:
                self._add_error(
                    f"{len(out_of_range)} performance scores outside range "
                    f"[{self.MIN_PERFORMANCE}, {self.MAX_PERFORMANCE}]"
                )
            else:
                self._add_passed(f"All performance scores in valid range [0, 1]")

        # Durations
        if 'actual_duration_ms' in self.df.columns:
            too_short = self.df[self.df['actual_duration_ms'] < self.MIN_DURATION_MS]
            too_long = self.df[self.df['actual_duration_ms'] > self.MAX_DURATION_MS]

            if len(too_short) > 0:
                self._add_warning(
                    f"{len(too_short)} durations < {self.MIN_DURATION_MS}ms (suspiciously fast)"
                )
            if len(too_long) > 0:
                self._add_warning(
                    f"{len(too_long)} durations > {self.MAX_DURATION_MS}ms (suspiciously slow)"
                )

            if len(too_short) == 0 and len(too_long) == 0:
                self._add_passed(f"All durations in reasonable range")

    def _validate_data_quality(self):
        """Validate overall data quality."""
        logger.info("\n✨ Checking data quality...")

        # Check for duplicates
        duplicates = self.df.duplicated(subset=['agent_id', 'timestamp']).sum()
        if duplicates > 0:
            self._add_warning(f"Found {duplicates} potential duplicate records")
        else:
            self._add_passed(f"No duplicate records found")

        # Check minimum sample size
        if len(self.df) < self.MIN_SAMPLES:
            self._add_warning(
                f"Only {len(self.df)} samples (recommended minimum: {self.MIN_SAMPLES})"
            )
        else:
            self._add_passed(f"Sufficient samples ({len(self.df)} >= {self.MIN_SAMPLES})")

    def _validate_distributions(self):
        """Validate data distributions are reasonable."""
        logger.info("\n📈 Checking distributions...")

        # Agent distribution
        if 'agent_id' in self.df.columns:
            agent_counts = self.df['agent_id'].value_counts()
            min_samples_per_agent = agent_counts.min()
            max_samples_per_agent = agent_counts.max()

            if min_samples_per_agent < 10:
                self._add_warning(
                    f"Some agents have <10 samples (min: {min_samples_per_agent})"
                )

            # Check for extreme imbalance
            imbalance_ratio = max_samples_per_agent / min_samples_per_agent
            if imbalance_ratio > 10:
                self._add_warning(
                    f"High class imbalance (ratio: {imbalance_ratio:.1f}:1)"
                )
            else:
                self._add_passed(f"Agent distribution is reasonably balanced")

        # Performance distribution
        if 'actual_performance' in self.df.columns:
            perf_mean = self.df['actual_performance'].mean()
            perf_std = self.df['actual_performance'].std()

            if perf_std < 0.05:
                self._add_warning(
                    f"Low performance variance (std: {perf_std:.3f}) - may limit model learning"
                )
            else:
                self._add_passed(
                    f"Performance has good variance (mean: {perf_mean:.3f}, std: {perf_std:.3f})"
                )

    def _validate_agent_coverage(self):
        """Validate agent coverage is sufficient."""
        logger.info("\n🤖 Checking agent coverage...")

        if 'agent_id' in self.df.columns:
            unique_agents = self.df['agent_id'].nunique()

            if unique_agents < self.MIN_AGENTS:
                self._add_error(
                    f"Only {unique_agents} unique agents (minimum: {self.MIN_AGENTS})"
                )
            else:
                self._add_passed(f"Good agent coverage ({unique_agents} unique agents)")

                # List top agents
                top_agents = self.df['agent_id'].value_counts().head(5)
                logger.info(f"\n   Top 5 agents:")
                for agent, count in top_agents.items():
                    logger.info(f"   - {agent}: {count} samples")

    def _add_passed(self, message: str):
        """Add passed validation."""
        self.validation_results['passed'].append(message)
        logger.info(f"   ✅ {message}")

    def _add_warning(self, message: str):
        """Add warning."""
        self.validation_results['warnings'].append(message)
        logger.warning(f"   ⚠️  {message}")

    def _add_error(self, message: str):
        """Add error."""
        self.validation_results['errors'].append(message)
        logger.error(f"   ❌ {message}")

    def _print_validation_summary(self):
        """Print validation summary."""
        logger.info("\n" + "="*70)
        logger.info("📊 VALIDATION SUMMARY")
        logger.info("="*70)

        logger.info(f"\n✅ Passed: {len(self.validation_results['passed'])}")
        logger.info(f"⚠️  Warnings: {len(self.validation_results['warnings'])}")
        logger.info(f"❌ Errors: {len(self.validation_results['errors'])}")

        if self.validation_results['errors']:
            logger.info("\n❌ ERRORS (must fix):")
            for error in self.validation_results['errors']:
                logger.info(f"   • {error}")

        if self.validation_results['warnings']:
            logger.info("\n⚠️  WARNINGS (review recommended):")
            for warning in self.validation_results['warnings']:
                logger.info(f"   • {warning}")

        logger.info("\n" + "="*70)


def main():
    parser = argparse.ArgumentParser(
        description="Validate training data quality"
    )
    parser.add_argument(
        "--data",
        type=str,
        required=True,
        help="Path to training CSV file"
    )
    parser.add_argument(
        "--output-report",
        type=str,
        help="Path to save validation report JSON"
    )

    args = parser.parse_args()

    # Create validator
    validator = TrainingDataValidator(args.data)

    # Run validation
    is_valid, results = validator.validate()

    # Save report if requested
    if args.output_report:
        report_path = Path(args.output_report)
        report_path.parent.mkdir(parents=True, exist_ok=True)

        with open(report_path, 'w') as f:
            json.dump(results, f, indent=2)

        logger.info(f"\n💾 Validation report saved to: {report_path}")

    # Exit with appropriate code
    if is_valid:
        logger.info("\n🎉 Validation PASSED - Data is ready for training!")
        exit(0)
    else:
        logger.error("\n❌ Validation FAILED - Please fix errors before training")
        exit(1)


if __name__ == "__main__":
    main()
