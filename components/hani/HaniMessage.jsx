import Image from "next/image";

const moodMap = {
  default: "/images/hani/hani-default.png",
  happy: "/images/hani/hani-happy.png",
  complete: "/images/hani/hani-complete.png",
  guide: "/images/hani/hani-guide.png",
};

export default function HaniMessage({ mood = "default", message, size = 80 }) {
  const src = moodMap[mood] ?? moodMap.default;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-full bg-hwang-light flex items-center justify-center overflow-hidden shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt="한이"
          width={size}
          height={size}
          className="object-contain"
          unoptimized
        />
      </div>

      {message && (
        <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[220px] text-center shadow-sm">
          <p className="text-sm text-ink leading-relaxed">{message}</p>
        </div>
      )}
    </div>
  );
}
