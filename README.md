# Customer Booking Behavior Analysis

## Project Overview
This project analyzes customer booking behavior to segment customers into meaningful groups for targeted marketing, operational optimization, and revenue growth.

## Project Structure
```
Customer_booking/
├── data/
│   ├── customer_booking.csv          # Raw dataset
│   └── customer_clusters.csv         # Cluster assignments (generated)
├── notebooks/
│   └── customer_segmentation_analysis.ipynb  # Main analysis notebook
├── src/
│   ├── data_preprocessing.py         # Data preprocessing utilities
│   ├── clustering_analysis.py        # Clustering and segmentation functions
│   └── visualization_utils.py        # Visualization functions
├── reports/
│   ├── cluster_profiles.json         # Detailed cluster profiles
│   └── analysis_summary.json         # Summary statistics
├── visualizations/
│   └── (generated visualization files)
└── README.md
```

## Dataset Description
The dataset contains customer booking information with the following features:

### Core Features
- **num_passengers**: Number of passengers in the booking
- **sales_channel**: Channel used for booking (Internet, Mobile, etc.)
- **trip_type**: Type of trip (RoundTrip, OneWay)
- **purchase_lead**: Days between booking and departure
- **length_of_stay**: Duration of stay at destination
- **flight_hour**: Departure time (24-hour format)
- **flight_day**: Day of the week for departure
- **route**: Flight route code
- **booking_origin**: Country/region where booking was made
- **flight_duration**: Flight duration in hours
- **booking_complete**: Whether booking was completed (target variable)

### Preference Features
- **wants_extra_baggage**: Customer wants extra baggage (0/1)
- **wants_preferred_seat**: Customer wants preferred seat (0/1)
- **wants_in_flight_meals**: Customer wants in-flight meals (0/1)

### Derived Features (Created during analysis)
- **extras_count**: Total number of extras requested
- **booking_lead_category**: Categorized lead time (Last_Minute, Moderate, Early_Planner)
- **travel_type**: Categorized by flight duration (Short_Haul, Medium_Haul, Long_Haul)

## Customer Segments Identified

### 1. Budget Travelers
- **Characteristics**: Price-sensitive customers with minimal extras
- **Size**: Varies based on data
- **Key Traits**: Low extras adoption, cost-conscious booking behavior
- **Strategy**: Competitive pricing, value-for-money messaging

### 2. Family Travelers
- **Characteristics**: Multi-passenger bookings with longer stays
- **Size**: Varies based on data
- **Key Traits**: Higher passenger count, extra baggage needs, advance planning
- **Strategy**: Family packages, group discounts, family-friendly services

### 3. Business Travelers
- **Characteristics**: Time-sensitive travelers with specific preferences
- **Size**: Varies based on data
- **Key Traits**: Preferred seat selection, shorter stays, schedule reliability focus
- **Strategy**: Premium services, fast-track options, corporate packages

### 4. Premium Travelers
- **Characteristics**: High-spend customers seeking luxury experience
- **Size**: Varies based on data
- **Key Traits**: High extras adoption, premium service expectations
- **Strategy**: Luxury amenities, VIP services, premium loyalty programs

## Getting Started

### Prerequisites
```bash
pip install pandas numpy matplotlib seaborn scikit-learn jupyter
```

### Optional (for interactive visualizations)
```bash
pip install plotly
```

### Running the Analysis

🔗 **[View the Complete Analysis Notebook](notebooks/customer_segmentation_analysis.ipynb)**

1. Open the Jupyter notebook:
   ```bash
   jupyter notebook notebooks/customer_segmentation_analysis.ipynb
   ```

2. Run all cells in sequence to:
   - Load and explore the data
   - Perform preprocessing and feature engineering
   - Conduct clustering analysis
   - Generate insights and recommendations

### Using the Python Modules
```python
from src.data_preprocessing import load_and_validate_data, create_derived_features
from src.clustering_analysis import find_optimal_clusters, perform_clustering
from src.visualization_utils import create_eda_dashboard

# Load and preprocess data
df = load_and_validate_data('data/customer_booking.csv')
df_processed = create_derived_features(df)

# Perform clustering analysis
# (See notebook for complete workflow)
```

## Key Insights

### Business Opportunities
1. **Targeted Marketing**: Different segments respond to different marketing strategies
2. **Revenue Optimization**: Premium and Family segments show higher add-on potential
3. **Operational Efficiency**: Segment-specific service delivery optimization
4. **Risk Management**: Low completion rate segments need retention strategies

### Marketing Strategies by Segment
- **Budget**: Competitive pricing, loyalty programs, value messaging
- **Family**: Group packages, holiday deals, family amenities
- **Business**: Premium upgrades, time-saving services, corporate rates
- **Premium**: Luxury experiences, VIP services, exclusive offers

### Operational Recommendations
- **Family Travelers**: Optimize group check-in processes
- **Business Travelers**: Prioritize schedule reliability and fast-track services
- **Premium Travelers**: Ensure highest service quality standards
- **Budget Travelers**: Streamline basic service delivery for efficiency

## Files Generated
- `data/customer_clusters.csv`: Customer cluster assignments
- `reports/cluster_profiles.json`: Detailed segment profiles
- `reports/analysis_summary.json`: Key metrics and statistics
- `visualizations/`: Various charts and graphs (when saved)

## Next Steps
1. Implement targeted marketing campaigns for each segment
2. Develop segment-specific pricing strategies
3. Optimize operational processes based on segment needs
4. Monitor segment performance and booking completion rates
5. Regularly update segmentation model with new data
6. Create automated dashboards for ongoing monitoring

## Contributing
Feel free to contribute by:
- Adding new analysis techniques
- Improving visualization functions
- Enhancing the preprocessing pipeline
- Adding new business insights

## License
This project is for educational and business analysis purposes.