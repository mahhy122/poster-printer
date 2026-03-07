'use client';

import { useState, useRef } from 'react';

const PAPER_SIZES = {
  A4: { name: "A4", width: 210, height: 297 },
  A3: { name: "A3", width: 297, height: 420 },
  A2: { name: "A2", width: 420, height: 594 }
};

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [paperSize, setPaperSize] = useState<string>("A4");
  const [cols,setCols] = useState(2); //横に何枚並べるか

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* --- 左側：操作パネル --- */}
      <aside className="w-80 bg-white shadow-xl z-10 flex flex-col p-6 overflow-y-auto">
        <h1 className="text-xl font-bold mb-8 border-b pb-4">ポスター印刷設定</h1>

        <div className="space-y-6 flex-1">
          {/* 画像選択ボタン */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">1. 画像の準備</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <button
              onClick={handleButtonClick}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              {image ? '画像を貼り替える' : '画像を選択する'}
            </button>
          </div>

          {/* 用紙設定 */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">2. 用紙サイズ</label>
            <select 
              value={paperSize} 
              onChange={(e) => setPaperSize(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 outline-none transition-colors"
            >
              <option value="A4">A4 (210x297mm)</option>
              <option value="A3">A3 (297x420mm)</option>
            </select>
          </div>

          {/* 分割数設定 */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">3. 横の分割枚数</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min="1" 
                max="10"
                value={cols} 
                onChange={(e) => setCols(Number(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 outline-none"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">枚</span>
            </div>
          </div>
        </div>

        {/* 実行ボタン（下部に配置） */}
        <button
          disabled={!image}
          className="mt-8 w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
        >
          PDFを生成して保存
        </button>
      </aside>

      {/* --- 右側：メインプレビューエリア --- */}
      <main className="flex-1 overflow-auto flex items-center justify-center p-12">
        {image ? (
          <div className="relative group">
            <div className="absolute -top-8 left-0 text-xs text-gray-400 font-mono">
              PREVIEW MODE: {paperSize} x {cols}
            </div>
            <img 
              src={image} 
              alt="Preview" 
              className="max-h-[80vh] w-auto shadow-2xl rounded-sm border-4 border-white" 
            />
            {/* ここに分割線のオーバーレイを後で追加できます */}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-lg">画像を選択するとここにプレビューが表示されます</p>
          </div>
        )}
      </main>
    </div>
  );
}