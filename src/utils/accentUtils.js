export function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

export function restoreAccents(decryptedText, originalText) {
    // Kiểm tra độ dài và tạo ra một mảng để lưu trữ kết quả
    let restoredText = "";
    let i = 0;

    for (let j = 0; j < decryptedText.length; j++) {
        // Kiểm tra nếu ký tự trong originalText có dấu
        if (originalText[i] && originalText[i] !== decryptedText[j]) {
            restoredText += originalText[i];  // Gắn dấu từ originalText vào decryptedText
        } else {
            restoredText += decryptedText[j]; // Nếu không, giữ nguyên ký tự giải mã
        }
        i++;
    }

    return restoredText;
}

