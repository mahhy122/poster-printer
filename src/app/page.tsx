'use client';

import { useState, useRef, useEffect } from 'react';
import { calculateLayout, PAPER_SIZES } from '@/lib/calculator';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4');
  const [cols, setCols] = useState(2);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // レイアウト計算の実行
  const layout = imgSize.width > 0 
    ? calculateLayout(imgSize.width, imgSize.height, cols, paperSize)
    : { rows: 0 };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      
      // 画像の元サイズを取得
      const img = new Image();
      img.onload = () => {
        setImgSize({ width: img.width, height: img.height });
      };
      img.src = url;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー（前回の実装を維持） */}
      <aside className="w-80 bg-white shadow-xl p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">ポスター印刷設定</h1>
        <div className="space-y-6">
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-blue-600 text-white rounded-lg">
            画像を選択
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          
          <div>
            <label className="text-sm font-bold block mb-2">用紙サイズ</label>
            <select value={paperSize} onChange={(e) => setPaperSize(e.target.value as any)} className="w-full border p-2 rounded">
              <option value="A4">A4</option>
              <option value="A3">A3</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">横の分割数: {cols}枚</label>
            <input type="range" min="1" max="5" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="w-full" />
          </div>
        </div>
        
        <div className="mt-auto p-4 bg-blue-50 rounded-lg text-xs text-blue-800">
          構成: 横{cols}枚 × 縦{layout.rows}枚<br/>
          合計枚数: {cols * (layout.rows || 0)}枚
        </div>
      </aside>

      {/* メインプレビュー */}
      <main className="flex-1 flex items-center justify-center p-12 overflow-auto">
        {image ? (
          <div className="relative shadow-2xl border-8 border-white bg-white">
            <img src={image} alt="Preview" className="max-h-[70vh] w-auto block" />
            
            {/* グリッド線オーバーレイ */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* 縦線 */}
              {[...Array(cols - 1)].map((_, i) => (
                <div 
                  key={`v-${i}`} 
                  className="absolute h-full border-l border-dashed border-red-500/50"
                  style={{ left: `${(100 / cols) * (i + 1)}%` }}
                />
              ))}
              {/* 横線 */}
              {layout.rows && layout.rows > 1 && [...Array(layout.rows - 1)].map((_, i) => (
                <div 
                  key={`h-${i}`} 
                  className="absolute w-full border-t border-dashed border-red-500/50"
                  style={{ top: `${(100 / layout.rows!) * (i + 1)}%` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">画像を選択してください</p>
        )}
      </main>
    </div>
  );
}