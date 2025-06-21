// pages/login.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()
    // Admin
    if (username === 'bellaveduta' && password === 'marmi2025') {
      router.push('/admin')
      return
    }
    // Cliente ospite
    if (username === 'bellavedutaospite' && password === 'marmiepietre') {
      router.push('/')  // torna alla galleria pubblica
      return
    }
    alert('Credenziali non valide')
  }

  return (
    <div>
      <Header/>
      <div className="flex items-center justify-center h-screen">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded shadow-md w-full max-w-sm"
        >
          <h2 className="text-2xl mb-4 text-center">Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            className="border p-2 w-full mb-3 rounded"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full mb-4 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
