import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>GHost AI</h1>
      <Button className="bg-blue-500 text-white">Click me</Button>
    </div>
  );
}
