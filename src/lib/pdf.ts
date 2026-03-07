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
  // 1. 画像を読み込む
  const img = new Image();
  img.src = imageUrl;
  await new Promise((resolve) => (img.onload = resolve));

  // 2. PDFの初期化（用紙サイズと方向を設定）
  const pdf = new jsPDF({
    orientation: layout.paperWidthMm > layout.paperHeightMm ? 'l' : 'p',
    unit: 'mm',
    format: [layout.paperWidthMm, layout.paperHeightMm],
  });

  // 3. 各ページをループして画像を切り出す
  for (let r = 0; r < layout.rows; r++) {
    for (let c = 0; c < layout.cols; c++) {
      if (r > 0 || c > 0) pdf.addPage();

      // 目に見えない作業用キャンバスを作成
      const canvas = document.createElement('canvas');
      canvas.width = layout.pieceWidthPx;
      canvas.height = layout.pieceHeightPx;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // 画像の特定の範囲（(c, r)の位置のピース）をキャンバスに描画
        ctx.drawImage(
          img,
          c * layout.pieceWidthPx, r * layout.pieceHeightPx, // 元画像の切り出し開始位置
          layout.pieceWidthPx, layout.pieceHeightPx,         // 切り出す幅と高さ
          0, 0,                                             // キャンバス上の描画位置
          layout.pieceWidthPx, layout.pieceHeightPx          // キャンバス上の描画サイズ
        );

        // キャンバスを画像データ(JPEG)に変換
        const pageImageData = canvas.toDataURL('image/jpeg', 0.95);

        // PDFの「のりしろ」の内側に画像を貼り付け
        pdf.addImage(
          pageImageData,
          'JPEG',
          MARGIN_MM, // 左余白
          MARGIN_MM, // 上余白
          layout.printableWidthMm,
          layout.printableHeightMm
        );

        // (オプション) ページの隅に「何行目の何列目か」の番号を入れると組み立てが楽になります
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`${r + 1}-${c + 1}`, layout.paperWidthMm - 10, layout.paperHeightMm - 5);
      }
    }
  }

  // 4. 保存
  pdf.save('poster-layout.pdf');
};