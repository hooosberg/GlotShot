
/**
 * Simple ICO Generator for Browser
 * Packs multiple PNG images into a single .ico file.
 * 
 * Reference: https://en.wikipedia.org/wiki/ICO_(file_format)
 */

export const generateIco = async (images) => {
    // images: Array of { width, height, data (Uint8Array or ArrayBuffer of PNG) }

    const headerSize = 6;
    const directoryEntrySize = 16;
    let offset = headerSize + (images.length * directoryEntrySize);

    const headers = [];
    const bodies = [];

    for (const img of images) {
        const len = img.data.byteLength;

        // Directory Entry
        const entry = new Uint8Array(16);
        const view = new DataView(entry.buffer);

        view.setUint8(0, img.width >= 256 ? 0 : img.width);   // Width
        view.setUint8(1, img.height >= 256 ? 0 : img.height); // Height
        view.setUint8(2, 0);                                  // Color palette (0 = no palette)
        view.setUint8(3, 0);                                  // Reserved
        view.setUint16(4, 1, true);                           // Color planes (1)
        view.setUint16(6, 32, true);                          // Bits per pixel (32)
        view.setUint32(8, len, true);                         // Size of image data
        view.setUint32(12, offset, true);                     // Offset of image data

        headers.push(entry);
        bodies.push(img.data);

        offset += len;
    }

    // Combine everything
    const totalSize = offset;
    const icoBuffer = new Uint8Array(totalSize);
    const view = new DataView(icoBuffer.buffer);

    // ICO Header
    view.setUint16(0, 0, true); // Reserved
    view.setUint16(2, 1, true); // Type (1 = ICO)
    view.setUint16(4, images.length, true); // Count

    let currentOffset = 6;

    // Write Directory
    for (const header of headers) {
        icoBuffer.set(header, currentOffset);
        currentOffset += 16;
    }

    // Write Bodies
    for (const body of bodies) {
        icoBuffer.set(new Uint8Array(body), currentOffset);
        currentOffset += body.byteLength;
    }

    return icoBuffer;
};

// Helper to convert Canvas to PNG Uint8Array
export const canvasToPngBuffer = async (canvas) => {
    return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
            const buffer = await blob.arrayBuffer();
            resolve(new Uint8Array(buffer));
        }, 'image/png');
    });
};
