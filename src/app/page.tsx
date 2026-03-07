'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
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

  return(
    <main className="p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">ポスター印刷アプリ</h1>
      {/* 画像選択のUI */ }
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        />

      {/* 画像選択ボタン */ }
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        画像を選択
      </button>
      {/* 画像が選択された場合のプレビュー表示 */ }
      {image && (
        <div className="mt-8 border p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500 mb-2">プレビュー</p>
          <img src={image} alt="Preview" className="max-w-md h-auto shadow-lg" />
        </div>
      )}
    </main>
  );
}