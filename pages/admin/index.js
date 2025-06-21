import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import MaterialForm from '../../components/MaterialForm';
import Header from '../../components/Header';
export default function Admin() {
  const [materials,setMaterials]=useState([]);
  useEffect(()=>{
    supabase.auth.getUser().then(({data:{user}})=>{ if(!user) window.location='/login' });
    fetchMaterials();
  },[]);
  async function fetchMaterials() {
    const { data, error } = await supabase.from('materiali').select('*');
    if(!error) setMaterials(data);
  }
  async function handleDelete(id,imgUrl) {
    const path = imgUrl.split('/').pop();
    await supabase.storage.from('materiali').remove([path]);
    await supabase.from('materiali').delete().eq('id',id);
    fetchMaterials();
  }
  return (
    <div>
      <Header/>
      <div className="p-4">
        <h2 className="text-2xl mb-4">Gestione Materiali</h2>
        <MaterialForm/>
        <ul className="mt-4">
          {materials.map(m=>(
            <li key={m.id} className="bg-white p-2 m-2 rounded flex justify-between">
              <span>{m.nome}</span>
              <button onClick={()=>handleDelete(m.id,m.image_url)} className="text-red-600">Elimina</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}