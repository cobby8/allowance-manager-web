import CryptoJS from 'crypto-js';

/**
 * Encrypts a string using AES-256.
 * @param text The text to encrypt.
 * @param key The encryption key (password).
 * @returns The encrypted string (ciphertext).
 */
export const encrypt = (text: string, key: string): string => {
    if (!text) return '';
    return CryptoJS.AES.encrypt(text, key).toString();
};

/**
 * Decrypts a string using AES-256.
 * @param cipherText The encrypted string to decrypt.
 * @param key The encryption key (password).
 * @returns The decrypted original string.
 */
export const decrypt = (cipherText: string, key: string): string => {
    if (!cipherText) return '';
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption failed:', error);
        return '';
    }
};

/**
 * Masks a resident ID (e.g., "900101-1234567" -> "900101-1******").
 * Assumes the format is roughly 6 digits - 7 digits.
 */
export const maskResidentId = (residentId: string): string => {
    if (!residentId) return '';
    // Simple check for hyphen
    const parts = residentId.split('-');
    if (parts.length === 2) {
        const firstPart = parts[0];
        const secondPart = parts[1];
        if (secondPart.length > 0) {
            // Keep first digit of second part, mask the rest
            return `${firstPart}-${secondPart[0]}${'*'.repeat(secondPart.length - 1)}`;
        }
    }
    // Fallback if format is unexpected: keep first 6 chars, mask rest
    if (residentId.length > 6) {
        return `${residentId.substring(0, 6)}${'*'.repeat(residentId.length - 6)}`;
    }
    return residentId;
};

/**
 * Masks an account number (e.g., "123-456-7890" -> "123-***-7890" or similar).
 * Strategy: Keep first 3 and last 4 chars visible, mask the middle.
 */
export const maskAccountNumber = (accountNumber: string): string => {
    if (!accountNumber) return '';
    if (accountNumber.length <= 6) return accountNumber; // Too short to mask effectively

    const visibleStart = 3;
    const visibleEnd = 4;
    const maskLength = accountNumber.length - visibleStart - visibleEnd;

    if (maskLength <= 0) {
        // Fallback for somewhat short numbers
        return `${accountNumber.substring(0, 2)}${'*'.repeat(accountNumber.length - 2)}`;
    }

    return `${accountNumber.substring(0, visibleStart)}${'*'.repeat(maskLength)}${accountNumber.substring(accountNumber.length - visibleEnd)}`;
};
