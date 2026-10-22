"use client";
import { useState } from "react";

// CSR -> Client Side Rendering
// proses rendering yang dilakukan di dalam Browser
// bisa memanggil hooks (useState, useMemo, useEffect, dll.)

export default function TestClientComponent() {
  const [count, setCount] = useState<number>(0);

  console.log("count: ", count);

  return (
    <div className="border rounded p-5 bg-slate-100 flex flex-col justify-center items-center">
      <h1>Test Client Component</h1>
      <div className="flex space-x-5 mt-10">
        <button onClick={() => setCount(count + 1)}>+</button>
        <span>{count}</span>
        <button onClick={() => setCount(count - 1)}>-</button>
      </div>
    </div>
  );
}