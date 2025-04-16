//Tính định thức bằng phương pháp đệ quy.
export function determinantMod26(matrix) {
    const n = matrix.length;
    if (n === 1) return matrix[0][0] % 26;
    
    let det = 0;
    for (let i = 0; i < n; i++) {
        const subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
        det += ((i % 2 === 0 ? 1 : -1) * matrix[0][i] * determinantMod26(subMatrix)) % 26;
    }
    return (det + 26) % 26;
}

export function modInverse(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return null;
}
// Tính ma trận nghịch đảo bằng ma trận phần bù đại số và chuyển vị.
export function inverseMatrixMod26(matrix) {
    const n = matrix.length;
    const det = determinantMod26(matrix);
    const detInverse = modInverse(det, 26);
    if (det === 0 || detInverse === null) return null;

    const cofactorMatrix = Array(n).fill(null).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const subMatrix = matrix
                .filter((_, rowIndex) => rowIndex !== i)
                .map(row => row.filter((_, colIndex) => colIndex !== j));
            
            cofactorMatrix[i][j] = ((determinantMod26(subMatrix) * ((i + j) % 2 === 0 ? 1 : -1)) + 26) % 26;
        }
    }
    
    const adjugateMatrix = transposeMatrix(cofactorMatrix);
    return adjugateMatrix.map(row => row.map(num => (num * detInverse) % 26));
}
// Chuyển vị ma trận để hỗ trợ tính adjugate.
function transposeMatrix(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function mod26(value) {
    return ((value % 26) + 26) % 26;
}

// Mã hóa văn bản
export function encryptText(text, keyMatrix) {
    if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
        throw new Error("Dữ liệu đầu vào không hợp lệ!");
    }

    const n = keyMatrix.length;
    if (keyMatrix.some(row => row.length !== n)) {
        throw new Error("Ma trận khóa không hợp lệ! Phải là ma trận vuông.");
    }

    // Kiểm tra khả nghịch của ma trận khóa
    const inverseKeyMatrix = inverseMatrixMod26(keyMatrix);
    if (!inverseKeyMatrix) {
        return { error: "Ma trận khóa không khả nghịch! Không thể mã hóa văn bản." };
    }

    let textVector = text.toUpperCase().split("").map(ch => ch.charCodeAt(0) - 65);
    while (textVector.length % n !== 0) {
        textVector.push(23); // Thêm ký tự X (23) nếu thiếu
    }

    let encryptedVector = [];
    let steps = [];
    let blocks = [];

    // Xuất toàn bộ khối văn bản gốc
    for (let i = 0; i < textVector.length; i += n) {
        let block = textVector.slice(i, i + n);
        let blockChars = block.map(num => String.fromCharCode(num + 65));

        blocks.push({ block, blockChars });

        steps.push({
            step: `Văn bản: (${blockChars.join("")}) => [${block.join(" | ")}]`,
            block,
            blockChars
        });
    }

    // Mã hóa
    for (let { block, blockChars } of blocks) {
        let encryptedBlock = new Array(n).fill(0);
        let stepDetails = [];
        const blockMatrix = [];

        blockMatrix.push(`<strong>KHÓA:</strong> [${keyMatrix.join(" | ")}]`);

        for (let row = 0; row < n; row++) {
            let sum = 0;
            let calculationSteps = [];

            for (let col = 0; col < n; col++) {
                let product = keyMatrix[row][col] * block[col];
                sum += product;
                calculationSteps.push(`(${keyMatrix[row][col]} * ${block[col]})`);
            }

            encryptedBlock[row] = mod26(sum);
            stepDetails.push(`- <strong>HÀNG ${row + 1}:</strong> ${calculationSteps.join(" + ")} = ${sum} mod 26 = ${encryptedBlock[row]}`);
        }

        let encryptedChars = encryptedBlock.map(num => String.fromCharCode(num + 65));

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


// Giải mã văn bản
export function decryptText(text, keyMatrix) {
    if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
        throw new Error("Dữ liệu đầu vào không hợp lệ!");
    }

    const n = keyMatrix.length;
    if (keyMatrix.some(row => row.length !== n)) {
        throw new Error("Ma trận khóa không hợp lệ! Phải là ma trận vuông.");
    }

    // Tính ma trận nghịch đảo của khóa sử dụng các hàm đã có
    let inverseKeyMatrix;

    try {
        inverseKeyMatrix = inverseMatrixMod26(keyMatrix);
    } catch (err) {
        console.error("Lỗi tính nghịch đảo:", err.message);
        return { error: "Không thể tính nghịch đảo của ma trận khóa. Đảm bảo ma trận khả nghịch trong modulo 26." };
    }

    if (!inverseKeyMatrix) {
        return { error: "Ma trận khóa không khả nghịch!" };
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

    // Thực hiện giải mã
    for (let { block, blockChars } of blocks) {
        let decryptedBlock = new Array(n).fill(0);
        let stepDetails = [];
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

            decryptedBlock[row] = ((sum % 26) + 26) % 26;
            stepDetails.push(`- <strong>HÀNG ${row + 1}:</strong> ${calculationSteps.join(" + ")} = ${sum} mod 26 = ${decryptedBlock[row]}`);
        }

        let decryptedChars = decryptedBlock.map(num => String.fromCharCode(num + 65));

        // Lưu kết quả giải mã
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
