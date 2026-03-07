export const PAPER_SIZES = {
  A4: { name: "A4", width: 210, height: 297 },
  A3: { name: "A3", width: 297, height: 420 },
  A2: { name: "A2", width: 420, height: 594 }
};

export const MARGIN_MM = 10; // 用紙の余白(mm)

export const calculateLayoutByTarget = (
  imgWidth: number,
  imgHeight: number,
  targetWidthMm: number, // ユーザーが指定する「完成時の横幅」
  paperKey: keyof typeof PAPER_SIZES,
  paperOrientation: "portrait" | "landscape" = "portrait"
) => {
  const basePaper = PAPER_SIZES[paperKey];
  
  const paper = {
    width: paperOrientation === "landscape" ? basePaper.width : basePaper.height,
    height: paperOrientation === "landscape" ? basePaper.height : basePaper.width,
  }
  
  const printableWidthMm = paper.width - (MARGIN_MM * 2);
  const printableHeightMm = paper.height - (MARGIN_MM * 2);

  // 1. 指定サイズを実現するために横に何枚必要か
  const cols = Math.max(1, Math.ceil(targetWidthMm / printableWidthMm));

  // 2. 画像の比率から完成時の「縦幅」を算出
  const imgAspectRatio = imgHeight / imgWidth;
  const targetHeightMm = targetWidthMm * imgAspectRatio;

  // 3. その縦幅をカバーするために縦に何枚必要か
  const rows = Math.max(1, Math.ceil(targetHeightMm / printableHeightMm));

  // 4. プレビュー表示用の比率計算
  const pieceWidthPx = imgWidth / (targetWidthMm / printableWidthMm);
  const pieceHeightPx = pieceWidthPx * (printableHeightMm / printableWidthMm);

  return {
    cols,
    rows,
    targetHeightMm,
    pieceWidthPx,
    pieceHeightPx,
    printableWidthMm,
    printableHeightMm,
    paperWidthMm: paper.width,   
    paperHeightMm: paper.height,
    totalPaperCount: cols * rows
  };
};