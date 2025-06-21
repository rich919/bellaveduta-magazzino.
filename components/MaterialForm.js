import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
export default function MaterialForm() {
  const [nome, setNome] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return alert('Seleziona un file');
    setLoading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materiali')
      .upload(fileName, file);
    if (uploadError) { alert(uploadError.message); setLoading(false); return; }
    const { data: publicData } = supabase.storage.from('materiali').getPublicUrl(fileName);
    const { error: dbError } = await supabase.from('materiali')
      .insert({ nome, descrizione, image_url: publicData.publicUrl });
    setLoading(false);
    if (dbError) alert(dbError.message); else router.push('/admin');
  }
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <input required placeholder="Nome" className="border p-2 w-full mb-2" onChange={e=>setNome(e.target.value)}/>
      <textarea required placeholder="Descrizione" className="border p-2 w-full mb-2" onChange={e=>setDescrizione(e.target.value)}/>
      <input type="file" required className="mb-2" onChange={e=>setFile(e.target.files[0])}/>
      <button disabled={loading} className="bg-blue-600 text-white py-2 px-4">
        {loading?'Caricamento...':'Aggiungi Materiale'}
      </button>
    </form>
  );
}