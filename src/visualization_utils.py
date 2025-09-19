"""
Visualization Utilities for Customer Booking Analysis
====================================================

This module contains functions for creating visualizations and dashboards
for customer booking behavior analysis.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from typing import Dict, List, Any, Optional

def create_eda_dashboard(df: pd.DataFrame) -> None:
    """
    Create comprehensive EDA dashboard with multiple visualizations.
    
    Args:
        df (pd.DataFrame): Customer booking dataframe
    """
    fig, axes = plt.subplots(3, 3, figsize=(20, 15))
    
    # 1. Sales Channel Distribution
    df['sales_channel'].value_counts().plot(kind='bar', ax=axes[0,0], color='skyblue')
    axes[0,0].set_title('Sales Channel Distribution')
    axes[0,0].set_xlabel('Sales Channel')
    axes[0,0].tick_params(axis='x', rotation=45)
    
    # 2. Trip Type Distribution
    df['trip_type'].value_counts().plot(kind='bar', ax=axes[0,1], color='lightgreen')
    axes[0,1].set_title('Trip Type Distribution')
    axes[0,1].set_xlabel('Trip Type')
    axes[0,1].tick_params(axis='x', rotation=45)
    
    # 3. Booking Origin Distribution
    top_origins = df['booking_origin'].value_counts().head(10)
    top_origins.plot(kind='bar', ax=axes[0,2], color='orange')
    axes[0,2].set_title('Top 10 Booking Origins')
    axes[0,2].set_xlabel('Booking Origin')
    axes[0,2].tick_params(axis='x', rotation=45)
    
    # 4. Purchase Lead Time Distribution
    axes[1,0].hist(df['purchase_lead'], bins=50, alpha=0.7, color='purple')
    axes[1,0].set_title('Purchase Lead Time Distribution')
    axes[1,0].set_xlabel('Days Before Departure')
    axes[1,0].set_ylabel('Frequency')
    
    # 5. Flight Duration vs Length of Stay
    axes[1,1].scatter(df['flight_duration'], df['length_of_stay'], alpha=0.5, color='red')
    axes[1,1].set_title('Flight Duration vs Length of Stay')
    axes[1,1].set_xlabel('Flight Duration (hours)')
    axes[1,1].set_ylabel('Length of Stay (days)')
    
    # 6. Extras Count Distribution
    df['extras_count'].value_counts().sort_index().plot(kind='bar', ax=axes[1,2], color='gold')
    axes[1,2].set_title('Extras Count Distribution')
    axes[1,2].set_xlabel('Number of Extras')
    axes[1,2].set_ylabel('Count')
    
    # 7. Flight Day Distribution
    day_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    day_counts = df['flight_day'].value_counts().reindex(day_order)
    day_counts.plot(kind='bar', ax=axes[2,0], color='teal')
    axes[2,0].set_title('Flight Day Distribution')
    axes[2,0].set_xlabel('Day of Week')
    axes[2,0].tick_params(axis='x', rotation=45)
    
    # 8. Number of Passengers Distribution
    df['num_passengers'].value_counts().sort_index().plot(kind='bar', ax=axes[2,1], color='pink')
    axes[2,1].set_title('Number of Passengers Distribution')
    axes[2,1].set_xlabel('Number of Passengers')
    
    # 9. Booking Completion Rate
    completion_data = df['booking_complete'].value_counts()
    axes[2,2].pie(completion_data.values, labels=['Incomplete', 'Complete'], 
                  autopct='%1.1f%%', colors=['lightcoral', 'lightblue'])
    axes[2,2].set_title('Booking Completion Rate')
    
    plt.tight_layout()
    plt.show()

def create_customer_preferences_analysis(df: pd.DataFrame) -> None:
    """
    Analyze and visualize customer preferences for extras.
    
    Args:
        df (pd.DataFrame): Customer booking dataframe
    """
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Extras preferences pie chart
    extras_data = [
        df['wants_extra_baggage'].sum(),
        df['wants_preferred_seat'].sum(),
        df['wants_in_flight_meals'].sum()
    ]
    extras_labels = ['Extra Baggage', 'Preferred Seat', 'In-flight Meals']
    
    axes[0,0].pie(extras_data, labels=extras_labels, autopct='%1.1f%%', colors=['skyblue', 'lightgreen', 'orange'])
    axes[0,0].set_title('Customer Preferences for Extras')
    
    # Extras by sales channel
    extras_by_channel = df.groupby('sales_channel')[['wants_extra_baggage', 'wants_preferred_seat', 'wants_in_flight_meals']].mean()
    extras_by_channel.plot(kind='bar', ax=axes[0,1], width=0.8)
    axes[0,1].set_title('Extras Preferences by Sales Channel')
    axes[0,1].set_xlabel('Sales Channel')
    axes[0,1].set_ylabel('Preference Rate')
    axes[0,1].legend(['Baggage', 'Seat', 'Meals'])
    axes[0,1].tick_params(axis='x', rotation=45)
    
    # Extras by trip type
    extras_by_trip = df.groupby('trip_type')[['wants_extra_baggage', 'wants_preferred_seat', 'wants_in_flight_meals']].mean()
    extras_by_trip.plot(kind='bar', ax=axes[1,0], width=0.8)
    axes[1,0].set_title('Extras Preferences by Trip Type')
    axes[1,0].set_xlabel('Trip Type')
    axes[1,0].set_ylabel('Preference Rate')
    axes[1,0].legend(['Baggage', 'Seat', 'Meals'])
    axes[1,0].tick_params(axis='x', rotation=45)
    
    # Completion rate by extras count
    completion_by_extras = df.groupby('extras_count')['booking_complete'].mean()
    completion_by_extras.plot(kind='bar', ax=axes[1,1], color='purple')
    axes[1,1].set_title('Booking Completion Rate by Number of Extras')
    axes[1,1].set_xlabel('Number of Extras')
    axes[1,1].set_ylabel('Completion Rate')
    
    plt.tight_layout()
    plt.show()

def create_interactive_cluster_dashboard(df: pd.DataFrame, segment_names: Dict[int, str] = None) -> None:
    """
    Create interactive dashboard using Plotly for cluster analysis.
    
    Args:
        df (pd.DataFrame): Dataframe with cluster assignments
        segment_names (Dict[int, str]): Optional mapping of cluster IDs to names
    """
    if segment_names is None:
        segment_names = {i: f"Segment {i}" for i in sorted(df['cluster'].unique())}
    
    # Add segment names to dataframe
    df_viz = df.copy()
    df_viz['segment_name'] = df_viz['cluster'].map(segment_names)
    
    # Create subplots
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=['Cluster Distribution', 'Lead Time by Cluster', 
                       'Extras Preferences', 'Completion Rates'],
        specs=[[{"type": "pie"}, {"type": "bar"}],
               [{"type": "bar"}, {"type": "bar"}]]
    )
    
    # 1. Cluster distribution pie chart
    cluster_counts = df_viz['segment_name'].value_counts()
    fig.add_trace(
        go.Pie(labels=cluster_counts.index, values=cluster_counts.values,
               name="Cluster Distribution"),
        row=1, col=1
    )
    
    # 2. Average lead time by cluster
    lead_times = df_viz.groupby('segment_name')['purchase_lead'].mean().sort_index()
    fig.add_trace(
        go.Bar(x=lead_times.index, y=lead_times.values,
               name="Avg Lead Time"),
        row=1, col=2
    )
    
    # 3. Extras preferences by cluster
    extras_by_cluster = df_viz.groupby('segment_name')[['wants_extra_baggage', 'wants_preferred_seat', 'wants_in_flight_meals']].mean()
    for i, col in enumerate(['wants_extra_baggage', 'wants_preferred_seat', 'wants_in_flight_meals']):
        fig.add_trace(
            go.Bar(x=extras_by_cluster.index, y=extras_by_cluster[col],
                   name=['Baggage', 'Seat', 'Meals'][i]),
            row=2, col=1
        )
    
    # 4. Completion rates by cluster
    completion_rates = df_viz.groupby('segment_name')['booking_complete'].mean()
    fig.add_trace(
        go.Bar(x=completion_rates.index, y=completion_rates.values,
               name="Completion Rate"),
        row=2, col=2
    )
    
    fig.update_layout(height=800, title_text="Customer Segmentation Dashboard")
    fig.show()

def create_route_analysis_visualization(df: pd.DataFrame, segment_names: Dict[int, str] = None) -> None:
    """
    Create visualizations for route analysis by customer segment.
    
    Args:
        df (pd.DataFrame): Dataframe with cluster assignments
        segment_names (Dict[int, str]): Optional mapping of cluster IDs to names
    """
    if segment_names is None:
        segment_names = {i: f"Segment {i}" for i in sorted(df['cluster'].unique())}
    
    n_clusters = len(df['cluster'].unique())
    fig, axes = plt.subplots(2, 2, figsize=(20, 12))
    axes = axes.flatten()
    
    for i, cluster in enumerate(sorted(df['cluster'].unique())):
        if i < len(axes):
            cluster_data = df[df['cluster'] == cluster]
            top_routes = cluster_data['route'].value_counts().head(10)
            
            bars = axes[i].bar(range(len(top_routes)), top_routes.values, 
                              color=plt.cm.Set3(np.linspace(0, 1, len(top_routes))))
            axes[i].set_title(f'Cluster {cluster}: {segment_names.get(cluster, f"Segment {cluster}")}\nTop Routes', 
                             fontweight='bold')
            axes[i].set_xlabel('Route Rank')
            axes[i].set_ylabel('Number of Bookings')
            axes[i].set_xticks(range(len(top_routes)))
            axes[i].set_xticklabels([f'{j+1}' for j in range(len(top_routes))])
            
            # Add route labels
            for j, bar in enumerate(bars):
                height = bar.get_height()
                axes[i].text(bar.get_x() + bar.get_width()/2., height + 5,
                            f'{top_routes.index[j]}\n({int(height)})', 
                            ha='center', va='bottom', fontsize=8, rotation=45)
    
    plt.tight_layout()
    plt.show()

def create_correlation_heatmap(df: pd.DataFrame) -> None:
    """
    Create correlation heatmap for numerical features.
    
    Args:
        df (pd.DataFrame): Customer booking dataframe
    """
    numerical_features = ['num_passengers', 'purchase_lead', 'length_of_stay', 'flight_hour', 
                         'flight_duration', 'wants_extra_baggage', 'wants_preferred_seat', 
                         'wants_in_flight_meals', 'extras_count', 'booking_complete']
    
    correlation_matrix = df[numerical_features].corr()
    
    plt.figure(figsize=(12, 10))
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, 
                square=True, linewidths=0.5, fmt='.2f')
    plt.title('Correlation Matrix of Numerical Features', fontsize=16, fontweight='bold')
    plt.tight_layout()
    plt.show()

def create_business_metrics_dashboard(df: pd.DataFrame, profiles: Dict[int, Dict[str, Any]], 
                                    segment_names: Dict[int, str] = None) -> None:
    """
    Create dashboard showing key business metrics by segment.
    
    Args:
        df (pd.DataFrame): Dataframe with cluster assignments
        profiles (Dict[int, Dict[str, Any]]): Cluster profiles
        segment_names (Dict[int, str]): Optional mapping of cluster IDs to names
    """
    if segment_names is None:
        segment_names = {i: f"Segment {i}" for i in profiles.keys()}
    
    # Prepare data for visualization
    segments = [segment_names.get(k, f"Segment {k}") for k in sorted(profiles.keys())]
    completion_rates = [profiles[k]['completion_rate'] for k in sorted(profiles.keys())]
    avg_extras = [profiles[k]['avg_extras'] for k in sorted(profiles.keys())]
    avg_lead_times = [profiles[k]['avg_lead_time'] for k in sorted(profiles.keys())]
    segment_sizes = [profiles[k]['percentage'] for k in sorted(profiles.keys())]
    
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # 1. Completion rates
    bars1 = axes[0,0].bar(segments, completion_rates, color=plt.cm.RdYlGn(np.linspace(0.3, 1, len(segments))))
    axes[0,0].set_title('Booking Completion Rate by Segment', fontweight='bold')
    axes[0,0].set_ylabel('Completion Rate (%)')
    axes[0,0].tick_params(axis='x', rotation=45)
    for i, bar in enumerate(bars1):
        height = bar.get_height()
        axes[0,0].text(bar.get_x() + bar.get_width()/2., height + 1,
                       f'{height:.1f}%', ha='center', va='bottom')
    
    # 2. Average extras per customer
    bars2 = axes[0,1].bar(segments, avg_extras, color=plt.cm.viridis(np.linspace(0, 1, len(segments))))
    axes[0,1].set_title('Average Extras per Customer by Segment', fontweight='bold')
    axes[0,1].set_ylabel('Average Number of Extras')
    axes[0,1].tick_params(axis='x', rotation=45)
    for i, bar in enumerate(bars2):
        height = bar.get_height()
        axes[0,1].text(bar.get_x() + bar.get_width()/2., height + 0.05,
                       f'{height:.2f}', ha='center', va='bottom')
    
    # 3. Average lead times
    bars3 = axes[1,0].bar(segments, avg_lead_times, color=plt.cm.plasma(np.linspace(0, 1, len(segments))))
    axes[1,0].set_title('Average Purchase Lead Time by Segment', fontweight='bold')
    axes[1,0].set_ylabel('Lead Time (days)')
    axes[1,0].tick_params(axis='x', rotation=45)
    for i, bar in enumerate(bars3):
        height = bar.get_height()
        axes[1,0].text(bar.get_x() + bar.get_width()/2., height + 5,
                       f'{height:.0f}', ha='center', va='bottom')
    
    # 4. Segment sizes
    axes[1,1].pie(segment_sizes, labels=segments, autopct='%1.1f%%', startangle=90,
                  colors=plt.cm.Set3(np.linspace(0, 1, len(segments))))
    axes[1,1].set_title('Customer Segment Distribution', fontweight='bold')
    
    plt.tight_layout()
    plt.show()

def save_visualizations(df: pd.DataFrame, output_dir: str = "../visualizations/") -> None:
    """
    Save all visualizations to files.
    
    Args:
        df (pd.DataFrame): Customer booking dataframe
        output_dir (str): Output directory for visualization files
    """
    # Set up matplotlib for saving
    plt.ioff()  # Turn off interactive mode
    
    try:
        # EDA Dashboard
        create_eda_dashboard(df)
        plt.savefig(f'{output_dir}/eda_dashboard.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # Customer Preferences
        create_customer_preferences_analysis(df)
        plt.savefig(f'{output_dir}/customer_preferences.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # Correlation Heatmap
        create_correlation_heatmap(df)
        plt.savefig(f'{output_dir}/correlation_heatmap.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print("✅ Visualizations saved successfully!")
        
    finally:
        plt.ion()  # Turn interactive mode back on