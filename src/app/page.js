'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [collection, setCollection] = useState([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const inputRef = useRef(null);

  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handleGoHome = () => {
    setQuery('');
    setHasSearched(false);
    setShowCollection(false);
    setResults([]);
  };

  const handleShowCollection = async () => {
    setQuery('');
    setHasSearched(false);
    setShowCollection(true);
    if (collection.length === 0) {
      setLoadingCollection(true);
      try {
        const res = await fetch('/api/koleksi');
        const data = await res.json();
        setCollection(data);
      } catch (err) {
        console.error('Failed to fetch collection:', err);
      } finally {
        setLoadingCollection(false);
      }
    }
  };

  const handleSearch = (val) => {
    setQuery(val);
    if (showCollection) setShowCollection(false);
    
    if (val.length < 3) {
      setResults([]);
      return;
    }

    if (!hasSearched) setHasSearched(true);
    setLoading(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`, {
          signal: abortControllerRef.current.signal
        });
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search failed:', err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-emerald-100 text-emerald-900 px-0.5 rounded font-medium">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <main className={`min-h-screen bg-[#F8FAFC] text-slate-800 transition-all duration-700 ease-in-out font-inter relative`}>
      
      {/* Top Right Floating Button */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={showCollection ? handleGoHome : handleShowCollection}
          className="px-5 py-2.5 bg-white text-emerald-700 font-bold rounded-full text-sm hover:bg-emerald-50 transition-all shadow-sm border border-slate-200 hover:border-emerald-200 flex items-center gap-2"
        >
          {showCollection ? '🔍 Kembali Pencarian' : '📚 Koleksi Lengkap'}
        </button>
      </div>

      {/* Header / Search Section */}
      <div className={`flex flex-col items-center justify-center transition-all duration-700 px-6 ${
        (hasSearched || showCollection) ? 'py-8 bg-white border-b sticky top-0 z-10 shadow-sm' : 'min-h-[70vh] bg-transparent'
      }`}>
        <div className={`transition-all duration-700 max-w-3xl w-full ${(hasSearched || showCollection) ? 'flex flex-row items-center gap-6' : 'text-center'}`}>
          
          <div className={`transition-all duration-700 flex-shrink-0 ${(hasSearched || showCollection) ? 'w-auto' : 'mb-8'}`}>
            <h1 
              onClick={handleGoHome}
              className={`font-playfair font-bold text-teal-950 transition-all duration-700 cursor-pointer hover:text-emerald-700 ${
              (hasSearched || showCollection) ? 'text-2xl whitespace-nowrap' : 'text-5xl md:text-7xl mb-4'
            }`}>
              Brosur MTA
            </h1>
            {(!hasSearched && !showCollection) && (
              <p className="text-slate-500 text-lg md:text-xl font-light">
                Cari dalil dan kajian dalam koleksi brosur resmi.
              </p>
            )}
          </div>

          <div className={`relative transition-all duration-700 w-full`}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Ketik topik atau pasalnya..."
              className={`w-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white border rounded-full shadow-sm hover:shadow-md ${
                hasSearched ? 'py-3 px-6 border-slate-200' : 'py-5 px-8 text-xl border-slate-200'
              }`}
            />
            {loading && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
              </div>
            )}
            {!hasSearched && !showCollection && (
              <div className="mt-6 flex gap-2 justify-center flex-wrap">
                {['Thaharah', 'Puasa Sunnah', 'Zakat Fitrah', 'Shalat Ied'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => handleSearch(tag)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`max-w-3xl mx-auto px-6 transition-all duration-700 ${(hasSearched || showCollection) ? 'py-10 opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        
        {showCollection ? (
          <div className="animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl md:text-3xl font-playfair font-bold text-teal-950">Koleksi Lengkap PDF</h2>
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 self-start sm:self-auto">
                {collection.length} Brosur Tersedia
              </span>
            </div>
            
            {loadingCollection ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {collection.map((item, idx) => (
                  <a 
                    key={idx}
                    href={`/pdfs/${item.source}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform duration-500 opacity-50"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 relative z-10">
                      Edisi {item.date}
                    </span>
                    <h3 className="font-semibold text-slate-800 group-hover:text-teal-900 transition-colors leading-relaxed relative z-10 text-sm md:text-base">
                      {item.title}
                    </h3>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <div className="text-sm text-slate-400 mb-6 flex items-center gap-2">
              <span>Menampilkan {results.length} hasil relevan</span>
              <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
              <span className="text-emerald-600 font-medium tracking-tight">Koleksi Pilot</span>
            </div>

            {results.map((result) => (
              <div key={result.id} className="group flex flex-col gap-3 pb-8 border-b border-slate-100 last:border-0 hover:opacity-90 transition-opacity">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded leading-none">
                      {result.date}
                    </span>
                    <h3 className="font-playfair text-lg font-black uppercase tracking-wider text-teal-950 group-hover:text-emerald-700 transition-colors">
                      {result.title}
                    </h3>
                </div>
                <div className="text-[15px] leading-[1.7] text-slate-600 font-light text-justify">
                  {highlightText(result.text, query)}
                </div>
                <div className="flex gap-4 mt-1">
                    <a 
                      href={`/pdfs/${result.source}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter hover:text-emerald-600 transition-colors"
                    >
                        Buka File PDF
                    </a>
                </div>
              </div>
            ))}
          </div>
        ) : query.length >= 3 && !loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-lg">Maaf, kata kunci &quot;{query}&quot; tidak ditemukan.</p>
          </div>
        ) : null}
      </div>

    </main>
  );
}
