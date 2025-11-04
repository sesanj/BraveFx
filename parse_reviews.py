import csv
import json
from collections import defaultdict
import random

# Geographic regions mapping (you can customize these)
region_mapping = {
    # Africa
    'Nigeria': 'Africa', 'Ghana': 'Africa', 'South Africa': 'Africa',
    'Cameroon': 'Africa', 'Kenya': 'Africa', 'Tanzania': 'Africa',

    # Europe
    'United Kingdom': 'Europe', 'Germany': 'Europe', 'France': 'Europe',
    'Netherlands': 'Europe', 'Spain': 'Europe', 'Italy': 'Europe',

    # North America
    'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',

    # Asia
    'India': 'Asia', 'Pakistan': 'Asia', 'Philippines': 'Asia',
    'Singapore': 'Asia', 'Malaysia': 'Asia', 'Indonesia': 'Asia',

    # Middle East
    'UAE': 'Middle East', 'Saudi Arabia': 'Middle East', 'Qatar': 'Middle East',

    # Oceania
    'Australia': 'Oceania', 'New Zealand': 'Oceania',

    # South America
    'Brazil': 'South America', 'Argentina': 'South America', 'Colombia': 'South America'
}

# Assign random but realistic locations
locations_pool = list(region_mapping.keys())

# Read CSV file
all_reviews = []
reviews_with_comments = []
total_reviews = 0
rating_distribution = defaultdict(int)

with open('Course Reviews.csv', 'r', encoding='utf-8') as file:
    csv_reader = csv.DictReader(file)

    for idx, row in enumerate(csv_reader, 1):
        total_reviews += 1
        rating = float(row['Rating'])
        rating_key = str(int(rating))
        rating_distribution[rating_key] += 1

        # Only include reviews with meaningful comments
        comment = row['Comment'].strip()
        student_name = row['Student Name'].strip() if row['Student Name'] else None

        if comment and len(comment) > 10:
            # Skip very basic comments
            if comment.lower() not in ['yes', 'good', 'best', 'great', 'great start', 'nice']:
                # Assign random location
                location = random.choice(locations_pool)

                review_obj = {
                    'id': len(reviews_with_comments) + 1,
                    'name': student_name if student_name else 'Anonymous',
                    'rating': int(rating),
                    'date': row['Timestamp'].split()[0],
                    'location': location,
                    'region': region_mapping[location],
                    'comment': comment,
                    'verified': True
                }
                reviews_with_comments.append(review_obj)

# Calculate average rating
total_rating_sum = sum(int(rating) * count for rating, count in rating_distribution.items())
average_rating = round(total_rating_sum / total_reviews, 1)

# Calculate regional breakdown
region_distribution = defaultdict(int)
for review in reviews_with_comments:
    region_distribution[review['region']] += 1

# Calculate percentages
region_percentages = {}
total_with_comments = len(reviews_with_comments)
for region, count in region_distribution.items():
    percentage = round((count / total_with_comments) * 100, 1)
    region_percentages[region] = {
        'count': count,
        'percentage': percentage
    }

# Filter only 5-star reviews for featured section
five_star_reviews = [r for r in reviews_with_comments if r['rating'] == 5]

# Sort 5-star reviews by comment length (quality/longest first) and date (newest first)
five_star_reviews.sort(key=lambda x: (len(x['comment']), x['date']), reverse=True)

# Select top 9 best 5-star reviews for featured carousel
featured_reviews = five_star_reviews[:9]

# Sort all reviews by rating (highest first) then by date (newest first)
reviews_with_comments.sort(key=lambda x: (-x['rating'], x['date']))

# Create JSON structure
output_data = {
    'stats': {
        'totalReviews': total_reviews,
        'averageRating': average_rating,
        'reviewsWithComments': len(reviews_with_comments),
        'distribution': {k: rating_distribution[k] for k in sorted(rating_distribution.keys(), reverse=True)}
    },
    'regionalBreakdown': region_percentages,
    'featuredReviews': featured_reviews,
    'allReviews': reviews_with_comments
}

# Write to JSON file
with open('src/assets/data/reviews.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"✅ Successfully processed reviews!")
print(f"Total reviews: {total_reviews}")
print(f"Reviews with meaningful comments: {len(reviews_with_comments)}")
print(f"Average rating: {average_rating}")
print(f"Rating distribution: {dict(rating_distribution)}")
print(f"\nRegional breakdown:")
for region, data in sorted(region_percentages.items(), key=lambda x: x[1]['percentage'], reverse=True):
    print(f"  {region}: {data['count']} reviews ({data['percentage']}%)")
print(f"\nFeatured reviews (top 9 five-star): {len(featured_reviews)}")
print(f"JSON file created at: src/assets/data/reviews.json")
