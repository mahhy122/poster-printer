'use client';

import { useState, useRef } from 'react';
import { calculateLayoutByTarget, PAPER_SIZES, MARGIN_MM } from '@/lib/calculator';
import { generatePosterPdf } from '@/lib/pdf';


export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'A2'>('A4');
  const [targetWidthMm, setTargetWidthMm] = useState(500); // 初期値 50cm
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // レイアウト計算の実行
  const layout = imgSize.width > 0 
    ? calculateLayoutByTarget(imgSize.width, imgSize.height, targetWidthMm, paperSize)
    : null;

  const handleButtonClick = () => fileInputRef.current?.click();

  // エラーの原因となっていた関数を定義
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
  const handleDownload = async () => {
    console.log("DEBUG: ボタンがクリックされました");
    console.log("DEBUG: imageの状態 =", !!image);
    console.log("DEBUG: layoutの状態 =", layout);
    if (!image || !layout) {
      alert("画像を選択してください");
      return;
    }
    console.log("PDF生成を開始します..."); // 起動確認用
    try {
      await generatePosterPdf(image, layout as any);
      console.log("PDF生成が完了しました");
    } catch (error) {
      console.error("PDF生成エラー:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900">
      {/* サイドバー */}
      <aside className="w-80 bg-white shadow-2xl p-6 flex flex-col z-20">
        <h1 className="text-xl font-black mb-8 tracking-tight text-blue-600">POSTER MAKER</h1>
        
        <div className="space-y-8 grow"> {/* flex-grow を grow に修正 */}
          <section>
            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">1. Source Image</label>
            <button 
              onClick={handleButtonClick}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-all border-2 border-dashed border-slate-300"
            >
              {image ? '画像を入れ替える' : '画像を選択'}
            </button>
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
            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">3. Print Paper</label>
            <select 
              value={paperSize} 
              onChange={(e) => setPaperSize(e.target.value as any)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg p-3 font-semibold focus:border-blue-500 outline-none"
            >
              {Object.keys(PAPER_SIZES).map(key => (
                <option key={key} value={key}>{key} Paper</option>
              ))}
            </select>
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
          <div className="relative shadow-2xl bg-white p-1 border-4 border-white">
            <img src={image} alt="Preview" className="max-h-[75vh] w-auto block opacity-90" />
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(layout.cols - 1)].map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full border-l border-blue-400/50" style={{ left: `${(100 / layout.cols) * (i + 1)}%` }} />
              ))}
              {[...Array(layout.rows - 1)].map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full border-t border-blue-400/50" style={{ top: `${(100 / layout.rows) * (i + 1)}%` }} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-400">画像を選択してください</p>
        )}
      </main>
    </div>
  );
}