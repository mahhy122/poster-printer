'use client';

import { useState, useRef } from 'react';
import { calculateLayoutByTarget, PAPER_SIZES } from '@/lib/calculator';
import { generatePosterPdf } from '@/lib/pdf';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'A2'>('A4');
  const [paperOrientation, setPaperOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [targetWidthMm, setTargetWidthMm] = useState(500);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const layout = imgSize.width > 0 
    ? calculateLayoutByTarget(imgSize.width, imgSize.height, targetWidthMm, paperSize, paperOrientation)
    : null;

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      
      const img = new Image();
      img.onload = () => {
        setImgSize({ width: img.width, height: img.height });
      };
      img.src = url;
    }
  };

  const rotateImage = async () => {
    if (!image) return;
    const img = new Image();
    img.src = image;
    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = img.height;
    canvas.height = img.width;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setImage(url);
        setImgSize({ width: canvas.width, height: canvas.height });
      }
    }, 'image/jpeg', 1.0);
  };

  const handleDownload = async () => {
    if (!image || !layout) {
      alert("画像を選択してください");
      return;
    }
    try {
      await generatePosterPdf(image, layout as any);
    } catch (error) {
      alert("PDFの作成中にエラーが発生しました。");
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans">
      {/* サイドバー */}
      <aside className="w-95 bg-white shadow-xl p-6 flex flex-col z-20 overflow-y-auto border-r border-slate-200">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-blue-600 flex items-center gap-2">
            <span className="text-3xl">🖨️</span> ポスターメーカー
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium">手持ちの画像を分割して、巨大ポスターを印刷</p>
        </div>
        
        <div className="space-y-8 grow">
          
          {/* STEP 1: 画像選択 */}
          <section>
            <label className="flex items-center gap-2 font-bold text-slate-700 mb-3">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
              ポスターにする画像
            </label>
            <div className="flex gap-2">
              <button 
                onClick={handleButtonClick}
                className="flex-1 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-bold transition-all border-2 border-blue-200"
              >
                {image ? '画像を入れ替える' : '画像を選ぶ'}
              </button>
              <button
                onClick={rotateImage}
                disabled={!image}
                className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-bold transition-all border-2 border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="90度回転"
              >
                ↻ 回転
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </section>

          {/* STEP 2: サイズ指定 */}
          <section>
            <label className="flex items-center gap-2 font-bold text-slate-700 mb-3">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
              完成時のサイズ（横幅）
            </label>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  value={targetWidthMm}
                  onChange={(e) => setTargetWidthMm(Number(e.target.value))}
                  className="flex-1 bg-white border-2 border-slate-300 rounded-lg p-3 font-mono text-xl text-right focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                <span className="font-bold text-slate-500 w-8">mm</span>
              </div>
              <p className="text-right text-xs text-slate-500 font-medium pr-10">
                （＝ {targetWidthMm / 10} cm）
              </p>
            </div>
          </section>

          {/* STEP 3: 用紙設定 */}
          <section>
            <label className="flex items-center gap-2 font-bold text-slate-700 mb-3">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
              家のプリンターの用紙
            </label>
            <div className="flex gap-2">
              <select 
                value={paperSize} 
                onChange={(e) => setPaperSize(e.target.value as any)}
                className="flex-1 bg-white border-2 border-slate-300 rounded-lg p-3 font-semibold focus:border-blue-500 outline-none cursor-pointer"
              >
                {Object.keys(PAPER_SIZES).map(key => (
                  <option key={key} value={key}>{key} サイズ</option>
                ))}
              </select>
              <select 
                value={paperOrientation} 
                onChange={(e) => setPaperOrientation(e.target.value as any)}
                className="flex-1 bg-white border-2 border-slate-300 rounded-lg p-3 font-semibold focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="portrait">縦向き</option>
                <option value="landscape">横向き</option>
              </select>
            </div>
          </section>

          {/* 出力結果プレビュー */}
          {layout && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h3 className="text-slate-700 font-bold text-sm mb-3 flex items-center gap-1">
                <span>📋</span> 仕上がり予定
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-500">完成サイズ:</span>
                <span className="font-bold text-slate-800 text-right">
                  横{(targetWidthMm / 10).toFixed(1)} × 縦{(layout.targetHeightMm / 10).toFixed(1)} cm
                </span>
                
                <span className="text-slate-500">印刷する枚数:</span>
                <span className="font-bold text-blue-600 text-right text-lg">
                  計 {layout.totalPaperCount} 枚
                </span>
                
                <span className="text-slate-500">貼り合わせ:</span>
                <span className="font-bold text-slate-800 text-right">
                  横 {layout.cols}枚 × 縦 {layout.rows}枚
                </span>
              </div>
            </div>
          )}
        </div>

        <button 
          disabled={!image}
          onClick={handleDownload}
          className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none flex justify-center items-center gap-2"
        >
          {image ? '📄 PDFをダウンロード' : 'まずは画像を選んでください'}
        </button>
      </aside>

      {/* メインエリア（プレビュー） */}
      <main className="flex-1 bg-slate-200/50 flex items-center justify-center p-12 overflow-auto relative">
        {image && layout ? (
          <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white p-2 border border-slate-200 transition-all duration-300">
            <img src={image} alt="Preview" className="max-h-[80vh] w-auto block opacity-95" />
            
            {/* 分割線 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden m-2">
              {[...Array(layout.cols)].map((_, i) => {
                const leftPercent = ((layout.printableWidthMm * (i + 1)) / targetWidthMm) * 100;
                if (leftPercent >= 100) return null;
                return (
                  <div 
                    key={`v-${i}`} 
                    className="absolute h-full border-l-2 border-blue-500/80 border-dashed drop-shadow-md" 
                    style={{ left: `${leftPercent}%` }} 
                  />
                );
              })}
              {[...Array(layout.rows)].map((_, i) => {
                const topPercent = ((layout.printableHeightMm * (i + 1)) / layout.targetHeightMm) * 100;
                if (topPercent >= 100) return null;
                return (
                  <div 
                    key={`h-${i}`} 
                    className="absolute w-full border-t-2 border-blue-500/80 border-dashed drop-shadow-md" 
                    style={{ top: `${topPercent}%` }} 
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center">
            <div className="w-32 h-32 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
              <span className="text-6xl">🖼️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-600 mb-2">プレビューエリア</h2>
            <p className="text-slate-500 font-medium">左側のメニューから画像を選ぶと、<br/>ここに分割のイメージが表示されます。</p>
          </div>
        )}
      </main>
    </div>
  );
}