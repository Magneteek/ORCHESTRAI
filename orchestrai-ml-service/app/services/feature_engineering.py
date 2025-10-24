"""
Feature Engineering Pipeline for Agent Selection.

Transforms task context into ML-ready features.
"""

from typing import Dict, List, Any, Optional
import numpy as np
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """
    Feature engineering for agent selection model.

    Extracts and transforms features from task context:
    - Task characteristics (type, domain, complexity)
    - Capability matching scores
    - Temporal features (time of day, day of week)
    - Priority encoding
    - Historical context indicators
    """

    def __init__(self):
        """Initialize feature engineer with encoding mappings."""

        # Task type encoding
        self.task_types = {
            'content-creation': 0,
            'seo-analysis': 1,
            'keyword-research': 2,
            'competitor-analysis': 3,
            'technical-seo': 4,
            'link-building': 5,
            'content-optimization': 6,
            'multi-language-content': 7,
            'psychographic-targeting': 8,
            'general': 9
        }

        # Domain encoding
        self.domains = {
            'content': 0,
            'seo': 1,
            'research': 2,
            'technical': 3,
            'marketing': 4,
            'development': 5,
            'design': 6,
            'general': 7
        }

        # Complexity encoding
        self.complexity_scores = {
            'low': 0.3,
            'medium': 0.6,
            'high': 0.9,
            'very-high': 1.0
        }

        # Priority encoding
        self.priority_scores = {
            'low': 0.3,
            'medium': 0.6,
            'high': 1.0
        }

        # Feature names (must match training data)
        self.feature_names = [
            # Task characteristics
            'task_type_encoded',
            'domain_encoded',
            'complexity_score',
            'priority_score',

            # Capability features
            'num_required_capabilities',
            'capability_diversity_score',
            'has_ml_capability',
            'has_nlp_capability',
            'has_seo_capability',
            'has_content_capability',

            # Temporal features
            'hour_of_day_normalized',
            'day_of_week_normalized',
            'is_weekend',
            'is_business_hours',

            # Context features
            'has_historical_context',
            'has_client_context',
            'has_project_context',

            # Workload features
            'estimated_word_count_normalized',
            'estimated_complexity_multiplier',

            # Language features
            'is_multi_language',
            'target_language_encoded',

            # Quality requirements
            'quality_threshold_normalized',
            'requires_psychographic_targeting',
        ]

        self.n_features = len(self.feature_names)
        logger.info(f"FeatureEngineer initialized with {self.n_features} features")

    def extract_features(self, task_context: Dict[str, Any]) -> np.ndarray:
        """
        Extract feature vector from task context.

        Args:
            task_context: Dictionary with task information
                - type: Task type
                - domain: Task domain
                - complexity: Task complexity
                - required_capabilities: List of capabilities
                - priority: Task priority
                - client_name: Client name (optional)
                - project_uuid: Project UUID (optional)
                - historical_context: Historical data (optional)

        Returns:
            Feature vector as numpy array
        """
        features = {}

        # Task characteristics
        features['task_type_encoded'] = self._encode_task_type(
            task_context.get('type', 'general')
        )
        features['domain_encoded'] = self._encode_domain(
            task_context.get('domain', 'general')
        )
        features['complexity_score'] = self._encode_complexity(
            task_context.get('complexity', 'medium')
        )
        features['priority_score'] = self._encode_priority(
            task_context.get('priority', 'medium')
        )

        # Capability features
        required_capabilities = task_context.get('required_capabilities', [])
        features.update(self._extract_capability_features(required_capabilities))

        # Temporal features
        features.update(self._extract_temporal_features())

        # Context features
        features['has_historical_context'] = 1.0 if task_context.get('historical_context') else 0.0
        features['has_client_context'] = 1.0 if task_context.get('client_name') else 0.0
        features['has_project_context'] = 1.0 if task_context.get('project_uuid') else 0.0

        # Workload features
        features.update(self._extract_workload_features(task_context))

        # Language features
        features.update(self._extract_language_features(task_context))

        # Quality requirements
        features['quality_threshold_normalized'] = task_context.get('quality_threshold', 0.95)
        features['requires_psychographic_targeting'] = 1.0 if task_context.get(
            'psychographic_targeting', False
        ) else 0.0

        # Convert to numpy array in correct order
        feature_vector = np.array([
            features.get(name, 0.0) for name in self.feature_names
        ], dtype=np.float32)

        logger.debug(f"Extracted {len(feature_vector)} features from task context")
        return feature_vector

    def _encode_task_type(self, task_type: str) -> float:
        """Encode task type as normalized float."""
        encoded = self.task_types.get(task_type.lower(), self.task_types['general'])
        return encoded / len(self.task_types)

    def _encode_domain(self, domain: str) -> float:
        """Encode domain as normalized float."""
        encoded = self.domains.get(domain.lower(), self.domains['general'])
        return encoded / len(self.domains)

    def _encode_complexity(self, complexity: str) -> float:
        """Encode complexity as score."""
        return self.complexity_scores.get(complexity.lower(), 0.6)

    def _encode_priority(self, priority: str) -> float:
        """Encode priority as score."""
        return self.priority_scores.get(priority.lower(), 0.6)

    def _extract_capability_features(self, capabilities: List[str]) -> Dict[str, float]:
        """Extract capability-based features."""
        features = {}

        # Number of required capabilities
        features['num_required_capabilities'] = len(capabilities)

        # Capability diversity (unique capability types / total)
        unique_caps = len(set(capabilities))
        features['capability_diversity_score'] = (
            unique_caps / max(len(capabilities), 1)
        )

        # Specific capability flags
        cap_lower = [c.lower() for c in capabilities]
        features['has_ml_capability'] = 1.0 if any('ml' in c or 'machine-learning' in c for c in cap_lower) else 0.0
        features['has_nlp_capability'] = 1.0 if any('nlp' in c or 'natural-language' in c for c in cap_lower) else 0.0
        features['has_seo_capability'] = 1.0 if any('seo' in c for c in cap_lower) else 0.0
        features['has_content_capability'] = 1.0 if any('content' in c for c in cap_lower) else 0.0

        return features

    def _extract_temporal_features(self) -> Dict[str, float]:
        """Extract time-based features."""
        now = datetime.now()

        features = {}
        features['hour_of_day_normalized'] = now.hour / 24.0
        features['day_of_week_normalized'] = now.weekday() / 7.0
        features['is_weekend'] = 1.0 if now.weekday() >= 5 else 0.0
        features['is_business_hours'] = 1.0 if 9 <= now.hour <= 17 else 0.0

        return features

    def _extract_workload_features(self, task_context: Dict[str, Any]) -> Dict[str, float]:
        """Extract workload-related features."""
        features = {}

        # Estimated word count (if provided)
        word_count = task_context.get('estimated_word_count', 1000)
        features['estimated_word_count_normalized'] = min(word_count / 5000.0, 1.0)

        # Complexity multiplier
        complexity = task_context.get('complexity', 'medium')
        multipliers = {'low': 0.5, 'medium': 1.0, 'high': 1.5, 'very-high': 2.0}
        features['estimated_complexity_multiplier'] = multipliers.get(complexity, 1.0)

        return features

    def _extract_language_features(self, task_context: Dict[str, Any]) -> Dict[str, float]:
        """Extract language-related features."""
        features = {}

        # Multi-language flag
        target_languages = task_context.get('target_languages', [])
        features['is_multi_language'] = 1.0 if len(target_languages) > 1 else 0.0

        # Target language encoding
        language_codes = {
            'en': 0, 'nl': 1, 'de': 2, 'es': 3, 'fr': 4, 'it': 5, 'pt': 6
        }
        primary_lang = target_languages[0] if target_languages else 'en'
        features['target_language_encoded'] = language_codes.get(primary_lang, 0) / len(language_codes)

        return features

    def get_feature_names(self) -> List[str]:
        """Get list of feature names."""
        return self.feature_names

    def validate_features(self, features: np.ndarray) -> bool:
        """
        Validate feature vector.

        Args:
            features: Feature vector to validate

        Returns:
            True if valid
        """
        if features is None:
            logger.error("Features are None")
            return False

        if not isinstance(features, np.ndarray):
            logger.error(f"Features must be numpy array, got {type(features)}")
            return False

        if features.shape[0] != self.n_features:
            logger.error(
                f"Feature count mismatch: expected {self.n_features}, got {features.shape[0]}"
            )
            return False

        return True
