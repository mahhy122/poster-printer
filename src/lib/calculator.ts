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
export const calcilateLeyout = (
  imgWidth: number,
  imgHeight: number,
  cols: number,
  paperKey: keyof typeof PAPER_SIZES
) => {
  const paper = PAPER_SIZES[paperKey];
  //用紙の縦横比
  const paperRatio = paper.height / paper.width;
  //画像上での1ページ当たりの横幅(px)
  const pieceWidthPx = paper.width / cols;
  //画像上での1ページ当たりの高さ(px)
  const pieceHeightPx = pieceWidthPx * paperRatio;
  //画像の高さを1ページ当たりの高さで割って、必要な行数を計算
  const rows = Math.ceil(imgHeight / pieceHeightPx);
  return { 
    rows,
    pieceWidthPx,
    pieceHeightPx,
    paperWidthMm: paper.width,
    paperHeightMm: paper.height
  };
}