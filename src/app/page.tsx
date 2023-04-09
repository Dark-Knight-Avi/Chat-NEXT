import { db } from "@/lib/db"

export default async function Home() {
  await db.set('Name', 'Aritra Karmakar')
  return (
    <div className="text-red-500">hello world</div>
  )
}
