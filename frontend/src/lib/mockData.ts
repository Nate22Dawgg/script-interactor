
import { Script } from './types';

export const mockScripts: Script[] = [
  {
    id: '1',
    name: 'Data Visualization Script',
    description: 'Generates a visualization of sample data using matplotlib.',
    code: `
import matplotlib.pyplot as plt
import numpy as np

# Generate sample data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create visualization
plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2)
plt.title('Sine Wave')
plt.xlabel('X axis')
plt.ylabel('Y axis')
plt.grid(True)
plt.show()
    `,
    language: 'python',
    dateCreated: '2023-09-15T10:30:00Z',
    lastRun: '2023-09-15T14:45:00Z',
    status: 'completed',
    output: 'Visualization generated successfully. View in the results tab.',
  },
  {
    id: '2',
    name: 'Data Analysis Script',
    description: 'Analyzes a dataset and prints statistical information.',
    code: `
import pandas as pd
import numpy as np

# Generate sample data
data = {
    'A': np.random.rand(100),
    'B': np.random.rand(100),
    'C': np.random.rand(100)
}

df = pd.DataFrame(data)

# Print statistics
print(df.describe())

# Print correlation
print("\\nCorrelation:")
print(df.corr())
    `,
    language: 'python',
    dateCreated: '2023-09-10T08:15:00Z',
    lastRun: '2023-09-14T11:20:00Z',
    status: 'completed',
    output: `
                 A             B             C
count  100.000000    100.000000    100.000000
mean     0.473092      0.512983      0.518113
std      0.295011      0.285303      0.282235
min      0.012288      0.015509      0.015205
25%      0.221773      0.255961      0.248692
50%      0.471101      0.514282      0.554807
75%      0.762520      0.789263      0.747558
max      0.978461      0.990766      0.991431

Correlation:
          A         B         C
A  1.000000  0.105255  0.152639
B  0.105255  1.000000  0.016421
C  0.152639  0.016421  1.000000
    `,
  },
  {
    id: '3',
    name: 'Machine Learning Demo',
    description: 'Simple machine learning model training and evaluation.',
    code: `
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Load data
iris = load_iris()
X, y = iris.data, iris.target

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

# Create model
model = RandomForestClassifier(n_estimators=100, random_state=42)

# Train model
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)

# Evaluate
accuracy = accuracy_score(y_test, predictions)
print(f"Accuracy: {accuracy:.4f}")
print("\\nClassification Report:")
print(classification_report(y_test, predictions, target_names=iris.target_names))
    `,
    language: 'python',
    dateCreated: '2023-09-05T16:40:00Z',
    lastRun: '2023-09-13T09:30:00Z',
    status: 'completed',
    output: `
Accuracy: 0.9778

Classification Report:
              precision    recall  f1-score   support

      setosa       1.00      1.00      1.00        13
  versicolor       1.00      0.94      0.97        17
   virginica       0.94      1.00      0.97        15

    accuracy                           0.98        45
   macro avg       0.98      0.98      0.98        45
weighted avg       0.98      0.98      0.98        45
    `,
  },
  {
    id: '4',
    name: 'API Request Example',
    description: 'Demonstrates making API requests and parsing responses.',
    code: `
import requests
import json

# Make API request
response = requests.get('https://jsonplaceholder.typicode.com/posts/1')

# Check if request was successful
if response.status_code == 200:
    # Parse JSON response
    data = response.json()
    
    # Print formatted data
    print("API Response:")
    print(json.dumps(data, indent=2))
    
    # Extract specific fields
    print("\\nTitle:", data['title'])
    print("Body:", data['body'])
else:
    print(f"Request failed with status code: {response.status_code}")
    `,
    language: 'python',
    dateCreated: '2023-09-01T11:25:00Z',
    status: 'idle',
  },
  {
    id: '5',
    name: 'Image Processing Script',
    description: 'Basic image processing operations demo.',
    code: `
from PIL import Image, ImageFilter
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
import requests

# Download sample image
url = "https://picsum.photos/400/300"
response = requests.get(url)
img = Image.open(BytesIO(response.content))

# Convert to grayscale
gray_img = img.convert('L')

# Apply edge detection
edge_img = gray_img.filter(ImageFilter.FIND_EDGES)

# Create figure with subplots
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# Display original image
axes[0].imshow(img)
axes[0].set_title('Original Image')
axes[0].axis('off')

# Display grayscale image
axes[1].imshow(gray_img, cmap='gray')
axes[1].set_title('Grayscale Image')
axes[1].axis('off')

# Display edge-detected image
axes[2].imshow(edge_img, cmap='gray')
axes[2].set_title('Edge Detection')
axes[2].axis('off')

plt.tight_layout()
plt.show()
    `,
    language: 'python',
    dateCreated: '2023-08-28T14:15:00Z',
    lastRun: '2023-09-12T16:10:00Z',
    status: 'failed',
    output: 'Error: ModuleNotFoundError: No module named "PIL"',
  }
];
