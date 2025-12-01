import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontData } from './NanumGothic-Regular-normal';
import type { Employee, SettlementData } from '../types';
import { fetchImageAsBase64 } from './imageService';

// Load Korean font
const loadKoreanFont = (doc: jsPDF) => {
    doc.addFileToVFS('NanumGothic.ttf', fontData);
    doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
    doc.setFont('NanumGothic');
};

const isSettlementData = (data: Employee | SettlementData): data is SettlementData => {
    return 'workRecords' in data;
};

// Helper to process image: fetch if URL, return if already base64, or return empty
const processImage = async (imgData: string | undefined): Promise<string> => {
    if (!imgData) return '';
    if (imgData.startsWith('data:image/')) return imgData;
    // Assume it's a URL and try to fetch
    return await fetchImageAsBase64(imgData);
};

// Helper to format date as MM/DD (handles Korean "10월 11일" format)
const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // If already in MM/DD format, return as is
    if (dateStr.includes('/')) return dateStr;
    // Korean month/day pattern
    const koMatch = dateStr.match(/(\d+)\s*월\s*(\d+)\s*일/);
    if (koMatch) {
        const month = parseInt(koMatch[1], 10);
        const day = parseInt(koMatch[2], 10);
        return `${month}/${day}`;
    }
    // Fallback to parsing as ISO date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return dateStr; // give up, return original
};

// Helper function to save PDF using native anchor tag with improved compatibility
const savePdf = (doc: jsPDF, filename: string) => {
    // Explicitly create a Blob with the correct MIME type
    const blob = new Blob([doc.output('blob')], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none'; // Ensure link is not visible

    document.body.appendChild(link);
    link.click();

    // Delay cleanup to ensure the download process has started
    // This is critical for some browsers/environments to correctly capture the filename
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
};

export const generatePayslip = async (data: Employee | SettlementData) => {
    const doc = new jsPDF();
    loadKoreanFont(doc);

    // Title
    doc.setFontSize(20);
    doc.text('노무비 지급 명세서', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`발급일자: ${new Date().toLocaleDateString()}`, 190, 30, { align: 'right' });

    // Employee Info Table
    const empData = [
        ['성명', data.name, '주민등록번호', data.residentId],
        ['연락처', data.phoneNumber || data.address || '-', '소속', data.workPlace],
        ['은행명', data.bankName, '계좌번호', data.accountNumber]
    ];
    autoTable(doc, {
        startY: 35,
        head: [['사원 정보', '', '', '']],
        body: empData,
        styles: { font: 'NanumGothic', fontStyle: 'normal', fontSize: 10, cellPadding: 2 },
        headStyles: { font: 'NanumGothic', fillColor: [66, 66, 66], textColor: 255, fontStyle: 'normal', fontSize: 11 },
        bodyStyles: { font: 'NanumGothic', fontStyle: 'normal' },
        theme: 'grid',
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'normal', fillColor: [240, 240, 240] },
            1: { cellWidth: 65 },
            2: { cellWidth: 30, fontStyle: 'normal', fillColor: [240, 240, 240] },
            3: { cellWidth: 70 }
        }
    });

    let lastY = (doc as any).lastAutoTable.finalY + 10;

    // Work Records Table
    if (isSettlementData(data) && data.workRecords.length > 0) {
        const workRows = data.workRecords.map(record => [
            formatDate(record.date),
            record.category || '-',
            record.grossAmount.toLocaleString(),
            (record.businessTax + record.localTax).toLocaleString(),
            record.netAmount.toLocaleString()
        ]);
        // Total row
        workRows.push([
            '합계',
            '',
            data.totalGrossAmount.toLocaleString(),
            (data.totalGrossAmount - data.totalNetAmount).toLocaleString(),
            data.totalNetAmount.toLocaleString()
        ]);
        autoTable(doc, {
            startY: lastY,
            head: [['날짜', '구분', '지급액', '공제액(세금)', '실수령액']],
            body: workRows,
            styles: { font: 'NanumGothic', fontStyle: 'normal', fontSize: 9, cellPadding: 2, halign: 'center' },
            headStyles: { font: 'NanumGothic', fillColor: [66, 66, 66], textColor: 255, fontStyle: 'normal', fontSize: 10 },
            bodyStyles: { font: 'NanumGothic', fontStyle: 'normal' },
            theme: 'grid',
            didParseCell: data => {
                if (data.row.index === workRows.length - 1) {
                    data.cell.styles.fontStyle = 'normal';
                    data.cell.styles.fillColor = [240, 240, 240];
                }
            }
        });
    }

    savePdf(doc, `${data.name}_지급명세서.pdf`);
};

export const generateEvidenceDocument = async (data: Employee | SettlementData) => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
    loadKoreanFont(doc);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const midX = pageWidth / 2;
    const midY = pageHeight / 2;
    const boxWidth = (pageWidth - margin * 3) / 2;
    const boxHeight = (pageHeight - margin * 3) / 2;

    const drawBoxTitle = (title: string, x: number, y: number, w: number) => {
        doc.setFillColor(240, 240, 240);
        doc.rect(x, y, w, 10, 'F');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(title, x + w / 2, y + 7, { align: 'center' });
        doc.rect(x, y, w, boxHeight);
    };

    const drawImageProp = (imgData: string, x: number, y: number, w: number, h: number) => {
        try {
            const props = doc.getImageProperties(imgData);
            const scale = Math.min(w / props.width, h / props.height);
            const newW = props.width * scale;
            const newH = props.height * scale;
            const newX = x + (w - newW) / 2;
            const newY = y + (h - newH) / 2;
            const format = imgData.substring('data:image/'.length, imgData.indexOf(';')).toUpperCase();
            doc.addImage(imgData, format, newX, newY, newW, newH, undefined, 'FAST');
        } catch (e) {
            const format = imgData.substring('data:image/'.length, imgData.indexOf(';')).toUpperCase();
            doc.addImage(imgData, format, x, y, w, h, undefined, 'FAST');
        }
    };

    // Top‑Left: Basic Info
    const tlX = margin;
    const tlY = margin;
    drawBoxTitle('기본 정보', tlX, tlY, boxWidth);
    doc.setFontSize(11);
    const infoX = tlX + 10;
    let infoY = tlY + 25;
    const lineH = 12;
    doc.text(`성       명: ${data.name}`, infoX, infoY); infoY += lineH;
    doc.text(`주민등록번호: ${data.residentId}`, infoX, infoY); infoY += lineH;
    doc.text(`연 락 처: ${data.phoneNumber || data.address || '-'}`, infoX, infoY); infoY += lineH;
    doc.text(`은 행 명: ${data.bankName}`, infoX, infoY); infoY += lineH;
    doc.text(`계좌번호: ${data.accountNumber}`, infoX, infoY);

    const idCardData = await processImage(data.idCardImage);
    const bankBookData = await processImage(data.bankBookImage);
    const licenseData = await processImage(data.licenseImage);

    // Top‑Right: ID Card
    const trX = midX + margin / 2;
    const trY = margin;
    drawBoxTitle('신분증', trX, trY, boxWidth);
    if (data.idCardImage) {
        if (idCardData) {
            drawImageProp(idCardData, trX + 5, trY + 15, boxWidth - 10, boxHeight - 20);
        } else {
            doc.setFontSize(8);
            doc.text('이미지 로드 실패', trX + boxWidth / 2, trY + boxHeight / 2, { align: 'center' });
        }
    } else {
        doc.setFontSize(10);
        doc.text('이미지 없음 (데이터 없음)', trX + boxWidth / 2, trY + boxHeight / 2, { align: 'center' });
    }

    // Bottom‑Left: Bank Book
    const blX = margin;
    const blY = midY + margin / 2;
    drawBoxTitle('통장사본', blX, blY, boxWidth);
    if (data.bankBookImage) {
        if (bankBookData) {
            drawImageProp(bankBookData, blX + 5, blY + 15, boxWidth - 10, boxHeight - 20);
        } else {
            doc.setFontSize(8);
            doc.text('이미지 로드 실패', blX + boxWidth / 2, blY + boxHeight / 2, { align: 'center' });
        }
    } else {
        doc.setFontSize(10);
        doc.text('이미지 없음 (데이터 없음)', blX + boxWidth / 2, blY + boxHeight / 2, { align: 'center' });
    }

    // Bottom‑Right: License
    const brX = midX + margin / 2;
    const brY = midY + margin / 2;
    drawBoxTitle('자격증', brX, brY, boxWidth);
    if (data.licenseImage) {
        if (licenseData) {
            drawImageProp(licenseData, brX + 5, brY + 15, boxWidth - 10, boxHeight - 20);
        } else {
            doc.setFontSize(8);
            doc.text('이미지 로드 실패', brX + boxWidth / 2, brY + boxHeight / 2, { align: 'center' });
        }
    } else {
        doc.setFontSize(10);
        doc.text('이미지 없음 (데이터 없음)', brX + boxWidth / 2, brY + boxHeight / 2, { align: 'center' });
    }

    savePdf(doc, `${data.name}_증빙자료.pdf`);
};

export const generateBulkPayslips = async (dataList: (Employee | SettlementData)[]) => {
    const doc = new jsPDF();
    loadKoreanFont(doc);

    for (let i = 0; i < dataList.length; i++) {
        const data = dataList[i];
        if (i > 0) doc.addPage();
        doc.setFontSize(20);
        doc.text('노무비 지급 명세서', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`발급일자: ${new Date().toLocaleDateString()}`, 190, 30, { align: 'right' });
        const empData = [
            ['성명', data.name, '주민등록번호', data.residentId],
            ['연락처', data.phoneNumber || data.address || '-', '소속', data.workPlace],
            ['은행명', data.bankName, '계좌번호', data.accountNumber]
        ];
        autoTable(doc, {
            startY: 35,
            head: [['사원 정보', '', '', '']],
            body: empData,
            styles: { font: 'NanumGothic', fontStyle: 'normal', fontSize: 10, cellPadding: 2 },
            headStyles: { font: 'NanumGothic', fillColor: [66, 66, 66], textColor: 255, fontStyle: 'normal', fontSize: 11 },
            bodyStyles: { font: 'NanumGothic', fontStyle: 'normal' },
            theme: 'grid',
            columnStyles: {
                0: { cellWidth: 25, fontStyle: 'normal', fillColor: [240, 240, 240] },
                1: { cellWidth: 65 },
                2: { cellWidth: 30, fontStyle: 'normal', fillColor: [240, 240, 240] },
                3: { cellWidth: 70 }
            }
        });
        let lastY = (doc as any).lastAutoTable.finalY + 10;
        if (isSettlementData(data) && data.workRecords.length > 0) {
            const workRows = data.workRecords.map(record => [
                formatDate(record.date),
                record.category || '-',
                record.grossAmount.toLocaleString(),
                (record.businessTax + record.localTax).toLocaleString(),
                record.netAmount.toLocaleString()
            ]);
            workRows.push([
                '합계',
                '',
                data.totalGrossAmount.toLocaleString(),
                (data.totalGrossAmount - data.totalNetAmount).toLocaleString(),
                data.totalNetAmount.toLocaleString()
            ]);
            autoTable(doc, {
                startY: lastY,
                head: [['날짜', '구분', '지급액', '공제액(세금)', '실수령액']],
                body: workRows,
                styles: { font: 'NanumGothic', fontStyle: 'normal', fontSize: 9, cellPadding: 2, halign: 'center' },
                headStyles: { font: 'NanumGothic', fillColor: [66, 66, 66], textColor: 255, fontStyle: 'normal', fontSize: 10 },
                bodyStyles: { font: 'NanumGothic', fontStyle: 'normal' },
                theme: 'grid',
                didParseCell: data => {
                    if (data.row.index === workRows.length - 1) {
                        data.cell.styles.fontStyle = 'normal';
                        data.cell.styles.fillColor = [240, 240, 240];
                    }
                }
            });
        }
    }
    savePdf(doc, `전체_지급명세서_${new Date().toLocaleDateString()}.pdf`);
};

export const generateBulkEvidence = async (dataList: (Employee | SettlementData)[]) => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
    loadKoreanFont(doc);
    for (let i = 0; i < dataList.length; i++) {
        const data = dataList[i];
        if (i > 0) doc.addPage();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const midX = pageWidth / 2;
        const midY = pageHeight / 2;
        const boxWidth = (pageWidth - margin * 3) / 2;
        const boxHeight = (pageHeight - margin * 3) / 2;
        const drawBoxTitle = (title: string, x: number, y: number, w: number) => {
            doc.setFillColor(240, 240, 240);
            doc.rect(x, y, w, 10, 'F');
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(title, x + w / 2, y + 7, { align: 'center' });
            doc.rect(x, y, w, boxHeight);
        };
        const drawImageProp = (imgData: string, x: number, y: number, w: number, h: number) => {
            try {
                const props = doc.getImageProperties(imgData);
                const scale = Math.min(w / props.width, h / props.height);
                const newW = props.width * scale;
                const newH = props.height * scale;
                const newX = x + (w - newW) / 2;
                const newY = y + (h - newH) / 2;
                const format = imgData.substring('data:image/'.length, imgData.indexOf(';')).toUpperCase();
                doc.addImage(imgData, format, newX, newY, newW, newH, undefined, 'FAST');
            } catch (e) {
                const format = imgData.substring('data:image/'.length, imgData.indexOf(';')).toUpperCase();
                doc.addImage(imgData, format, x, y, w, h, undefined, 'FAST');
            }
        };
        // Info
        const tlX = margin;
        const tlY = margin;
        drawBoxTitle('기본 정보', tlX, tlY, boxWidth);
        doc.setFontSize(11);
        const infoX = tlX + 10;
        let infoY = tlY + 25;
        const lineH = 12;
        doc.text(`성       명: ${data.name}`, infoX, infoY); infoY += lineH;
        doc.text(`주민등록번호: ${data.residentId}`, infoX, infoY); infoY += lineH;
        doc.text(`연 락 처: ${data.phoneNumber || data.address || '-'}`, infoX, infoY); infoY += lineH;
        doc.text(`은 행 명: ${data.bankName}`, infoX, infoY); infoY += lineH;
        doc.text(`계좌번호: ${data.accountNumber}`, infoX, infoY);
        const idCardData = await processImage(data.idCardImage);
        const bankBookData = await processImage(data.bankBookImage);
        const licenseData = await processImage(data.licenseImage);
        // ID Card
        const trX = midX + margin / 2;
        const trY = margin;
        drawBoxTitle('신분증', trX, trY, boxWidth);
        if (data.idCardImage && idCardData) drawImageProp(idCardData, trX + 5, trY + 15, boxWidth - 10, boxHeight - 20);
        // Bank Book
        const blX = margin;
        const blY = midY + margin / 2;
        drawBoxTitle('통장사본', blX, blY, boxWidth);
        if (data.bankBookImage && bankBookData) drawImageProp(bankBookData, blX + 5, blY + 15, boxWidth - 10, boxHeight - 20);
        // License
        const brX = midX + margin / 2;
        const brY = midY + margin / 2;
        drawBoxTitle('자격증', brX, brY, boxWidth);
        if (data.licenseImage && licenseData) drawImageProp(licenseData, brX + 5, brY + 15, boxWidth - 10, boxHeight - 20);
    }
    savePdf(doc, `전체_증빙자료_${new Date().toLocaleDateString()}.pdf`);
};
