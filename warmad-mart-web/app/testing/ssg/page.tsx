import axios from "axios";

// SSG -> Static Site Generation
// 1. secara default di next app router, fetch/request yang di-cache atau memakai 'dynamic = 'force-static'
// akan merender halaman secara statis pada saat npm run build

// npm run build -> menggunakan mode production untuk testing aplikasi

// 2. data tidak akan direfetch ulang tiap request, sehingga waktu respon sangat cepat

export const dynamic = "force-static"; // memastikan route dirender secara statis

export default async function TestingSSG() {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/todos",
  );
  const data = response.data;

  console.log(" ----- ");
  console.log(`[SSG LOG] Rendered at Built Time: ${new Date().toISOString()}`);
  console.log(" ----- ");

  return (
    <div className="w-screen h-full p-3 flex flex-col justify-center items-center">
      <h1>Testing SSG (Static Site Generation)</h1>
      <div className="border rounded-md p-5 h-full w-full">
        {data?.map((item: any) => (
          <div className="border rounded-md p-5 my-2" key={item.id}>
            <span className="text-blue-700">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
