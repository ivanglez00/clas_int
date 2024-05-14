class Polymomial {
    constructor(x, y) {
       
        if (!((x instanceof Array && y instanceof Array) ||
            (x instanceof Float32Array && y instanceof Float32Array) ||
            (x instanceof Float64Array && y instanceof Float64Array))) {
            throw new Error('x and y must be arrays');
        }
        if (x instanceof Float32Array) {
            this.FloatXArray = Float32Array;
        } else if (x instanceof Float64Array) {
            this.FloatXArray = Float64Array;
        }
      
        if (x.length !== y.length) {
            throw new Error('x and y must have the same length');
        }
        this.x = x;
        this.y = y;
    }

    static gaussJordanDivide(matrix, row, col, numCols) {
        for (let i = col + 1; i < numCols; i++) {
            matrix[row][i] /= matrix[row][col];
        }
        matrix[row][col] = 1;
    }

    static gaussJordanEliminate(matrix, row, col, numRows, numCols) {
        for (let i = 0; i < numRows; i++) {
            if (i !== row && matrix[i][col] !== 0) {
                for (let j = col + 1; j < numCols; j++) {
                    matrix[i][j] -= matrix[i][col] * matrix[row][j];
                }
                matrix[i][col] = 0;
            }
        }
    }

    static gaussJordanEchelonize(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        let i = 0;
        let j = 0;
        let k;
        let swap;
        while (i < rows && j < cols) {
            k = i;
          
            while (k < rows && matrix[k][j] === 0) {
                k++;
            }
            
            if (k < rows) {
                
                if (k !== i) {
                    swap = matrix[i];
                    matrix[i] = matrix[k];
                    matrix[k] = swap;
                }
                
                if (matrix[i][j] !== 1) {
                    Polymomial.gaussJordanDivide(matrix, i, j, cols);
                }
              
                Polymomial.gaussJordanEliminate(matrix, i, j, rows, cols);
                i++;
            }
            j++;
        }
        return matrix;
    }

    static regress(x, terms) {
        let a = 0;
        let exp = 0;
        for (let i = 0, len = terms.length; i < len; i++) {
            a += terms[i] * Math.pow(x, exp++);
        }
        return a;
    }

    correlationCoefficient(terms) {
        let r = 0;
        const n = this.x.length;
        let sx = 0;
        let sx2 = 0;
        let sy = 0;
        let sy2 = 0;
        let sxy = 0;
        let x, y;
        for (let i = 0; i < n; i++) {
            x = Polymomial.regress(this.x[i], terms);
            y = this.y[i];
            sx += x;
            sy += y;
            sxy += x * y;
            sx2 += x * x;
            sy2 += y * y;
        }
        const div = Math.sqrt((sx2 - (sx * sx) / n) * (sy2 - (sy * sy) / n));
        if (div !== 0) {
            r = Math.pow((sxy - (sx * sy) / n) / div, 2);
        }
        return r;
    }

    standardError(terms) {
        let r = 0;
        const n = this.x.length;
        if (n > 2) {
            let a = 0;
            for (let i = 0; i < n; i++) {
                a += Math.pow((Polymomial.regress(this.x[i], terms) - this.y[i]), 2);
            }
            r = Math.sqrt(a / (n - 2));
        }
        return r;
    }

    computeCoefficients(p) {
        const n = this.x.length;
        let r;
        let c;
        const rs = 2 * (++p) - 1;
        let i;
        const m = [];
        
        if (this.FloatXArray) {
            
            const bytesPerRow = (p + 1) * this.FloatXArray.BYTES_PER_ELEMENT;
            const buffer = new ArrayBuffer(p * bytesPerRow);
            for (i = 0; i < p; i++) {
                m[i] = new this.FloatXArray(buffer, i * bytesPerRow, p + 1);
            }
        } else {
            const zeroRow = [];
            for (i = 0; i <= p; i++) {
                zeroRow[i] = 0;
            }
            m[0] = zeroRow;
            for (i = 1; i < p; i++) {
                
                m[i] = zeroRow.slice();
            }
        }
        const mpc = [n];
        for (i = 1; i < rs; i++) {
            mpc[i] = 0;
        }
        for (i = 0; i < n; i++) {
            const x = this.x[i];
            const y = this.y[i];
          
            for (r = 1; r < rs; r++) {
                mpc[r] += Math.pow(x, r);
            }
         
            m[0][p] += y;
            for (r = 1; r < p; r++) {
                m[r][p] += Math.pow(x, r) * y;
            }
        }
        
        for (r = 0; r < p; r++) {
            for (c = 0; c < p; c++) {
                m[r][c] = mpc[r + c];
            }
        }
        Polymomial.gaussJordanEchelonize(m);
        const terms = this.FloatXArray && new this.FloatXArray(m.length) || [];
        for (i = m.length - 1; i >= 0; i--) {
            terms[i] = m[i][p];
        }
        return terms;
    }

    getPolynomial(degree) {
        if (isNaN(degree) || degree < 0) {
            throw new Error('Degree must be a positive integer');
        }
        var terms = this.computeCoefficients(degree);
        var eqParts = [];
        eqParts.push(terms[0].toPrecision());
        for (var i = 1, len = terms.length; i < len; i++) {
            eqParts.push(terms[i] + ' * Math.pow(x, ' + i + ')');
        }
        var expr = 'return ' + eqParts.join(' + ') + ';';
        return new Function('x', expr);
    }

    toExpression(degree) {
        if (isNaN(degree) || degree < 0) {
            throw new Error('Degree must be a positive integer');
        }
        var terms = this.computeCoefficients(degree);
        var eqParts = [];
        var len = terms.length;
        eqParts.push(terms[0].toPrecision());
        for (var i = 1; i < len; i++) {
            eqParts.push(terms[i] + 'x^' + i);
        }
        return eqParts.join(' + ');
    }
    predict(xValue) {
        
        var polynomial = this.getPolynomial(this.x.length - 1);
        return polynomial(xValue);
    }
}

const x = [108,115,106,97,95,91,97,83,83,78,54,67,56,53,61,115,81,78,30,45,99,32,25,28,90,89];
const y = [95,96,95,97,93,94,95,93,92,86,73,80,65,69,77,96,87,89,60,63,95,61,55,56,94,93];

const poly = new Polymomial(x,y);

const coef = poly.computeCoefficients(1);

var rSquared = poly.correlationCoefficient(coef);
 var correlationCoefficient = Math.sqrt(rSquared);
 var regressionEquation = poly.toExpression(1);
 var polynomialFunction = poly.getPolynomial(1);


 console.log('Coeficiente de determinación (R cuadrada):', rSquared);
console.log('Coeficiente de correlación (R):', correlationCoefficient);
console.log('Ecuación de Regresión Polinomial :', regressionEquation);

var unknownXValues = [108, 116, 23];
for (var i = 0; i < unknownXValues.length; i++) {
    var predictedYUnknown = polynomialFunction(unknownXValues[i]);
    console.log('Predicción para x =', unknownXValues[i] + ':', predictedYUnknown);
}