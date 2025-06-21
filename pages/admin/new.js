import MaterialForm from '../../components/MaterialForm';
import Header from '../../components/Header';
export default function NewMaterial() {
  return (
    <div>
      <Header/>
      <div className="p-4">
        <h2 className="text-2xl mb-4">Aggiungi Materiale</h2>
        <MaterialForm/>
      </div>
    </div>
  );
}