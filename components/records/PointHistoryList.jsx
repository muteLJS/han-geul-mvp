const ACTION_LABEL = {
  writing_100: "100자 달성",
  writing_150: "150자 달성",
  writing_200: "200자 달성",
  writing_300: "300자 달성",
  copywork_complete: "필사 완료",
  copywork_impression: "필사 감상",
  vocabulary_complete: "순우리말 확인",
  practice_complete: "글 다듬기 완료",
};

function formatTime(iso) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function PointHistoryList({ history }) {
  if (!history?.length) {
    return (
      <div className="p-4 bg-white rounded-2xl border border-border text-center py-8">
        <p className="text-sm text-ink-light">아직 포인트 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs font-bold text-ink-light uppercase tracking-widest">
          최근 포인트 내역
        </p>
      </div>
      <div className="divide-y divide-border">
        {history.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-ink">
                {ACTION_LABEL[item.action] ?? item.action}
              </p>
              <p className="text-[11px] text-ink-light mt-0.5">
                {formatTime(item.createdAt)}
              </p>
            </div>
            <span className="text-sm font-bold text-hwang">+{item.points}pt</span>
          </div>
        ))}
      </div>
    </div>
  );
}
