/**
 * 画像の分割サイズを計算する
 * @param imgWidth 画像の横幅(px)
 * @param imgHeight 画像の高さ(px)
 * @param cols 横の分割数
 * @returns 1枚あたりの幅、高さ、および縦の分割数
 */

export const calculateGrid = (
  imgWidth: number, 
  imgHeght: number, 
  cols: number
) =>{
  const piceWidth = imgWidth /cols;
  const piceHeight = piceWidth * (imgHeght / imgWidth);
  const rows = Math.ceil(imgHeght / piceHeight); 
  return {piceWidth, piceHeight, rows};
}    