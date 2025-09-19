"""
Customer Booking Data Preprocessing Module
==========================================

This module contains functions for preprocessing customer booking data
including feature engineering, encoding, and scaling.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from typing import Tuple, Dict, Any

def load_and_validate_data(file_path: str) -> pd.DataFrame:
    """
    Load customer booking data and perform basic validation.
    
    Args:
        file_path (str): Path to the CSV file
        
    Returns:
        pd.DataFrame: Loaded and validated dataframe
    """
    df = pd.read_csv(file_path)
    
    # Validate required columns
    required_columns = [
        'num_passengers', 'sales_channel', 'trip_type', 'purchase_lead',
        'length_of_stay', 'flight_hour', 'flight_day', 'route', 'booking_origin',
        'wants_extra_baggage', 'wants_preferred_seat', 'wants_in_flight_meals',
        'flight_duration', 'booking_complete'
    ]
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    
    print(f"✅ Data loaded successfully: {df.shape[0]:,} rows, {df.shape[1]} columns")
    return df

def create_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create derived features from the raw booking data.
    
    Args:
        df (pd.DataFrame): Input dataframe
        
    Returns:
        pd.DataFrame: Dataframe with derived features
    """
    df_processed = df.copy()
    
    # 1. Extras count
    df_processed['extras_count'] = (
        df_processed['wants_extra_baggage'] + 
        df_processed['wants_preferred_seat'] + 
        df_processed['wants_in_flight_meals']
    )
    
    # 2. Booking lead category
    def categorize_lead_time(lead_days):
        if lead_days <= 7:
            return 'Last_Minute'
        elif lead_days <= 30:
            return 'Moderate'
        else:
            return 'Early_Planner'
    
    df_processed['booking_lead_category'] = df_processed['purchase_lead'].apply(categorize_lead_time)
    
    # 3. Travel type based on flight duration
    def categorize_travel_type(duration):
        if duration <= 3:
            return 'Short_Haul'
        elif duration <= 8:
            return 'Medium_Haul'
        else:
            return 'Long_Haul'
    
    df_processed['travel_type'] = df_processed['flight_duration'].apply(categorize_travel_type)
    
    # 4. Peak travel indicator
    peak_hours = [6, 7, 8, 17, 18, 19, 20]
    df_processed['is_peak_hour'] = df_processed['flight_hour'].isin(peak_hours).astype(int)
    
    # 5. Weekend indicator
    weekend_days = ['Sat', 'Sun']
    df_processed['is_weekend'] = df_processed['flight_day'].isin(weekend_days).astype(int)
    
    print(f"✅ Created {5} derived features")
    return df_processed

def encode_categorical_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, LabelEncoder]]:
    """
    Encode categorical features using Label Encoding.
    
    Args:
        df (pd.DataFrame): Input dataframe
        
    Returns:
        Tuple[pd.DataFrame, Dict[str, LabelEncoder]]: Processed dataframe and encoders
    """
    df_encoded = df.copy()
    label_encoders = {}
    
    categorical_features = [
        'sales_channel', 'trip_type', 'flight_day', 'route', 
        'booking_origin', 'booking_lead_category', 'travel_type'
    ]
    
    for feature in categorical_features:
        if feature in df_encoded.columns:
            le = LabelEncoder()
            df_encoded[f'{feature}_encoded'] = le.fit_transform(df_encoded[feature])
            label_encoders[feature] = le
    
    print(f"✅ Encoded {len(categorical_features)} categorical features")
    return df_encoded, label_encoders

def prepare_clustering_features(df: pd.DataFrame) -> Tuple[np.ndarray, StandardScaler, list]:
    """
    Prepare and scale features for clustering analysis.
    
    Args:
        df (pd.DataFrame): Input dataframe with encoded features
        
    Returns:
        Tuple[np.ndarray, StandardScaler, list]: Scaled features, scaler object, and feature names
    """
    clustering_features = [
        'num_passengers',
        'purchase_lead',
        'length_of_stay',
        'flight_duration',
        'extras_count',
        'sales_channel_encoded',
        'trip_type_encoded',
        'booking_lead_category_encoded',
        'travel_type_encoded',
        'is_peak_hour',
        'is_weekend'
    ]
    
    # Select available features
    available_features = [feat for feat in clustering_features if feat in df.columns]
    
    X = df[available_features].copy()
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print(f"✅ Prepared {len(available_features)} features for clustering")
    return X_scaled, scaler, available_features

def get_feature_importance_for_clustering(df: pd.DataFrame, cluster_labels: np.ndarray) -> pd.DataFrame:
    """
    Calculate feature importance for cluster differentiation.
    
    Args:
        df (pd.DataFrame): Input dataframe
        cluster_labels (np.ndarray): Cluster assignments
        
    Returns:
        pd.DataFrame: Feature importance scores
    """
    from sklearn.ensemble import RandomForestClassifier
    
    # Prepare features
    X_scaled, _, feature_names = prepare_clustering_features(df)
    
    # Train random forest to predict clusters
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_scaled, cluster_labels)
    
    # Get feature importance
    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': rf.feature_importances_
    }).sort_values('importance', ascending=False)
    
    return importance_df