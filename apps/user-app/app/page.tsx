"use client"
import { useBalance } from "@repo/store/useBalance";

export default function Page(): JSX.Element {
  const balance = useBalance();

  return (
    <div className="bg-blue-400">
      hi there {balance}
    </div>
  );
}
