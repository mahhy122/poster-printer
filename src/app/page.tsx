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
    if(!image) return;
    const img = new Image();
    img.src = image;
    await new Promise((resolve) => {img.onload = resolve;});
    
    const canvas = document.createElement('canvas');
    canvas.width = img.height;
    canvas.height = img.width;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    canvas.toBlob((blob) =>{
      if (blob) {
        const rotatedUrl = URL.createObjectURL(blob);
        setImage(rotatedUrl);
        setImgSize({ width: canvas.width, height: canvas.height });
      }
    }, 'image/jpeg', 1.0);
  };

  const handleDownload = async () => {
    console.log("DEBUG: ボタンがクリックされました");
    console.log("DEBUG: imageの状態 =", !!image);
    console.log("DEBUG: layoutの状態 =", layout);
    if (!image || !layout) {
      alert("画像を選択してください");
      return;
    }
    console.log("PDF生成を開始します..."); 
    try {
      await generatePosterPdf(image, layout as any);
      console.log("PDF生成が完了しました");
    } catch (error) {
      console.error("PDF生成エラー:", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="w-90 bg-white shadow-2xl p-6 flex flex-col z-20 overflow-y-auto">
        <h1 className="text-2xl font-black mb-8 tracking-tight text-blue-600">POSTER MAKER</h1>
        
        <div className="space-y-6 grow">
          <section>
            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">1. Source Image</label>
            <div className="flex gap-2">
              <button 
                onClick={handleButtonClick}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-all border-2 border-dashed border-slate-300"
              >
                {image ? '画像を入れ替える' : '画像を選択'}
              </button>
              <button
                onClick={rotateImage}
                disabled={!image}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition-all border-2 border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="90度回転"
              >
                ↻ 回転
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </section>

          <section>
            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">2. Target Width (mm)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={targetWidthMm}
                onChange={(e) => setTargetWidthMm(Number(e.target.value))}
                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg p-3 font-mono text-lg focus:border-blue-500 outline-none"
              />
              <span className="font-bold text-slate-500">mm</span>
            </div>
          </section>

          <section>
            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">3. Print Paper & Orientation</label>
            <div className="flex gap-2">
              <select 
                value={paperSize} 
                onChange={(e) => setPaperSize(e.target.value as any)}
                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg p-3 font-semibold focus:border-blue-500 outline-none"
              >
                {Object.keys(PAPER_SIZES).map(key => (
                  <option key={key} value={key}>{key} Paper</option>
                ))}
              </select>
              <select 
                value={paperOrientation} 
                onChange={(e) => setPaperOrientation(e.target.value as any)}
                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg p-3 font-semibold focus:border-blue-500 outline-none"
              >
                <option value="portrait">縦 (Portrait)</option>
                <option value="landscape">横 (Landscape)</option>
              </select>
            </div>
          </section>

          {layout && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 italic">
              <h3 className="text-blue-800 font-bold text-sm mb-2">出力プレビュー情報</h3>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <span className="text-blue-600/70">完成高さ:</span>
                <span className="font-mono font-bold">{(layout.targetHeightMm / 10).toFixed(1)} cm</span>
                <span className="text-blue-600/70">必要枚数:</span>
                <span className="font-mono font-bold">{layout.totalPaperCount} 枚</span>
                <span className="text-blue-600/70">レイアウト:</span>
                <span className="font-mono font-bold">{layout.cols}列 × {layout.rows}行</span>
              </div>
            </div>
          )}
        </div>

        <button 
          disabled={!image}
          onClick={handleDownload}
          className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
        >
          PDFを書き出す
        </button>
      </aside>

      {/* メインエリア */}
      <main className="flex-1 bg-slate-100 flex items-center justify-center p-16 overflow-auto">
        {image && layout ? (
          <div className="relative shadow-[0_20px_50px_rgba(8,112,184,0.1)] bg-white p-1 border-4 border-white transition-all duration-300">
            <img src={image} alt="Preview" className="max-h-[75vh] w-auto block opacity-90" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(layout.cols)].map((_, i) => {
                // 用紙の幅が、ターゲット全体幅の何%にあたるかを計算
                const leftPercent = ((layout.printableWidthMm * (i + 1)) / targetWidthMm) * 100;
                // 100%（画像の右端）を超える線は描画しない
                if (leftPercent >= 100) return null;
                return (
                  <div 
                    key={`v-${i}`} 
                    className="absolute h-full border-l-2 border-blue-500/60 border-dashed" 
                    style={{ left: `${leftPercent}%` }} 
                  />
                );
              })}
              {[...Array(layout.rows)].map((_, i) => {
                // 用紙の高さが、ターゲット全体高さの何%にあたるかを計算
                const topPercent = ((layout.printableHeightMm * (i + 1)) / layout.targetHeightMm) * 100;
                // 100%（画像の下端）を超える線は描画しない
                if (topPercent >= 100) return null;
                return (
                  <div 
                    key={`h-${i}`} 
                    className="absolute w-full border-t-2 border-blue-500/60 border-dashed" 
                    style={{ top: `${topPercent}%` }} 
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-slate-400">🖼️</span>
            </div>
            <p className="text-slate-400 font-medium">画像を選択するとプレビューが表示されます</p>
          </div>
        )}
      </main>
    </div>
  );
}