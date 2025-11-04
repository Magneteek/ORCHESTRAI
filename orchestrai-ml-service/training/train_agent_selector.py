#!/usr/bin/env python3
"""
Train Agent Selection Model.

This script:
1. Loads historical task data from ORCHESTRAI crystalline memory
2. Engineers features using FeatureEngineer
3. Trains hybrid ensemble model (RandomForest + XGBoost)
4. Evaluates model performance
5. Saves trained model for deployment
"""

import sys
import os
from pathlib import Path
import argparse
import logging
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import xgboost as xgb

from app.services.feature_engineering import FeatureEngineer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentSelectorTrainer:
    """
    Trainer for agent selection model.
    """

    def __init__(self, model_output_dir: str = "./models/agent_selector"):
        """
        Initialize trainer.

        Args:
            model_output_dir: Directory to save trained models
        """
        self.model_output_dir = Path(model_output_dir)
        self.model_output_dir.mkdir(parents=True, exist_ok=True)

        self.feature_engineer = FeatureEngineer()

        # Models
        self.agent_classifier = None
        self.performance_predictor = None
        self.duration_predictor = None
        self.label_encoder = None

        # Training data
        self.X_train = None
        self.X_val = None
        self.X_test = None
        self.y_agent_train = None
        self.y_agent_val = None
        self.y_agent_test = None
        self.y_perf_train = None
        self.y_perf_val = None
        self.y_perf_test = None
        self.y_dur_train = None
        self.y_dur_val = None
        self.y_dur_test = None

        # Metadata
        self.metadata = {}

    def load_training_data(self, data_path: str) -> pd.DataFrame:
        """
        Load training data from CSV.

        Expected columns:
        - task_type, domain, complexity, priority
        - required_capabilities (JSON list)
        - client_name, project_uuid
        - agent_id (target)
        - actual_performance (target)
        - actual_duration_ms (target)

        Args:
            data_path: Path to training data CSV

        Returns:
            DataFrame with training data
        """
        logger.info(f"📊 Loading training data from {data_path}")

        df = pd.read_csv(data_path)
        logger.info(f"   Loaded {len(df)} training samples")
        logger.info(f"   Columns: {list(df.columns)}")

        # Validate required columns
        required_cols = ['agent_id', 'actual_performance', 'actual_duration_ms']
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        return df

    def prepare_features_and_targets(self, df: pd.DataFrame):
        """
        Prepare feature matrix and target variables.

        Args:
            df: Training data DataFrame
        """
        logger.info("🔧 Engineering features...")

        # Extract features for each row
        features_list = []
        for idx, row in df.iterrows():
            task_context = {
                'type': row.get('task_type', 'general'),
                'domain': row.get('domain', 'general'),
                'complexity': row.get('complexity', 'medium'),
                'priority': row.get('priority', 'medium'),
                'required_capabilities': eval(row.get('required_capabilities', '[]')),
                'client_name': row.get('client_name'),
                'project_uuid': row.get('project_uuid'),
                'quality_threshold': row.get('quality_threshold', 0.95)
            }

            features = self.feature_engineer.extract_features(task_context)
            features_list.append(features)

        X = np.array(features_list)
        logger.info(f"   Feature matrix shape: {X.shape}")

        # Prepare targets
        y_agent = df['agent_id'].values
        y_performance = df['actual_performance'].values
        y_duration = df['actual_duration_ms'].values

        # Encode agent IDs
        self.label_encoder = LabelEncoder()
        y_agent_encoded = self.label_encoder.fit_transform(y_agent)

        logger.info(f"   Unique agents: {len(self.label_encoder.classes_)}")

        # Train/val/test split
        X_temp, self.X_test, y_agent_temp, self.y_agent_test, y_perf_temp, self.y_perf_test, y_dur_temp, self.y_dur_test = train_test_split(
            X, y_agent_encoded, y_performance, y_duration, test_size=0.15, random_state=42
        )

        self.X_train, self.X_val, self.y_agent_train, self.y_agent_val, self.y_perf_train, self.y_perf_val, self.y_dur_train, self.y_dur_val = train_test_split(
            X_temp, y_agent_temp, y_perf_temp, y_dur_temp, test_size=0.176, random_state=42
        )

        logger.info(f"   Train set: {len(self.X_train)}")
        logger.info(f"   Val set: {len(self.X_val)}")
        logger.info(f"   Test set: {len(self.X_test)}")

    def train_agent_classifier(self):
        """Train RandomForest classifier for agent selection."""
        logger.info("🌳 Training agent classifier (RandomForest)...")

        self.agent_classifier = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )

        self.agent_classifier.fit(self.X_train, self.y_agent_train)

        # Evaluate
        val_pred = self.agent_classifier.predict(self.X_val)
        val_accuracy = accuracy_score(self.y_agent_val, val_pred)

        # Cross-validation
        cv_scores = cross_val_score(
            self.agent_classifier,
            self.X_train,
            self.y_agent_train,
            cv=5,
            scoring='accuracy'
        )

        logger.info(f"   Validation accuracy: {val_accuracy:.3f}")
        logger.info(f"   CV accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

        self.metadata['agent_classifier'] = {
            'val_accuracy': float(val_accuracy),
            'cv_accuracy_mean': float(cv_scores.mean()),
            'cv_accuracy_std': float(cv_scores.std())
        }

    def train_performance_predictor(self):
        """Train XGBoost regressor for performance prediction."""
        logger.info("⚡ Training performance predictor (XGBoost)...")

        self.performance_predictor = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )

        self.performance_predictor.fit(
            self.X_train,
            self.y_perf_train,
            eval_set=[(self.X_val, self.y_perf_val)],
            verbose=False
        )

        # Evaluate
        val_pred = self.performance_predictor.predict(self.X_val)
        mae = np.mean(np.abs(val_pred - self.y_perf_val))
        r2 = 1 - (np.sum((self.y_perf_val - val_pred) ** 2) / np.sum((self.y_perf_val - self.y_perf_val.mean()) ** 2))

        logger.info(f"   Validation MAE: {mae:.4f}")
        logger.info(f"   Validation R²: {r2:.4f}")

        self.metadata['performance_predictor'] = {
            'val_mae': float(mae),
            'val_r2': float(r2)
        }

    def train_duration_predictor(self):
        """Train XGBoost regressor for duration estimation."""
        logger.info("⏱️  Training duration predictor (XGBoost)...")

        self.duration_predictor = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )

        self.duration_predictor.fit(
            self.X_train,
            self.y_dur_train,
            eval_set=[(self.X_val, self.y_dur_val)],
            verbose=False
        )

        # Evaluate
        val_pred = self.duration_predictor.predict(self.X_val)
        mae = np.mean(np.abs(val_pred - self.y_dur_val))
        mape = np.mean(np.abs((self.y_dur_val - val_pred) / self.y_dur_val)) * 100

        logger.info(f"   Validation MAE: {mae:.0f}ms")
        logger.info(f"   Validation MAPE: {mape:.1f}%")

        self.metadata['duration_predictor'] = {
            'val_mae_ms': float(mae),
            'val_mape_percent': float(mape)
        }

    def evaluate_test_set(self):
        """Final evaluation on test set."""
        logger.info("📊 Evaluating on test set...")

        # Agent classification
        test_pred = self.agent_classifier.predict(self.X_test)
        test_accuracy = accuracy_score(self.y_agent_test, test_pred)

        logger.info(f"   Test accuracy: {test_accuracy:.3f}")

        # Performance prediction
        perf_pred = self.performance_predictor.predict(self.X_test)
        perf_mae = np.mean(np.abs(perf_pred - self.y_perf_test))

        logger.info(f"   Performance MAE: {perf_mae:.4f}")

        # Duration prediction
        dur_pred = self.duration_predictor.predict(self.X_test)
        dur_mae = np.mean(np.abs(dur_pred - self.y_dur_test))

        logger.info(f"   Duration MAE: {dur_mae:.0f}ms")

        self.metadata['test_metrics'] = {
            'agent_accuracy': float(test_accuracy),
            'performance_mae': float(perf_mae),
            'duration_mae_ms': float(dur_mae)
        }

    def save_models(self):
        """Save trained models to disk."""
        logger.info(f"💾 Saving models to {self.model_output_dir}")

        # Save model components
        joblib.dump(self.agent_classifier, self.model_output_dir / "agent_classifier.pkl")
        joblib.dump(self.performance_predictor, self.model_output_dir / "performance_predictor.pkl")
        joblib.dump(self.duration_predictor, self.model_output_dir / "duration_predictor.pkl")
        joblib.dump(self.label_encoder, self.model_output_dir / "label_encoder.pkl")

        # Save metadata
        self.metadata['feature_names'] = self.feature_engineer.get_feature_names()
        self.metadata['n_features'] = self.feature_engineer.n_features
        self.metadata['training_date'] = datetime.now().isoformat()
        self.metadata['agent_registry'] = {
            agent_id: {'type': 'agent', 'domain': 'general'}
            for agent_id in self.label_encoder.classes_
        }

        joblib.dump(self.metadata, self.model_output_dir / "metadata.pkl")

        logger.info("✅ Models saved successfully")

    def train(self, data_path: str):
        """
        Complete training pipeline.

        Args:
            data_path: Path to training data
        """
        # Load data
        df = self.load_training_data(data_path)

        # Prepare features
        self.prepare_features_and_targets(df)

        # Train models
        self.train_agent_classifier()
        self.train_performance_predictor()
        self.train_duration_predictor()

        # Evaluate
        self.evaluate_test_set()

        # Save
        self.save_models()

        logger.info("🎉 Training complete!")


def main():
    parser = argparse.ArgumentParser(description="Train ORCHESTRAI Agent Selection Model")
    parser.add_argument(
        "--data",
        type=str,
        default="training_data.csv",
        help="Path to training data CSV"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./models/agent_selector",
        help="Output directory for trained models"
    )

    args = parser.parse_args()

    trainer = AgentSelectorTrainer(model_output_dir=args.output)
    trainer.train(data_path=args.data)


if __name__ == "__main__":
    main()
