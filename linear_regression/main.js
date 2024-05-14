class LinealRegression {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.n = x.length;
        this.math = new DiscreteMaths();
        this.slr = new Slr(x, y);
    }

    prediction(inputNumber) {
        const a = this.slr.calcularA();
        const b = this.slr.calcularB();

        // Ya no necesitamos solicitar el número al usuario aquí
        // Utilizamos el número que se pasa como argumento
        // var c = prompt("Ingrese el primer número:");
        // c = parseFloat(c); 25

        return a + (b * inputNumber);
    }

    calcularSSR() {
        const a = this.slr.calcularA();
        const b = this.slr.calcularB();
        const yPredicho = this.x.map(x => a + (b * x));
        // const yPredicho = this.x.map(x => a * x + b);
        const mediaY = this.math.sum(this.y) / this.n;
        return this.math.sum(yPredicho.map((yp) => (yp - mediaY) ** 2));
    }

    calcularSST() {
        const mediaY = this.math.sum(this.y) / this.n;
        return this.math.sum(this.y.map(y => (y - mediaY) ** 2));
    }

    calcularCoeficienteDeterminacion() {
        const SSR = this.calcularSSR();
        const SST = this.calcularSST();

        return (SSR / SST);
    }
    calcularCoeficienteCorrelacion() {
        const a = this.slr.calcularA();
        const b = this.slr.calcularB();
        const yPredicho = this.x.map(x => a + (b * x));
        const mediaY = this.math.sum(this.y) / this.n;

        const SSR = this.math.sum(yPredicho.map((yp) => (yp - mediaY) ** 2));
        const SST = this.calcularSST();

        const r = Math.sqrt(SSR / SST);

        return r;
    }

}

class DiscreteMaths {
    sum(arr) {
        return arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }

    square(arr) {
        return arr.map(numero => numero ** 2);
    }

    multiply(arr1, arr2) {
        return arr1.map((valor, indice) => valor * arr2[indice]);
    }
}

class Slr {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.n = x.length;
        this.math = new DiscreteMaths();
    }

    calcularA() {
        const sumX = this.math.sum(this.x);
        const sumY = this.math.sum(this.y);
        const xSquare = this.math.square(this.x);
        const sumXSquare = this.math.sum(xSquare);
        const xy = this.math.multiply(this.x, this.y);
        const sumXY = this.math.sum(xy);

        return (sumY * sumXSquare - sumX * sumXY) / (this.n * sumXSquare - sumX * sumX);
    }

    calcularB() {
        const sumX = this.math.sum(this.x);
        const sumY = this.math.sum(this.y);
        const xSquare = this.math.square(this.x);
        const sumXSquare = this.math.sum(xSquare);
        const xy = this.math.multiply(this.x, this.y);
        const sumXY = this.math.sum(xy);

        return (this.n * sumXY - sumX * sumY) / (this.n * sumXSquare - sumX * sumX);
    }
}

const x = [1,2,3,4,5,6,7,8,9];
const y = [2,4,6,8,10,12,14,16,18];

const regresion = new LinealRegression(x, y);
const a = regresion.slr.calcularA();
const b = regresion.slr.calcularB();

const prediction = regresion.prediction();

console.log("a:", a);
console.log("b:", b);

console.log("SSR:", regresion.calcularSSR());
console.log("SST:", regresion.calcularSST());
console.log("Coeficiente de determinacion (r2):", regresion.calcularCoeficienteDeterminacion());
console.log("Coeficiente de correlacion (r):", regresion.calcularCoeficienteCorrelacion());

for (let i = 0; i < 5; i++) {
    const inputNumber = parseFloat(prompt("Ingrese el número para la predicción:"));

    const prediction = regresion.prediction(inputNumber);
    console.log("Predicción [", i, "]:",inputNumber, "-->", prediction);
}



