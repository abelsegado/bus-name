
import React, { useState, useCallback, useMemo } from 'react';
import { 
  BusFront, 
  RotateCcw, 
  Trophy, 
  XCircle, 
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Play,
  ArrowUpCircle,
  ArrowDownCircle,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { GameDirection, RouteData, GameStatus } from './types';
import { BUS_ROUTES } from './routes';

const App: React.FC = () => {
  // We track the Base Line ID (e.g., "1") and the Direction separately
  const [selectedBaseId, setSelectedBaseId] = useState<string>("1");
  const [direction, setDirection] = useState<GameDirection>('ida');
  
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('setup');
  const [shake, setShake] = useState(false);

  // Get unique lines based on the prefix before the hyphen
  const uniqueLines = useMemo(() => {
    const linesMap = new Map<string, string>();
    BUS_ROUTES.forEach(r => {
      const baseId = r.id.split('-')[0];
      if (!linesMap.has(baseId)) {
        linesMap.set(baseId, r.name);
      }
    });
    return Array.from(linesMap.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  // Find the exact route object for the current selection
  const currentRoute = useMemo(() => {
    const targetId = `${selectedBaseId}-${direction}`;
    return BUS_ROUTES.find(r => r.id === targetId) || BUS_ROUTES.find(r => r.id.startsWith(selectedBaseId)) || BUS_ROUTES[0];
  }, [selectedBaseId, direction]);

  const targetOrder = useMemo(() => {
    return currentRoute.stops;
  }, [currentRoute]);

  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startNewGame = useCallback(() => {
    setSelectedStops([]);
    setShuffledOptions(shuffleArray(targetOrder));
    setGameStatus('playing');
    setShake(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [targetOrder]);

  const handleStopClick = (stopName: string) => {
    if (gameStatus !== 'playing') return;

    const nextIndex = selectedStops.length;
    if (stopName === targetOrder[nextIndex]) {
      const newSelected = [...selectedStops, stopName];
      setSelectedStops(newSelected);
      setShuffledOptions(prev => prev.filter(s => s !== stopName));

      if (newSelected.length === targetOrder.length) {
        setGameStatus('success');
      }
    } else {
      setShake(true);
      setGameStatus('failed');
      setTimeout(() => {
        startNewGame();
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-indigo-700 border-b-4 border-indigo-900 p-6 shadow-xl mb-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-2xl shadow-inner">
              <BusFront className="w-8 h-8 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">Bus Master</h1>
              <p className="text-xs font-bold text-indigo-200 opacity-80 uppercase tracking-widest mt-1">Crono-Ruta Profesional</p>
            </div>
          </div>
          
          {gameStatus === 'playing' && (
             <div className="hidden sm:flex items-center gap-3 bg-indigo-800/50 px-4 py-2 rounded-xl border border-indigo-400/30">
                <div className="text-right">
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">En Trayecto</p>
                  <p className="text-white font-bold text-sm truncate max-w-[200px]">{currentRoute.name}</p>
                </div>
                <div className={`p-2 rounded-lg ${direction === 'ida' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                  {direction === 'ida' ? <ArrowUpCircle className="w-5 h-5 text-white" /> : <ArrowDownCircle className="w-5 h-5 text-white" />}
                </div>
             </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {gameStatus === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List of Routes */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Selecciona la Línea</h2>
              <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {uniqueLines.map(line => (
                  <button
                    key={line.id}
                    onClick={() => setSelectedBaseId(line.id)}
                    className={`w-full text-left p-5 rounded-3xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ${selectedBaseId === line.id ? 'bg-white border-indigo-600 shadow-xl ring-4 ring-indigo-50' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black">LÍNEA {line.id}</span>
                      </div>
                      <span className={`font-black text-sm leading-tight block ${selectedBaseId === line.id ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {line.name}
                      </span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform relative z-10 ${selectedBaseId === line.id ? 'translate-x-1 text-indigo-600' : 'opacity-0 group-hover:opacity-100 text-slate-300'}`} />
                    {selectedBaseId === line.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* Direction Switch */}
              <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-lg">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Sentido del Trayecto</h3>
                <div className="flex p-1 bg-slate-100 rounded-2xl relative">
                  <button 
                    onClick={() => setDirection('ida')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all z-10 ${direction === 'ida' ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    IDA
                  </button>
                  <button 
                    onClick={() => setDirection('vuelta')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all z-10 ${direction === 'vuelta' ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    VUELTA
                  </button>
                  {/* Sliding Background Indicator */}
                  <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-md rounded-xl transition-all duration-300 ease-out ${direction === 'vuelta' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                  />
                </div>
              </div>
            </div>

            {/* Preview and Start */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border-2 border-slate-200 h-full flex flex-col sticky top-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl shadow-inner transition-colors ${direction === 'ida' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Estudio: {direction.toUpperCase()}</h2>
                      <p className="text-slate-500 font-bold text-sm">Línea {selectedBaseId} • {currentRoute.stops.length} Paradas</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-8 pr-4 custom-scrollbar max-h-[50vh] min-h-[300px]">
                  <div className="space-y-4">
                    {targetOrder.map((stop, idx) => (
                      <div key={`${currentRoute.id}-${idx}`} className="flex items-center gap-5 group animate-in slide-in-from-left duration-300">
                        <div className="relative flex flex-col items-center shrink-0">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-2xl font-black text-sm border-2 transition-all ${idx === 0 ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-100 shadow-lg' : idx === targetOrder.length -1 ? 'bg-rose-500 text-white border-rose-600 shadow-rose-100 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-200 group-hover:border-indigo-400 group-hover:text-indigo-600'}`}>
                            {idx + 1}
                          </div>
                          {idx < targetOrder.length - 1 && <div className="w-1 h-4 bg-slate-100" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black transition-colors ${idx === 0 || idx === targetOrder.length -1 ? 'text-slate-800' : 'text-slate-600 group-hover:text-indigo-600'}`}>
                            {stop}
                          </span>
                          {idx === 0 && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Salida Principal</span>}
                          {idx === targetOrder.length - 1 && <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Fin de Trayecto</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={startNewGame}
                  className={`w-full text-white py-6 rounded-3xl font-black text-xl uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 group ${direction === 'ida' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-orange-600 hover:bg-orange-500'}`}
                >
                  <Play className="fill-current w-6 h-6 group-hover:scale-110 transition-transform" />
                  Iniciar Entrenamiento
                </button>
              </div>
            </div>
          </div>
        )}

        {(gameStatus === 'playing' || gameStatus === 'success' || gameStatus === 'failed') && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
            {/* The Stacking Visual Section */}
            <div className="bg-white rounded-[3rem] shadow-2xl p-8 border-2 border-slate-200 overflow-hidden relative">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                      <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin-slow" /> Trayecto de {direction.toUpperCase()}
                    </h3>
                    <div className="flex items-center gap-3">
                      <p className="font-black text-xl text-slate-800 tracking-tighter">Línea {selectedBaseId}: {currentRoute.name}</p>
                    </div>
                  </div>
                  <div className="bg-slate-100 px-6 py-4 rounded-[2rem] font-black text-indigo-600 flex items-center gap-3 shadow-inner border border-slate-200">
                    <span className="text-3xl tabular-nums">{selectedStops.length}</span>
                    <div className="w-px h-8 bg-slate-300" />
                    <span className="text-slate-400 tabular-nums">{targetOrder.length}</span>
                  </div>
               </div>

              <div className={`flex flex-wrap gap-3 items-center min-h-[140px] p-6 bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 transition-all ${shake ? 'shake border-rose-500 border-solid bg-rose-50' : ''}`}>
                {selectedStops.length === 0 && (
                  <div className="flex flex-col items-center justify-center w-full py-8 text-slate-400 animate-pulse">
                    <MapPin className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-black uppercase text-xs tracking-[0.3em]">Pulsa la parada de salida</p>
                  </div>
                )}
                {selectedStops.map((stop, idx) => (
                  <div 
                    key={idx} 
                    className={`text-white pl-4 pr-6 py-4 rounded-2xl font-black text-sm shadow-lg animate-in zoom-in-75 duration-300 flex items-center gap-3 border-b-4 group ${direction === 'ida' ? 'bg-emerald-600 border-emerald-800' : 'bg-orange-600 border-orange-800'}`}
                  >
                     <span className="bg-white text-slate-800 w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black shadow-sm">
                      {idx + 1}
                     </span>
                     {stop}
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                <div className="bg-slate-100 h-6 rounded-full p-1 overflow-hidden border border-slate-200 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-lg ${selectedStops.length === targetOrder.length ? 'bg-indigo-500' : direction === 'ida' ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                    style={{ width: `${(selectedStops.length / targetOrder.length) * 100}%` }}
                  >
                    <div className="w-full h-full bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {gameStatus === 'playing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px bg-slate-200 flex-1" />
                  <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Paradas Disponibles</h3>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shuffledOptions.map((stop) => (
                    <button
                      key={stop}
                      onClick={() => handleStopClick(stop)}
                      className="bg-white hover:bg-indigo-600 hover:text-white border-2 border-slate-200 hover:border-indigo-700 p-6 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center text-center font-black text-slate-700 min-h-[90px] group relative overflow-hidden"
                    >
                      <span className="relative z-10 group-hover:scale-105 transition-transform duration-200">{stop}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameStatus === 'success' && (
              <div className="bg-indigo-600 p-16 rounded-[4rem] text-center shadow-2xl animate-in zoom-in-90 duration-500 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
                <div className="relative z-10">
                  <div className="bg-white w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-12">
                    <Trophy className="w-14 h-14 text-indigo-600" />
                  </div>
                  <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">¡Ruta Completada!</h2>
                  <p className="text-indigo-100 mb-10 font-bold text-xl max-w-md mx-auto">Has demostrado un conocimiento perfecto de la Línea {selectedBaseId} en sentido {direction}.</p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button 
                      onClick={startNewGame}
                      className="bg-white text-indigo-600 px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95"
                    >
                      Reiniciar Reto
                    </button>
                    <button 
                      onClick={() => setGameStatus('setup')}
                      className="bg-indigo-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-950 transition-all shadow-xl active:scale-95"
                    >
                      Menu Principal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameStatus === 'failed' && (
              <div className="bg-rose-600 p-16 rounded-[4rem] text-center shadow-2xl text-white animate-in shake duration-500">
                <div className="bg-white/20 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-4 border-white/10">
                  <XCircle className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">¡Error de Ruta!</h2>
                <p className="text-rose-100 mb-10 font-bold text-xl italic opacity-90">"Un buen conductor nunca olvida sus paradas..."</p>
                <div className="flex items-center justify-center gap-4 bg-rose-900/40 py-5 px-10 rounded-3xl w-max mx-auto animate-pulse border border-white/10">
                   <RotateCcw className="w-6 h-6 animate-spin" />
                   <span className="font-black uppercase tracking-[0.3em] text-sm">Volviendo al inicio...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Persistent Navigation */}
      {gameStatus !== 'setup' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
          <button 
            onClick={() => setGameStatus('setup')}
            className="bg-slate-900 text-white px-8 py-5 rounded-[1.8rem] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3 font-black uppercase text-xs tracking-widest border-b-4 border-slate-950"
          >
            <ChevronLeft className="w-4 h-4" />
            Elegir otra Línea
          </button>
          <button 
            onClick={startNewGame}
            className="bg-white text-slate-900 px-8 py-5 rounded-[1.8rem] shadow-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-3 font-black uppercase text-xs tracking-widest border-2 border-slate-200 border-b-4"
          >
            <RotateCcw className="w-4 h-4" />
            Resetear
          </button>
        </div>
      )}

      {/* Global Styles for Scrollbar and Animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
          border: 2px solid #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes animate-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: animate-spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
