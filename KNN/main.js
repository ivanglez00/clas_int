class KNNClassifier {
    constructor(k = 3) {
        this.k = k;
        this.trainData = null;
        this.trainLabels = null;
    }

    train(data, labels) {
        this.trainData = data;
        this.trainLabels = labels;
    }

    predict(testData) {
        return testData.map(sample => this._predictSample(sample));
    }

    _predictSample(sample) {
        const distances = this.trainData.map((trainSample, index) => ({
            distance: this._euclideanDistance(sample, trainSample),
            label: this.trainLabels[index]
        }));

        distances.sort((a, b) => a.distance - b.distance);

        const neighbors = distances.slice(0, this.k);

        const labelsCount = {};
        neighbors.forEach(neighbor => {
            labelsCount[neighbor.label] = (labelsCount[neighbor.label] || 0) + 1;
        });

        const sortedLabels = Object.entries(labelsCount).sort((a, b) => b[1] - a[1]);

        return sortedLabels[0][0];
    }

    _euclideanDistance(point1, point2) {
        return Math.sqrt(point1.reduce((sum, val, index) => sum + Math.pow(val - point2[index], 2), 0));
    }
}


const trainingData = [
    [5.1, 3.5], [4.9, 3.0], [4.7, 3.2], [5.0, 3.6], [6.2, 3.4],
    [5.9, 3.0], [6.0, 2.2], [5.1, 3.3], [5.7, 2.8], [6.3, 2.9]
];
const trainingLabels = [0, 0, 0, 0, 1, 1, 1, 0, 1, 1];

const testData = [
    [5.0, 3.4], [6.1, 2.8]
];

const knn = new KNNClassifier(3);
knn.train(trainingData, trainingLabels);

const predictions = knn.predict(testData);

console.log("Predicción:", predictions);
