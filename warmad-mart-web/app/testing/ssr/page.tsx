import axios from "axios";
import TestClientComponent from "@/components/TestClientComponent";

// SSR -> Server Side Rendering
// proses rendering yang dilakukan di dalam aplikasi Next.js (server), bukan di browser
// TIDAK BISA memanggil Hooks apapun (useState, useMemo, useEffect, dll.)

export const dynamic = "force-dynamic";

export default async function Testing() {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/todos",
  );
  const data = response.data;

  console.log(" ----- ");
  console.log(`[SSR LOG] Rendered at Server: ${new Date().toISOString()}`);
  console.log(" ----- ");

  return (
    <div className="w-screen h-full p-3 flex flex-col justify-center items-center">
      <h1>Testing SSR</h1>
      <TestClientComponent />
      <div className="border rounded-md p-5 h-full w-full">
        {data?.map((item: any) => (
          <div className="border rounded-md p-5" key={item.id}>
            <span className="text-blue-700">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
