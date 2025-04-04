function modInverse(a, m) {
    // Hàm tính nghịch đảo mod m (modular inverse)
    a = a % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return -1;  // Nếu không có nghịch đảo
}

function calculateMatrixInverse(matrix) {
    // Hàm tính ma trận nghịch đảo
    const n = matrix.length;
    const det = determinant(matrix);
    if (det === 0) return null;  // Ma trận không khả nghịch

    const adjugate = adjugateMatrix(matrix);
    const invDet = modInverse(det, 26);  // Tính nghịch đảo của định thức mod 26
    const inverseMatrix = adjugate.map(row =>
        row.map(value => (value * invDet) % 26)  // Nhân từng phần tử với nghịch đảo của định thức
    );

    return inverseMatrix;
}

function determinant(matrix) {
    // Tính định thức của ma trận
    const n = matrix.length;
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

    let det = 0;
    for (let i = 0; i < n; i++) {
        let subMatrix = matrix.slice(1).map(row => row.filter((_, index) => index !== i));
        det += ((i % 2 === 0 ? 1 : -1) * matrix[0][i] * determinant(subMatrix));
    }
    return det;
}

function adjugateMatrix(matrix) {
    // Tính ma trận phụ (adjugate matrix)
    const n = matrix.length;
    let adj = [];
    for (let i = 0; i < n; i++) {
        adj[i] = [];
        for (let j = 0; j < n; j++) {
            let subMatrix = matrix
                .filter((_, rowIndex) => rowIndex !== i)
                .map(row => row.filter((_, colIndex) => colIndex !== j));
            adj[i][j] = ((i + j) % 2 === 0 ? 1 : -1) * determinant(subMatrix);
        }
    }
    return adj;
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
    let blocks = [];    
    // Xuất toàn bộ khối văn bản gốc trước
    for (let i = 0; i < textVector.length; i += n) {
        let block = textVector.slice(i, i + n);
        let blockChars = block.map(num => String.fromCharCode(num + 65));

        blocks.push({ block, blockChars });

        // Lưu khối văn bản gốc
        steps.push({
            step: `Văn bản: (${blockChars.join("")}) => [${block.join(" | ")}]`,
            block,
            blockChars
        });
    }

    // Thực hiện mã hóa sau khi xuất toàn bộ khối văn bản
    for (let { block, blockChars } of blocks) {
        let encryptedBlock = new Array(n).fill(0);
        let stepDetails = []; // Dùng để lưu từng bước nhân và cộng
        const blockMatrix = [];
        blockMatrix.push(`<strong>KHÓA:</strong> [${keyMatrix.join(" | ")}]`);
        // Nhân ma trận để mã hóa
        for (let row = 0; row < n; row++) {
            let sum = 0;
            let calculationSteps = [];
            let keycol= [];

            for (let col = 0; col < n; col++) {
                let product = keyMatrix[row][col] * block[col];
                sum += product;
                calculationSteps.push(`(${keyMatrix[row][col]} * ${block[col]})`);
                // keycol.push(`(${keyMatrix[col]})`);
            }
            // blockMatrix.push(`K: [${keycol.join(" | ")}]`);
            encryptedBlock[row] = sum % 26; // Giới hạn trong 26 chữ cái
            stepDetails.push(`- <strong>HÀNG ${row + 1}:</strong> ${calculationSteps.join(" + ")} = ${sum} mod 26 = ${encryptedBlock[row]}`);
        }

        let encryptedChars = encryptedBlock.map(num => String.fromCharCode(num + 65));

        // Lưu kết quả sau mã hóa
        steps.push({
            key: blockMatrix,
            details: stepDetails,
            step: `Mã hóa: [${encryptedBlock.join(" | ")}] => (${encryptedChars.join("")})`,
            encryptedBlock,
            encryptedChars
        });

        encryptedVector.push(...encryptedBlock);
    }

    return { 
        originalText: text,
        encryptedText: encryptedVector.map(num => String.fromCharCode(num + 65)).join(""),
        steps
    };
}

// giai ma
// Hàm để đảm bảo kết quả mod 26 luôn là dương
function mod26(value) {
    return ((value % 26) + 26) % 26;
}

export function decryptText(text, keyMatrix) {
    if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
        throw new Error("Dữ liệu đầu vào không hợp lệ!");
    }

    const n = keyMatrix.length;
    if (keyMatrix.some(row => row.length !== n)) {
        throw new Error("Ma trận khóa không hợp lệ! Phải là ma trận vuông.");
    }

    // Tính ma trận nghịch đảo của khóa
    const inverseKeyMatrix = calculateMatrixInverse(keyMatrix);
    if (!inverseKeyMatrix) {
        throw new Error("Ma trận khóa không khả nghịch!");
    }

    let textVector = text.toUpperCase().split("").map(ch => ch.charCodeAt(0) - 65);
    let decryptedVector = [];
    let steps = [];
    let blocks = [];

    // Xuất toàn bộ khối văn bản gốc
    for (let i = 0; i < textVector.length; i += n) {
        let block = textVector.slice(i, i + n);
        let blockChars = block.map(num => String.fromCharCode(num + 65));

        blocks.push({ block, blockChars });

        // Lưu khối văn bản gốc
        steps.push({
            step: `Văn bản: (${blockChars.join("")}) => [${block.join(" | ")}]`,
            block,
            blockChars
        });
    }

    // Thực hiện giải mã sau khi xuất toàn bộ khối văn bản
    for (let { block, blockChars } of blocks) {
        let decryptedBlock = new Array(n).fill(0);
        let stepDetails = []; // Dùng để lưu từng bước nhân và cộng
        const blockMatrix = [];
        blockMatrix.push(`<strong>KHÓA NGHỊCH:</strong> [${inverseKeyMatrix.join(" | ")}]`);

        // Nhân ma trận nghịch đảo của khóa để giải mã
        for (let row = 0; row < n; row++) {
            let sum = 0;
            let calculationSteps = [];

            for (let col = 0; col < n; col++) {
                let product = inverseKeyMatrix[row][col] * block[col];
                sum += product;
                calculationSteps.push(`(${inverseKeyMatrix[row][col]} * ${block[col]})`);
            }

            decryptedBlock[row] = mod26(sum);  // Sử dụng hàm mod26 để đảm bảo kết quả không âm
            stepDetails.push(`- <strong>HÀNG ${row + 1}:</strong> ${calculationSteps.join(" + ")} = ${sum} mod 26 = ${decryptedBlock[row]}`);
        }

        let decryptedChars = decryptedBlock.map(num => String.fromCharCode(num + 65));

        // Lưu kết quả sau giải mã
        steps.push({
            key: blockMatrix,
            details: stepDetails,
            step: `Giải mã: [${decryptedBlock.join(" | ")}] => (${decryptedChars.join("")})`,
            decryptedBlock,
            decryptedChars
        });

        decryptedVector.push(...decryptedBlock);
    }

    return { 
        originalText: text,
        decryptedText: decryptedVector.map(num => String.fromCharCode(num + 65)).join(""),
        steps
    };
}
