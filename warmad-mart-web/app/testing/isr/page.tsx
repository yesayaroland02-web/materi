import axios from "axios";

// ISR -> Incremental Static Regeneration
// 1. halaman akan dirender secara static terlebih dahulu
// 2. dengan mendefinisikan export const revalidate = 10, Next.js akan memicu pembaharuan data
// dii background jika ada request masuk setelah 10 detik berlalu

export const revalidate = 10; // revalidate setiap 10 detik

export default async function TestingISR() {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/todos",
  );
  const data = response.data;

  console.log(" ----- ");
  console.log(`[ISR LOG] Revalidated at: ${new Date().toISOString()}`);
  console.log(" ----- ");

  return (
    <div className="w-screen h-full p-3 flex flex-col justify-center items-center">
      <h1>Testing ISR (Incremental Site Regeneration)</h1>
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
