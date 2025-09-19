"""
Customer Segmentation Analysis Module
====================================

This module contains functions for customer clustering and segmentation analysis.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
from typing import Dict, Tuple, List, Any
import json

def find_optimal_clusters(X: np.ndarray, k_range: range = range(2, 11)) -> Tuple[int, List[float], List[float]]:
    """
    Find optimal number of clusters using Elbow method and Silhouette analysis.
    
    Args:
        X (np.ndarray): Scaled feature matrix
        k_range (range): Range of k values to test
        
    Returns:
        Tuple[int, List[float], List[float]]: Optimal k, inertias, silhouette scores
    """
    inertias = []
    silhouette_scores = []
    
    for k in k_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(X)
        inertias.append(kmeans.inertia_)
        silhouette_scores.append(silhouette_score(X, kmeans.labels_))
    
    # Find optimal k (highest silhouette score)
    optimal_k = k_range[np.argmax(silhouette_scores)]
    
    return optimal_k, inertias, silhouette_scores

def plot_cluster_analysis(k_range: range, inertias: List[float], silhouette_scores: List[float]) -> None:
    """
    Plot elbow curve and silhouette scores for cluster analysis.
    
    Args:
        k_range (range): Range of k values
        inertias (List[float]): Inertia values for each k
        silhouette_scores (List[float]): Silhouette scores for each k
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    # Elbow curve
    ax1.plot(k_range, inertias, 'bo-')
    ax1.set_xlabel('Number of Clusters (k)')
    ax1.set_ylabel('Inertia')
    ax1.set_title('Elbow Method for Optimal k')
    ax1.grid(True)
    
    # Silhouette scores
    ax2.plot(k_range, silhouette_scores, 'ro-')
    ax2.set_xlabel('Number of Clusters (k)')
    ax2.set_ylabel('Silhouette Score')
    ax2.set_title('Silhouette Score for Different k')
    ax2.grid(True)
    
    plt.tight_layout()
    plt.show()

def perform_clustering(X: np.ndarray, n_clusters: int) -> Tuple[KMeans, np.ndarray]:
    """
    Perform K-Means clustering with specified number of clusters.
    
    Args:
        X (np.ndarray): Scaled feature matrix
        n_clusters (int): Number of clusters
        
    Returns:
        Tuple[KMeans, np.ndarray]: Fitted KMeans model and cluster labels
    """
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(X)
    
    print(f"✅ K-Means clustering completed with {n_clusters} clusters")
    print(f"Silhouette Score: {silhouette_score(X, cluster_labels):.3f}")
    
    return kmeans, cluster_labels

def visualize_clusters_pca(X: np.ndarray, cluster_labels: np.ndarray) -> None:
    """
    Visualize clusters using PCA dimensionality reduction.
    
    Args:
        X (np.ndarray): Scaled feature matrix
        cluster_labels (np.ndarray): Cluster assignments
    """
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X)
    
    plt.figure(figsize=(10, 8))
    scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1], c=cluster_labels, cmap='viridis', alpha=0.6)
    plt.xlabel(f'First Principal Component ({pca.explained_variance_ratio_[0]:.2%} variance)')
    plt.ylabel(f'Second Principal Component ({pca.explained_variance_ratio_[1]:.2%} variance)')
    plt.title('Customer Clusters Visualization (PCA)')
    plt.colorbar(scatter)
    plt.grid(True, alpha=0.3)
    plt.show()

def create_cluster_profiles(df: pd.DataFrame, cluster_col: str = 'cluster') -> Dict[int, Dict[str, Any]]:
    """
    Create detailed profiles for each customer cluster.
    
    Args:
        df (pd.DataFrame): Dataframe with cluster assignments
        cluster_col (str): Name of cluster column
        
    Returns:
        Dict[int, Dict[str, Any]]: Cluster profiles
    """
    profiles = {}
    
    for cluster in sorted(df[cluster_col].unique()):
        cluster_data = df[df[cluster_col] == cluster]
        
        profile = {
            'size': len(cluster_data),
            'percentage': len(cluster_data) / len(df) * 100,
            'avg_passengers': cluster_data['num_passengers'].mean(),
            'avg_lead_time': cluster_data['purchase_lead'].mean(),
            'avg_stay_length': cluster_data['length_of_stay'].mean(),
            'avg_flight_duration': cluster_data['flight_duration'].mean(),
            'avg_extras': cluster_data['extras_count'].mean(),
            'baggage_rate': cluster_data['wants_extra_baggage'].mean() * 100,
            'seat_rate': cluster_data['wants_preferred_seat'].mean() * 100,
            'meal_rate': cluster_data['wants_in_flight_meals'].mean() * 100,
            'completion_rate': cluster_data['booking_complete'].mean() * 100,
            'top_sales_channel': cluster_data['sales_channel'].mode()[0] if len(cluster_data['sales_channel'].mode()) > 0 else 'Unknown',
            'top_trip_type': cluster_data['trip_type'].mode()[0] if len(cluster_data['trip_type'].mode()) > 0 else 'Unknown',
            'top_origin': cluster_data['booking_origin'].mode()[0] if len(cluster_data['booking_origin'].mode()) > 0 else 'Unknown',
            'lead_category': cluster_data['booking_lead_category'].mode()[0] if len(cluster_data['booking_lead_category'].mode()) > 0 else 'Unknown',
            'travel_type': cluster_data['travel_type'].mode()[0] if len(cluster_data['travel_type'].mode()) > 0 else 'Unknown'
        }
        profiles[cluster] = profile
    
    return profiles

def plot_cluster_characteristics(df: pd.DataFrame, segment_names: Dict[int, str] = None) -> None:
    """
    Create comprehensive visualizations of cluster characteristics.
    
    Args:
        df (pd.DataFrame): Dataframe with cluster assignments
        segment_names (Dict[int, str]): Optional mapping of cluster IDs to names
    """
    if segment_names is None:
        segment_names = {i: f"Segment {i}" for i in sorted(df['cluster'].unique())}
    
    fig, axes = plt.subplots(3, 2, figsize=(20, 18))
    
    # 1. Cluster sizes
    cluster_counts = df['cluster'].value_counts().sort_index()
    cluster_labels = [f"Cluster {i}\n({segment_names.get(i, f'Segment {i}')})" for i in cluster_counts.index]
    axes[0,0].pie(cluster_counts.values, labels=cluster_labels, autopct='%1.1f%%', startangle=90)
    axes[0,0].set_title('Customer Segment Distribution', fontsize=14, fontweight='bold')
    
    # 2. Average purchase lead time by cluster
    lead_times = df.groupby('cluster')['purchase_lead'].mean()
    axes[0,1].bar(range(len(lead_times)), lead_times.values, color=plt.cm.viridis(np.linspace(0, 1, len(lead_times))))
    axes[0,1].set_xlabel('Cluster')
    axes[0,1].set_ylabel('Average Lead Time (days)')
    axes[0,1].set_title('Average Purchase Lead Time by Cluster', fontweight='bold')
    axes[0,1].set_xticks(range(len(lead_times)))
    
    # 3. Extras preferences by cluster
    extras_by_cluster = df.groupby('cluster')[['wants_extra_baggage', 'wants_preferred_seat', 'wants_in_flight_meals']].mean()
    extras_by_cluster.plot(kind='bar', ax=axes[1,0], width=0.8)
    axes[1,0].set_title('Extras Preferences by Cluster', fontweight='bold')
    axes[1,0].set_xlabel('Cluster')
    axes[1,0].set_ylabel('Preference Rate')
    axes[1,0].legend(['Extra Baggage', 'Preferred Seat', 'In-flight Meals'])
    axes[1,0].tick_params(axis='x', rotation=0)
    
    # 4. Booking completion rate by cluster
    completion_rates = df.groupby('cluster')['booking_complete'].mean()
    bars = axes[1,1].bar(range(len(completion_rates)), completion_rates.values, 
                         color=plt.cm.RdYlGn(np.linspace(0.3, 1, len(completion_rates))))
    axes[1,1].set_xlabel('Cluster')
    axes[1,1].set_ylabel('Completion Rate')
    axes[1,1].set_title('Booking Completion Rate by Cluster', fontweight='bold')
    axes[1,1].set_xticks(range(len(completion_rates)))
    # Add value labels on bars
    for i, bar in enumerate(bars):
        height = bar.get_height()
        axes[1,1].text(bar.get_x() + bar.get_width()/2., height + 0.01,
                       f'{height:.2%}', ha='center', va='bottom')
    
    # 5. Sales channel distribution by cluster
    sales_channel_cluster = pd.crosstab(df['cluster'], df['sales_channel'], normalize='index')
    sales_channel_cluster.plot(kind='bar', stacked=True, ax=axes[2,0], width=0.8)
    axes[2,0].set_title('Sales Channel Distribution by Cluster', fontweight='bold')
    axes[2,0].set_xlabel('Cluster')
    axes[2,0].set_ylabel('Proportion')
    axes[2,0].tick_params(axis='x', rotation=0)
    
    # 6. Number of passengers distribution by cluster
    passenger_cluster = df.groupby(['cluster', 'num_passengers']).size().unstack(fill_value=0)
    passenger_cluster_pct = passenger_cluster.div(passenger_cluster.sum(axis=1), axis=0)
    passenger_cluster_pct.plot(kind='bar', stacked=True, ax=axes[2,1], width=0.8)
    axes[2,1].set_title('Number of Passengers Distribution by Cluster', fontweight='bold')
    axes[2,1].set_xlabel('Cluster')
    axes[2,1].set_ylabel('Proportion')
    axes[2,1].tick_params(axis='x', rotation=0)
    
    plt.tight_layout()
    plt.show()

def generate_business_insights(df: pd.DataFrame, profiles: Dict[int, Dict[str, Any]], 
                             segment_names: Dict[int, str] = None) -> Dict[str, List[str]]:
    """
    Generate actionable business insights from cluster analysis.
    
    Args:
        df (pd.DataFrame): Dataframe with cluster assignments
        profiles (Dict[int, Dict[str, Any]]): Cluster profiles
        segment_names (Dict[int, str]): Optional mapping of cluster IDs to names
        
    Returns:
        Dict[str, List[str]]: Categorized business insights
    """
    if segment_names is None:
        segment_names = {i: f"Segment {i}" for i in profiles.keys()}
    
    insights = {
        'revenue_opportunities': [],
        'marketing_strategies': [],
        'operational_improvements': [],
        'risk_factors': []
    }
    
    for cluster, profile in profiles.items():
        segment_name = segment_names.get(cluster, f"Segment {cluster}")
        
        # Revenue opportunities
        if profile['avg_extras'] > 1.5:
            insights['revenue_opportunities'].append(
                f"{segment_name}: High extras adoption ({profile['avg_extras']:.1f} avg) - "
                f"Focus on premium service packages"
            )
        
        if profile['completion_rate'] < 85:
            insights['risk_factors'].append(
                f"{segment_name}: Low completion rate ({profile['completion_rate']:.1f}%) - "
                f"Implement retention strategies"
            )
        
        # Marketing strategies based on lead time
        if profile['avg_lead_time'] < 30:
            insights['marketing_strategies'].append(
                f"{segment_name}: Last-minute bookers ({profile['avg_lead_time']:.0f} days) - "
                f"Target with urgent deals and limited-time offers"
            )
        elif profile['avg_lead_time'] > 100:
            insights['marketing_strategies'].append(
                f"{segment_name}: Early planners ({profile['avg_lead_time']:.0f} days) - "
                f"Offer early bird discounts and flexible booking options"
            )
        
        # Operational improvements
        if profile['avg_passengers'] > 2:
            insights['operational_improvements'].append(
                f"{segment_name}: Family travelers ({profile['avg_passengers']:.1f} avg passengers) - "
                f"Optimize family check-in processes and group services"
            )
    
    return insights

def save_analysis_results(df: pd.DataFrame, profiles: Dict[int, Dict[str, Any]], 
                         output_dir: str = "../data/") -> None:
    """
    Save cluster analysis results to files.
    
    Args:
        df (pd.DataFrame): Dataframe with cluster assignments
        profiles (Dict[int, Dict[str, Any]]): Cluster profiles
        output_dir (str): Output directory for files
    """
    # Save cluster assignments
    df[['cluster']].to_csv(f'{output_dir}/customer_clusters.csv', index=True)
    
    # Save cluster profiles
    profiles_for_json = {}
    for cluster, profile in profiles.items():
        profiles_for_json[str(cluster)] = {k: float(v) if isinstance(v, (np.integer, np.floating)) else v 
                                          for k, v in profile.items()}
    
    with open(f'{output_dir}/../reports/cluster_profiles.json', 'w') as f:
        json.dump(profiles_for_json, f, indent=2)
    
    # Create summary report
    summary_stats = {
        'total_customers': len(df),
        'num_clusters': len(profiles),
        'overall_completion_rate': float(df['booking_complete'].mean()),
        'average_extras_per_customer': float(df['extras_count'].mean()),
        'average_lead_time': float(df['purchase_lead'].mean()),
        'cluster_distribution': {str(k): float(v['percentage']) for k, v in profiles.items()}
    }
    
    with open(f'{output_dir}/../reports/analysis_summary.json', 'w') as f:
        json.dump(summary_stats, f, indent=2)
    
    print("✅ Analysis results saved successfully!")