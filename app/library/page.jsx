import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Writing from "@/models/Writing";
import Book from "@/models/Book";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import LibraryTabs from "@/components/library/LibraryTabs";

export const metadata = {
  title: "도서함 | 한-글",
};

export default async function LibraryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  const [writings, books] = await Promise.all([
    Writing.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select("_id title category charCount createdAt")
      .lean(),
    Book.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select("_id title description status writingIds createdAt")
      .lean(),
  ]);

  // ObjectId → string 직렬화
  const serialize = (docs) =>
    docs.map((d) => ({
      ...d,
      _id: String(d._id),
      writingIds: d.writingIds ? d.writingIds.map(String) : undefined,
      createdAt: d.createdAt?.toISOString(),
      updatedAt: d.updatedAt?.toISOString(),
    }));

  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />
      <main className="flex flex-col flex-1 max-w-lg mx-auto w-full pb-20">
        <div className="px-4 pt-5 pb-2">
          <h1 className="text-xl font-bold text-ink">나의 도서함</h1>
          <p className="text-xs text-ink-light mt-1">
            {writings.length}편의 글 · {books.length}권의 책
          </p>
        </div>
        <LibraryTabs writings={serialize(writings)} books={serialize(books)} />
      </main>
      <BottomNav />
    </div>
  );
}
