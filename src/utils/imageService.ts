
/**
 * Extracts the file ID from a Google Drive URL and returns a direct download link.
 * Note: This relies on the file being public or accessible.
 * CORS might still be an issue for client-side fetching.
 */
export const getGoogleDriveDirectLink = (url: string): string => {
    if (!url) return '';

    // Handle already direct links or non-drive links
    if (!url.includes('drive.google.com')) return url;

    // Regex to extract ID
    // Matches /file/d/ID/view or id=ID
    const idPatterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of idPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            // Use the export=view format which is standard for direct access
            return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
    }

    return url;
};

/**
 * Fetches an image from a URL and converts it to a Base64 string.
 * Returns an empty string if fetching fails.
 */
export const fetchImageAsBase64 = async (url: string): Promise<string> => {
    if (!url) return '';

    const directUrl = getGoogleDriveDirectLink(url);

    try {
        // Use corsproxy.io which is often faster than allorigins
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(directUrl)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`Failed to fetch image from ${directUrl}: ${response.statusText}`);
            return '';
        }

        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result);
            };
            reader.onerror = () => {
                console.error('Error reading image blob');
                resolve('');
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Error fetching image from ${directUrl}:`, error);
        return '';
    }
};
