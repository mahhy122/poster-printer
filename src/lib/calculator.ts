/**
 * 画像の分割サイズを計算する
 * @param imgWidth 画像の横幅(px)
 * @param imgHeight 画像の高さ(px)
 * @param cols 横の分割数
 * @returns 1枚あたりの幅、高さ、および縦の分割数
 */

export const PAPER_SIZES = {
  A4: { name: "A4", width: 210, height: 297 },
  A3: { name: "A3", width: 297, height: 420 },
  A2: { name: "A2", width: 420, height: 594 }
};

export const MARGIN_MM = 10; // 用紙の余白(mm)

export const calculateLayout = (
  imgWidth: number,
  imgHeight: number,
  cols: number,
  paperKey: keyof typeof PAPER_SIZES
) => {
  const paper = PAPER_SIZES[paperKey];
  
  const printableWidthMm = paper.width -  (MARGIN_MM * 2); // 余白を引いた印刷可能幅
  const printableHeightMm = paper.height - (MARGIN_MM * 2); // 余白を引いた印刷可能高さ
  
  const pieceWidthPx = imgWidth / cols; // 1ページあたりの幅(mm)
  const pieceHeightPx = pieceWidthPx * (printableHeightMm / printableWidthMm);

  // 縦に何枚必要か
  const rows = Math.max(1, Math.ceil(imgHeight / pieceHeightPx));
  return { 
    rows: Math.max(1, rows), // 最低でも1枚
    pieceWidthPx,
    pieceHeightPx,
    paperWidthMm: paper.width,
    paperHeightMm: paper.height
  };
}