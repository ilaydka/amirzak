export default function Navbar() {

  return (

    <nav className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8 py-5 text-white">

      <h1 className="text-2xl font-bold text-red-500">AutoHub</h1>

      <ul className="flex gap-8">

        <li>Products</li>

        <li>Brands</li>

        <li>Dealers</li>

      </ul>

      <button className="rounded-lg bg-red-600 px-5 py-2 font-semibold">

        Login

      </button>

    </nav>

  );

}