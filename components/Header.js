import Link from 'next/link';
export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between">
      <h1 className="text-xl">Magazzino Bellaveduta</h1>
      <nav>
        <Link href="/">Home</Link> |{' '}
        <Link href="/login">Login</Link> |{' '}
        <Link href="/admin">Admin</Link>
      </nav>
    </header>
  );
}