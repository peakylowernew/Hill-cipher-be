import { determinantMod26, modInverse, inverseMatrixMod26 } from './matrixUtils.js';
import { removeAccents, restoreAccents } from './accentUtils.js';
// Mã hóa văn bản
export function encryptText(text, keyMatrix) {
    if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
        throw new Error("Dữ liệu đầu vào không hợp lệ!");
    }
    // xử lý chuôi tiếng việt
    const originalText = text; // Lưu lại bản gốc có dấu
    text = removeAccents(text); // Bỏ dấu để mã hóa

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

    const lastCharValue = textVector.length > 0 ? textVector[textVector.length - 1] : 23; // Dùng ký tự cuối, mặc định X (23) nếu chuỗi rỗng
    while (textVector.length % n !== 0) {
        textVector.push(lastCharValue); // Đệm bằng giá trị số của ký tự cuối
    }

    let encryptedVector = [];
    let steps = [];
    let blocks = [];

    // Tạo các khối văn bản gốc
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

    // Mã hóa từng khối
    for (let { block, blockChars } of blocks) {
        let encryptedBlock = new Array(n).fill(0);
        let stepDetails = [];
        const blockMatrix = [`<strong>KHÓA:</strong> [${keyMatrix.map(row => row.join(" ")).join(" | ")}]`];

        for (let row = 0; row < n; row++) {
            let sum = 0;
            let calculationSteps = [];

            for (let col = 0; col < n; col++) {
                let product = keyMatrix[row][col] * block[col];
                sum += product;
                calculationSteps.push(`(${keyMatrix[row][col]} * ${block[col]})`);
            }

            encryptedBlock[row] = ((sum % 26) + 26) % 26; // Đảm bảo kết quả luôn dương
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
    console.log("keyMatrix:", keyMatrix);

    return {
        encryptedText: encryptedVector.map(num => String.fromCharCode(num + 65)).join(""),
        steps,
        originalText //luu ban ro (co dau)
    };
}

//giai ma
export function decryptText(text, keyMatrix, originalText = null) { // ✨ Thêm originalText
    if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
        throw new Error("Dữ liệu đầu vào không hợp lệ!");
    }

    const n = keyMatrix.length;
    if (keyMatrix.some(row => row.length !== n)) {
        throw new Error("Ma trận khóa không hợp lệ! Phải là ma trận vuông.");
    }

    let steps = [];
    let decryptedVector = [];

    // Tính định thức và nghịch đảo
    const det = determinantMod26(keyMatrix);
    const detInverse = modInverse(det, 26);

    steps.push(`Định thức của ma trận khóa: ${det}`);
    steps.push(`Nghịch đảo của định thức mod 26: ${detInverse}`);

    if (det === 0 || detInverse === null) {
        steps.push("Ma trận khóa không khả nghịch trong modulo 26!");
        return { decryptedText: null, steps };
    }

    const inverseMatrix = inverseMatrixMod26(keyMatrix, detInverse);
    if (!inverseMatrix) {
        steps.push("Không thể tính nghịch đảo của ma trận!");
        return { decryptedText: null, steps };
    }
    console.log("Khóa nghịch:", inverseMatrix);

    // Chuẩn bị vector văn bản mã hóa
    let textVector = text.toUpperCase().split("").map(ch => ch.charCodeAt(0) - 65);
    let blocks = [];

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

    // Giải mã từng khối
    for (let { block, blockChars } of blocks) {
        let decryptedBlock = new Array(n).fill(0);
        let stepDetails = [];
        const blockMatrix = [`<strong>KHÓA NGHỊCH:</strong> [${inverseMatrix.map(row => row.join(" ")).join(" | ")}]`];

        for (let row = 0; row < n; row++) {
            let sum = 0;
            let calculationSteps = [];

            for (let col = 0; col < n; col++) {
                let product = inverseMatrix[row][col] * block[col];
                sum += product;
                calculationSteps.push(`(${inverseMatrix[row][col]} * ${block[col]})`);
            }

            decryptedBlock[row] = ((sum % 26) + 26) % 26;
            stepDetails.push(`- <strong>HÀNG ${row + 1}:</strong> ${calculationSteps.join(" + ")} = ${sum} mod 26 = ${decryptedBlock[row]}`);
        }

        let decryptedChars = decryptedBlock.map(num => String.fromCharCode(num + 65));
        steps.push({
            key: blockMatrix,
            details: stepDetails,
            step: `Giải mã: [${decryptedBlock.join(" | ")}] => (${decryptedChars.join("")})`,
            decryptedBlock,
            decryptedChars
        });

        decryptedVector.push(...decryptedBlock);
    }

    let decryptedText = decryptedVector.map(num => String.fromCharCode(num + 65)).join("");
    steps.push(`Chuỗi giải mã đầy đủ (không dấu): ${decryptedText}`);

    // Cắt bỏ ký tự đệm
    let paddingCount = 0;
    const maxPadding = n - 1;
    for (let i = decryptedText.length - 1; i > 0 && paddingCount < maxPadding; i--) {
        if (decryptedText[i] === decryptedText[i - 1]) {
            paddingCount++;
        } else {
            break;
        }
    }

    if (paddingCount > 0) {
        decryptedText = decryptedText.slice(0, decryptedText.length - paddingCount);
        steps.push(`Đã cắt bỏ ${paddingCount} ký tự đệm ở cuối: ${decryptedText}`);
    } else {
        steps.push("Không phát hiện ký tự đệm ở cuối.");
    }
// sau khi giải mã thì ra decryptedText=BUON và originalText= buồnbuồn
    // ✨✨ GHÉP LẠI DẤU nếu có originalText
    if (originalText) {
        const restoredText = restoreAccents(decryptedText, originalText);
        steps.push(`Chuỗi sau khi ghép lại dấu: ${restoredText}`);
        decryptedText = restoredText;
    }

    return {
        decryptedText,
        inverseMatrix, // trả về khóa nghịch đảo 
        steps
    };
}