export function determinantMod26(matrix) {
    const n = matrix.length;
    if (n === 1) return matrix[0][0] % 26;
    
    let det = 0;
    for (let col = 0; col < n; col++) {
        let subMatrix = matrix.slice(1).map(row => row.filter((_, j) => j !== col));
        let cofactor = ((col % 2 === 0 ? 1 : -1) * matrix[0][col] * determinantMod26(subMatrix)) % 26;
        det = (det + cofactor + 26) % 26;
    }
    return det;
}

export function modInverse(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return null;
}

export function inverseMatrixMod26(matrix, detInverse) {
    const n = matrix.length;
    let adjugate = Array.from({ length: n }, () => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let subMatrix = matrix.filter((_, row) => row !== i).map(row => row.filter((_, col) => col !== j));
            let cofactor = ((i + j) % 2 === 0 ? 1 : -1) * determinantMod26(subMatrix);
            adjugate[j][i] = ((cofactor * detInverse) % 26 + 26) % 26; // Transpose + mod
        }
    }
    return adjugate;
}
// ma hoa
export function encryptText(text, keyMatrix) {
    if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
        throw new Error("Dữ liệu đầu vào không hợp lệ!");
    }

    const n = keyMatrix.length;
    if (keyMatrix.some(row => row.length !== n)) {
        throw new Error("Ma trận khóa không hợp lệ! Phải là ma trận vuông.");
    }

    let textVector = text.toUpperCase().split("").map(ch => ch.charCodeAt(0) - 65);
    while (textVector.length % n !== 0) {
        textVector.push(23); // Pad with X (23)
    }

    let encryptedVector = [];
    let steps = [];  // Dùng để lưu các bước mã hóa

    for (let i = 0; i < textVector.length; i += n) {
        let block = textVector.slice(i, i + n);
        let encryptedBlock = new Array(n).fill(0);

        // Lưu lại ma trận khối trước khi mã hóa
        steps.push({
            step: `Khối văn bản: [${block.join(", ")}]`,
            block
        });

        // Thực hiện phép nhân ma trận
        for (let row = 0; row < n; row++) {
            for (let col = 0; col < n; col++) {
                encryptedBlock[row] += keyMatrix[row][col] * block[col];
            }
            encryptedBlock[row] = encryptedBlock[row] % 26;
        }

        // Lưu lại kết quả sau khi mã hóa
        steps.push({
            step: `Kết quả sau mã hóa: [${encryptedBlock.join(", ")}]`,
            encryptedBlock
        });

        encryptedVector.push(...encryptedBlock);
    }

    return { encryptedText: encryptedVector.map(num => String.fromCharCode(num + 65)).join(""), steps };
}

// giai ma
export function decryptText(text, keyMatrix) {
    const steps = []; // Lưu các bước tính toán
    try {
        const n = keyMatrix.length;
        const det = determinantMod26(keyMatrix);
        const detInverse = modInverse(det, 26);

        steps.push(`Determinant of key matrix: ${det}`);
        steps.push(`Inverse of determinant mod 26: ${detInverse}`);

        if (det === 0 || detInverse === null) {
            console.log("Ma trận khóa không khả nghịch trong modulo 26!");
            return { decryptedText: null, steps };
        }

        const inverseMatrix = inverseMatrixMod26(keyMatrix, detInverse);
        steps.push(`Inverse of key matrix: ${JSON.stringify(inverseMatrix)}`);

        if (!inverseMatrix) {
            throw new Error("Không thể tính nghịch đảo của ma trận!");
        }

        const decryptedText = hillCipherDecrypt(text, inverseMatrix, steps);

        return { decryptedText, steps };
    } catch (error) {
        console.error("Lỗi giải mã:", error);
        return { decryptedText: null, steps };
    }
}

export function hillCipherDecrypt(text, inverseMatrix, steps) {
    const n = inverseMatrix.length;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    text = text.toUpperCase().replace(/[^A-Z]/g, "");

    steps.push(`Text to be decrypted (uppercased and cleaned): ${text}`);

    let decryptedText = "";
    for (let i = 0; i < text.length; i += n) {
        let vector = [];
        for (let j = 0; j < n; j++) {
            vector.push(alphabet.indexOf(text[i + j] || "X"));
        }

        steps.push(`Vector for block ${text.slice(i, i + n)}: ${JSON.stringify(vector)}`);

        let resultVector = new Array(n).fill(0);
        for (let row = 0; row < n; row++) {
            for (let col = 0; col < n; col++) {
                resultVector[row] += inverseMatrix[row][col] * vector[col];
            }
            resultVector[row] = ((resultVector[row] % 26) + 26) % 26;
        }

        steps.push(`Decrypted vector: ${JSON.stringify(resultVector)}`);

        decryptedText += resultVector.map(num => alphabet[num]).join("");
    }

    steps.push(`Final decrypted text: ${decryptedText}`);
    return decryptedText;
}
