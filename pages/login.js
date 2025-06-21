import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';
export default function Login() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const router=useRouter();
  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); else router.push('/admin');
  }
  return (
    <div>
      <Header/>
      <div className="flex items-center justify-center h-screen">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl mb-4">Admin Login</h2>
          <input type="email" placeholder="Email" className="border p-2 w-full mb-2" onChange={e=>setEmail(e.target.value)}/>
          <input type="password" placeholder="Password" className="border p-2 w-full mb-4" onChange={e=>setPassword(e.target.value)}/>
          <button type="submit" className="w-full bg-blue-600 text-white p-2">Login</button>
        </form>
      </div>
    </div>
  );
}