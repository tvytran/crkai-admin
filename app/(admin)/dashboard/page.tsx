import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = createAdminClient();

  const [
    { count: profileCount },
    { count: imageCount },
    { count: captionCount },
    { count: voteCount },
    { count: flavorCount },
    { data: recentCaptions },
    { data: topVotedCaptions },
    { data: mostActiveCaptioners },
    { data: recentImages },
    { data: captionsPerDay },
    { count: publicCaptionCount },
    { count: studyProfileCount },
    { count: superadminCount },
    { count: upvoteCount },
    { count: downvoteCount },
    { data: allVotesWithCaptions },
    { data: votesPerDay },
    { data: activeVoters },
    { count: ratedCaptionCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
    supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
    supabase
      .from("captions")
      .select("id, content, created_datetime_utc, profile_id")
      .not("content", "is", null)
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase.rpc("get_top_voted_captions").then((res) => {
      if (res.error) {
        return supabase
          .from("caption_votes")
          .select("caption_id, vote_value")
          .limit(1000);
      }
      return res;
    }),
    supabase
      .from("captions")
      .select("profile_id")
      .not("profile_id", "is", null)
      .not("content", "is", null)
      .limit(10000),
    supabase
      .from("images")
      .select("id, created_datetime_utc, profile_id, url")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("captions")
      .select("created_datetime_utc")
      .not("content", "is", null)
      .order("created_datetime_utc", { ascending: false })
      .limit(5000),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_in_study", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_superadmin", true),
    // Rating statistics queries
    supabase
      .from("caption_votes")
      .select("*", { count: "exact", head: true })
      .eq("vote_value", 1),
    supabase
      .from("caption_votes")
      .select("*", { count: "exact", head: true })
      .eq("vote_value", -1),
    supabase
      .from("caption_votes")
      .select("caption_id, vote_value, profile_id, captions(content)")
      .limit(5000),
    supabase
      .from("caption_votes")
      .select("created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(5000),
    supabase
      .from("caption_votes")
      .select("profile_id")
      .limit(10000),
    supabase
      .from("caption_votes")
      .select("caption_id", { count: "exact", head: true }),
  ]);

  const captionerCounts: Record<string, number> = {};
  mostActiveCaptioners?.forEach((c: { profile_id: string }) => {
    captionerCounts[c.profile_id] = (captionerCounts[c.profile_id] || 0) + 1;
  });
  const topCaptioners = Object.entries(captionerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const voteSums: Record<string, number> = {};
  if (topVotedCaptions && Array.isArray(topVotedCaptions)) {
    topVotedCaptions.forEach(
      (v: { caption_id: string; vote_value: number }) => {
        voteSums[v.caption_id] = (voteSums[v.caption_id] || 0) + v.vote_value;
      }
    );
  }
  const topVoted = Object.entries(voteSums)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const dayCounts: Record<string, number> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayCounts[d.toISOString().split("T")[0]] = 0;
  }
  captionsPerDay?.forEach((c: { created_datetime_utc: string }) => {
    const day = c.created_datetime_utc?.split("T")[0];
    if (day && day in dayCounts) {
      dayCounts[day]++;
    }
  });

  const avgCaptionsPerImage =
    imageCount && captionCount ? (captionCount / imageCount).toFixed(1) : "0";
  const avgVotesPerCaption =
    captionCount && voteCount ? (voteCount / captionCount).toFixed(1) : "0";

  // Rating statistics: aggregate votes per caption with content
  const captionVoteAgg: Record<string, { up: number; down: number; net: number; content: string }> = {};
  allVotesWithCaptions?.forEach((v: { caption_id: string; vote_value: number; captions: { content: string }[] | { content: string } | null }) => {
    if (!captionVoteAgg[v.caption_id]) {
      const captionData = Array.isArray(v.captions) ? v.captions[0] : v.captions;
      const content = captionData?.content || "(no content)";
      captionVoteAgg[v.caption_id] = { up: 0, down: 0, net: 0, content };
    }
    if (v.vote_value === 1) captionVoteAgg[v.caption_id].up++;
    else if (v.vote_value === -1) captionVoteAgg[v.caption_id].down++;
    captionVoteAgg[v.caption_id].net += v.vote_value;
  });

  const mostUpvoted = Object.entries(captionVoteAgg)
    .sort(([, a], [, b]) => b.net - a.net)
    .slice(0, 5)
    .map(([id, data]) => ({ id, ...data }));

  const mostDownvoted = Object.entries(captionVoteAgg)
    .sort(([, a], [, b]) => a.net - b.net)
    .slice(0, 5)
    .map(([id, data]) => ({ id, ...data }));

  const mostControversial = Object.entries(captionVoteAgg)
    .filter(([, d]) => d.up + d.down >= 2)
    .sort(([, a], [, b]) => (b.up + b.down) - (a.up + a.down))
    .slice(0, 5)
    .map(([id, data]) => ({ id, ...data }));

  // Votes per day (last 7 days)
  const voteDayCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    voteDayCounts[d.toISOString().split("T")[0]] = 0;
  }
  votesPerDay?.forEach((v: { created_datetime_utc: string }) => {
    const day = v.created_datetime_utc?.split("T")[0];
    if (day && day in voteDayCounts) {
      voteDayCounts[day]++;
    }
  });

  // Top voters
  const voterCounts: Record<string, number> = {};
  activeVoters?.forEach((v: { profile_id: string }) => {
    voterCounts[v.profile_id] = (voterCounts[v.profile_id] || 0) + 1;
  });
  const topVoters = Object.entries(voterCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Unique captions that have been rated
  const uniqueRatedCaptions = new Set(
    allVotesWithCaptions?.map((v: { caption_id: string }) => v.caption_id) ?? []
  ).size;

  // Unique voters
  const uniqueVoters = new Set(
    activeVoters?.map((v: { profile_id: string }) => v.profile_id) ?? []
  ).size;

  return {
    profileCount: profileCount ?? 0,
    imageCount: imageCount ?? 0,
    captionCount: captionCount ?? 0,
    voteCount: voteCount ?? 0,
    flavorCount: flavorCount ?? 0,
    publicCaptionCount: publicCaptionCount ?? 0,
    studyProfileCount: studyProfileCount ?? 0,
    superadminCount: superadminCount ?? 0,
    recentCaptions: recentCaptions ?? [],
    recentImages: recentImages ?? [],
    topCaptioners,
    topVoted,
    dayCounts,
    avgCaptionsPerImage,
    avgVotesPerCaption,
    // Rating stats
    upvoteCount: upvoteCount ?? 0,
    downvoteCount: downvoteCount ?? 0,
    mostUpvoted,
    mostDownvoted,
    mostControversial,
    voteDayCounts,
    topVoters,
    uniqueRatedCaptions,
    uniqueVoters,
  };
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-gray-800 rounded-full h-2">
      <div
        className="bg-orange-500 h-2 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();
  const maxDay = Math.max(...Object.values(stats.dayCounts), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Profiles" value={stats.profileCount} color="text-blue-400" />
        <StatCard label="Total Images" value={stats.imageCount} color="text-green-400" />
        <StatCard label="Total Captions" value={stats.captionCount} color="text-purple-400" />
        <StatCard label="Total Votes" value={stats.voteCount} color="text-orange-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Humor Flavors" value={stats.flavorCount} color="text-pink-400" />
        <StatCard label="Avg Captions/Image" value={stats.avgCaptionsPerImage} color="text-cyan-400" />
        <StatCard label="Avg Votes/Caption" value={stats.avgVotesPerCaption} color="text-yellow-400" />
        <StatCard label="In Study" value={stats.studyProfileCount} color="text-emerald-400" />
        <StatCard label="Superadmins" value={stats.superadminCount} color="text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Captions Created (Last 7 Days)</h2>
          <div className="space-y-3">
            {Object.entries(stats.dayCounts).map(([day, count]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-20 shrink-0">
                  {new Date(day + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <MiniBar value={count} max={maxDay} />
                <span className="text-sm text-gray-300 w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Top Caption Writers</h2>
          <div className="space-y-3">
            {stats.topCaptioners.map(([profileId, count], i) => (
              <div key={profileId} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? "bg-yellow-500 text-black"
                      : i === 1
                        ? "bg-gray-400 text-black"
                        : i === 2
                          ? "bg-orange-700 text-white"
                          : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-gray-400 font-mono truncate flex-1">
                  {profileId.slice(0, 8)}...
                </span>
                <span className="text-sm font-semibold text-orange-400">{count} captions</span>
              </div>
            ))}
            {stats.topCaptioners.length === 0 && (
              <p className="text-gray-500 text-sm">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Caption Rating Statistics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-orange-400">Caption Rating Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Upvotes" value={stats.upvoteCount} color="text-green-400" />
          <StatCard label="Downvotes" value={stats.downvoteCount} color="text-red-400" />
          <StatCard label="Captions Rated" value={stats.uniqueRatedCaptions} color="text-purple-400" />
          <StatCard label="Unique Voters" value={stats.uniqueVoters} color="text-blue-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Votes Cast (Last 7 Days)</h3>
            <div className="space-y-3">
              {Object.entries(stats.voteDayCounts).map(([day, count]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 shrink-0">
                    {new Date(day + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <MiniBar value={count} max={Math.max(...Object.values(stats.voteDayCounts), 1)} />
                  <span className="text-sm text-gray-300 w-10 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Most Active Voters</h3>
            <div className="space-y-3">
              {stats.topVoters.map(([profileId, count], i) => (
                <div key={profileId} className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? "bg-yellow-500 text-black"
                        : i === 1
                          ? "bg-gray-400 text-black"
                          : i === 2
                            ? "bg-orange-700 text-white"
                            : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-400 font-mono truncate flex-1">
                    {profileId.slice(0, 8)}...
                  </span>
                  <span className="text-sm font-semibold text-orange-400">{count} votes</span>
                </div>
              ))}
              {stats.topVoters.length === 0 && (
                <p className="text-gray-500 text-sm">No votes yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Most Upvoted Captions</h3>
            <div className="space-y-3">
              {stats.mostUpvoted.map((c, i) => (
                <div key={c.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-green-400">#{i + 1}</span>
                    <span className="text-xs text-gray-500">+{c.up} / -{c.down} (net: {c.net})</span>
                  </div>
                  <p className="text-sm text-gray-200 line-clamp-2">{c.content}</p>
                </div>
              ))}
              {stats.mostUpvoted.length === 0 && (
                <p className="text-gray-500 text-sm">No votes yet</p>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-red-400">Most Downvoted Captions</h3>
            <div className="space-y-3">
              {stats.mostDownvoted.map((c, i) => (
                <div key={c.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-red-400">#{i + 1}</span>
                    <span className="text-xs text-gray-500">+{c.up} / -{c.down} (net: {c.net})</span>
                  </div>
                  <p className="text-sm text-gray-200 line-clamp-2">{c.content}</p>
                </div>
              ))}
              {stats.mostDownvoted.length === 0 && (
                <p className="text-gray-500 text-sm">No votes yet</p>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Most Controversial</h3>
            <div className="space-y-3">
              {stats.mostControversial.map((c, i) => (
                <div key={c.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-yellow-400">#{i + 1}</span>
                    <span className="text-xs text-gray-500">+{c.up} / -{c.down} ({c.up + c.down} total)</span>
                  </div>
                  <p className="text-sm text-gray-200 line-clamp-2">{c.content}</p>
                </div>
              ))}
              {stats.mostControversial.length === 0 && (
                <p className="text-gray-500 text-sm">Not enough data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Recent Captions</h2>
          <div className="space-y-3">
            {stats.recentCaptions.map(
              (c: { id: string; content: string; created_datetime_utc: string }) => (
                <div key={c.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <p className="text-sm text-gray-200 line-clamp-2">{c.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(c.created_datetime_utc).toLocaleString()}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Recent Images</h2>
          <div className="space-y-3">
            {stats.recentImages.map(
              (img: { id: string; created_datetime_utc: string; profile_id: string; url: string }) => (
                <div
                  key={img.id}
                  className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 border border-gray-700"
                >
                  {img.url && (
                    <img src={img.url} alt="" className="w-10 h-10 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 font-mono truncate">
                      {img.id.slice(0, 12)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(img.created_datetime_utc).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
