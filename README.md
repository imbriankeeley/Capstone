# 🍎 Fruit Ripeness Classification System

A web-based computer vision application that helps grocery store personnel quickly and accurately assess fruit ripeness to reduce waste and optimize inventory management.

## 📋 Overview

The Fruit Ripeness Classification System uses deep learning to analyze images of fruits and classify them into four ripeness categories:
- 🟢 Unripe
- 🟡 Ripe
- 🟠 Overripe
- 🔴 Spoiled

By automating the ripeness assessment process, this system aims to:
- Reduce food waste by 15-20% through optimized stock rotation
- Provide standardized visual outputs for quick decision-making
- Reduce training time for new staff with a simple, user-friendly interface
- Generate real-time inventory recommendations

## ✨ Features

### Image Upload and Classification
- Simple drag-and-drop interface for uploading fruit images
- Real-time processing with TensorFlow.js
- Clear presentation of classification results with confidence scores
- Specific inventory action recommendations (keep, discount, discard)

### Interactive Dashboard
- Stacked bar charts showing ripeness distribution across fruit types
- Heat maps with color-coded ripeness indicators
- Scatter plots for visualizing individual fruits based on attributes
- Mobile-responsive design for use on various devices

### User Experience
- Single-screen interface for streamlined workflow
- Touch-friendly design for mobile users
- Minimal text entry requirements
- Clear visual feedback and intuitive navigation

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Machine Learning**: TensorFlow.js with MobileNetV2 transfer learning
- **Visualizations**: Chart.js/D3.js
- **Deployment**: GitHub Pages (completely client-side, no backend required)

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required - works directly in browser

### Usage
1. Visit the [live application](https://youruser.github.io/fruit-ripeness-classifier)
2. Upload a fruit image using the drag-and-drop interface or file selector
3. View the classification results and recommendations
4. Explore the interactive visualizations for deeper insights

## 📊 Data Model

The system uses the Kaggle Fruits-360 dataset for training, organized by fruit type and ripeness category. Classification results include:
- Fruit type identification
- Ripeness classification
- Confidence score
- Recommended action (keep, discount, discard)

## 🔒 Privacy & Security

- All processing occurs on the client-side (your device)
- No images are transmitted to external servers
- No user data is stored or persisted
- No authentication required

## 🔮 Future Development

- Support for additional fruit varieties
- API for integration with inventory management systems
- QR/barcode scanning for batch processing
- Time-series tracking of ripeness progression
- Hardware integration for dedicated scanning stations

## 👥 Target Users

- Store managers overseeing inventory
- Inventory staff handling fruit stock
- Floor staff restocking displays
- Any personnel responsible for fruit quality assessment

## 🤝 Contributing

Contributions to improve the Fruit Ripeness Classification System are welcome! Please feel free to submit a pull request or open an issue to discuss potential changes/additions.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Kaggle Fruits-360 dataset](https://www.kaggle.com/moltean/fruits)
- TensorFlow.js team
- All contributors to this project
