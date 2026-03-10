import { jsPDF } from 'jspdf';
import { MARGIN_MM } from './calculator';

export const generatePosterPdf = async (
  imageUrl: string,
  layout: {
    cols: number;
    rows: number;
    pieceWidthPx: number;
    pieceHeightPx: number;
    paperWidthMm: number;
    paperHeightMm: number;
    printableWidthMm: number;
    printableHeightMm: number;
  }
) => {
  // 1. 画面上のプレビュー画像要素を直接取得
  // page.tsx の <img> タグにある alt="Preview" を目印にします
  const previewImg = document.querySelector('img[alt="Preview"]') as HTMLImageElement;
  
  if (!previewImg || !previewImg.complete) {
    throw new Error("プレビュー画像の読み込みが完了していません。");
  }

  const pdf = new jsPDF({
    orientation: layout.paperWidthMm > layout.paperHeightMm ? 'l' : 'p',
    unit: 'mm',
    format: [layout.paperWidthMm, layout.paperHeightMm],
  });

  const canvas = document.createElement('canvas');
  canvas.width = layout.pieceWidthPx;
  canvas.height = layout.pieceHeightPx;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Canvasの初期化に失敗しました");

  for (let r = 0; r < layout.rows; r++) {
    for (let c = 0; c < layout.cols; c++) {
      if (r > 0 || c > 0) pdf.addPage();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // すでに読み込まれている要素から直接描画（読み込み待機が不要）
      ctx.drawImage(
        previewImg,
        c * layout.pieceWidthPx, r * layout.pieceHeightPx,
        layout.pieceWidthPx, layout.pieceHeightPx,
        0, 0,
        layout.pieceWidthPx, layout.pieceHeightPx
      );

      // メモリ節約のため JPEG で書き出し
      const pageImageData = canvas.toDataURL('image/jpeg', 1.0);

      pdf.addImage(
        pageImageData,
        'JPEG',
        MARGIN_MM,
        MARGIN_MM,
        layout.printableWidthMm,
        layout.printableHeightMm
      );

      // 番号付け
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`${r + 1}-${c + 1}`, layout.paperWidthMm - 10, layout.paperHeightMm - 5);
    }
  }

  pdf.save('poster-layout.pdf');
};