
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, ChevronLeft, ChevronRight, Info, AlertTriangle, CheckCircle2, Leaf, Factory, Wind, Save, Trash2, Edit3 } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { StudyNote } from '../types';

const StudyScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'studyNotes'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyNote[];
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !auth.currentUser) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'studyNotes'), {
        userId: auth.currentUser.uid,
        text: newNote,
        pageIndex: currentPage,
        timestamp: Date.now()
      });
      setNewNote('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'studyNotes', noteId));
    } catch (error) {
      console.error(error);
    }
  };

  const pages = [
    {
      title: "The Atmosphere: Our Life Support",
      icon: <Wind className="w-12 h-12 text-blue-500" />,
      bg: "bg-blue-50/50",
      image: "https://images.unsplash.com/photo-1534088568595-a066f7104218?auto=format&fit=crop&q=80&w=800",
      content: "The atmosphere is a thin layer of gases surrounding Earth. It provides the oxygen we breathe, protects us from solar radiation, and regulates our planet's temperature. Understanding its composition is the first step in environmental science.",
      details: [
        "Nitrogen (78%) and Oxygen (21%) are the primary components.",
        "Trace gases like CO2 play a massive role in climate regulation.",
        "The Ozone layer acts as a shield against UV rays."
      ]
    },
    {
      title: "Pollution: The Invisible Threat",
      icon: <Factory className="w-12 h-12 text-slate-600" />,
      bg: "bg-slate-100/50",
      image: "https://images.unsplash.com/photo-1590069230002-70cc2045de05?auto=format&fit=crop&q=80&w=800",
      content: "Air pollution consists of chemicals or particles in the atmosphere that pose serious health and environmental risks. It can be natural (volcanoes) or man-made (factories, vehicles).",
      details: [
        "PM2.5: Tiny particles that can enter the bloodstream.",
        "NO2: Primarily from vehicle emissions, causes respiratory issues.",
        "Smog: A mix of pollutants that reduces visibility and harms health."
      ]
    },
    {
      title: "The Cost of Progress",
      icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
      bg: "bg-amber-50/50",
      image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?auto=format&fit=crop&q=80&w=800",
      content: "Industrialization has brought prosperity but at a high environmental cost. We must weigh the advantages of energy production against the disadvantages of pollution.",
      advantages: [
        "Reliable energy for hospitals and homes.",
        "Economic growth and job creation.",
        "Technological advancement."
      ],
      disadvantages: [
        "Global warming and climate change.",
        "Respiratory diseases in urban populations.",
        "Acid rain and ecosystem destruction."
      ]
    },
    {
      title: "Restoration & Solutions",
      icon: <Leaf className="w-12 h-12 text-emerald-500" />,
      bg: "bg-emerald-50/50",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
      content: "The path forward involves transitioning to clean energy, improving efficiency, and active restoration of our ecosystems.",
      details: [
        "Renewable Energy: Solar, Wind, and Hydro power.",
        "Reforestation: Planting trees to sequester carbon.",
        "Policy: Stricter emission standards for industries."
      ]
    }
  ];

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % pages.length);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-none">Environmental Notes</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Research & Annotations</p>
        </div>
      </header>

      <div className="relative h-[65vh] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`absolute inset-0 ${pages[currentPage].bg} rounded-[3rem] p-8 shadow-2xl border border-white/50 flex flex-col items-center text-center backface-hidden overflow-hidden`}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img src={pages[currentPage].image} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm">
                {pages[currentPage].icon}
              </div>
              
              <h2 className="text-xl font-black text-slate-900 mb-4">{pages[currentPage].title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-8 font-medium">
                {pages[currentPage].content}
              </p>

              <div className="w-full space-y-3 text-left">
                {pages[currentPage].details?.map((detail, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white/40 backdrop-blur-sm p-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-slate-700">{detail}</p>
                  </div>
                ))}
                
                {pages[currentPage].advantages && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2 bg-emerald-50/50 p-3 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Advantages</p>
                      {pages[currentPage].advantages?.map((adv, i) => (
                        <p key={i} className="text-[9px] font-bold text-slate-500 leading-tight">• {adv}</p>
                      ))}
                    </div>
                    <div className="space-y-2 bg-rose-50/50 p-3 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Disadvantages</p>
                      {pages[currentPage].disadvantages?.map((dis, i) => (
                        <p key={i} className="text-[9px] font-bold text-slate-500 leading-tight">• {dis}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center items-center gap-8 mt-12">
        <button onClick={prevPage} className="p-4 bg-white rounded-full shadow-lg border border-slate-100 active:scale-90 transition-transform">
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <span className="text-sm font-black text-slate-400">
          {currentPage + 1} / {pages.length}
        </span>
        <button onClick={nextPage} className="p-4 bg-white rounded-full shadow-lg border border-slate-100 active:scale-90 transition-transform">
          <ChevronRight className="w-6 h-6 text-primary" />
        </button>
      </div>

      <div className="mt-12 space-y-6">
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest">Add Annotation</h3>
            </div>
            <button 
              onClick={handleSaveNote}
              disabled={!newNote.trim() || isSaving}
              className="p-2 bg-primary rounded-xl disabled:opacity-50 hover:scale-105 transition-all"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </button>
          </div>
          <textarea 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={`Add a note for "${pages[currentPage].title}"...`}
            className="w-full bg-white/10 rounded-2xl p-4 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-primary/40 resize-none h-24"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">My Research Notes</h3>
          <div className="grid gap-4">
            {notes.filter(n => n.pageIndex === currentPage).length === 0 ? (
              <div className="p-8 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400">No notes for this section yet.</p>
              </div>
            ) : (
              notes.filter(n => n.pageIndex === currentPage).map(note => (
                <motion.div 
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-5 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start gap-4"
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{note.text}</p>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2">
                      {new Date(note.timestamp).toLocaleDateString()} • {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyScreen;
