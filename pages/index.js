import Header from '../components/Header';
import MaterialCard from '../components/MaterialCard';
import { supabase } from '../lib/supabaseClient';
export async function getServerSideProps() {
  const { data } = await supabase.from('materiali').select('*');
  return { props: { materials: data } };
}
export default function Home({ materials }) {
  return (
    <div>
      <Header/>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(m=> <MaterialCard key={m.id} material={m}/> )}
      </div>
    </div>
  );
}