import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function CaptionsPage() {
  const supabase = createAdminClient();

  const { data: captions, error } = await supabase
    .from("captions")
    .select("*")
    .not("content", "is", null)
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="text-red-400">
        Error loading captions: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Captions</h1>
        <span className="text-sm text-gray-400">
          Showing {captions?.length ?? 0} most recent
        </span>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Content</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Image ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Profile</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Public</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {captions?.map((caption) => (
                <tr
                  key={caption.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30"
                >
                  <td className="py-3 px-4 text-gray-200 max-w-md">
                    <p className="line-clamp-2">{caption.content}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">
                    {caption.image_id
                      ? `${caption.image_id.slice(0, 8)}...`
                      : <span className="text-gray-600">null</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">
                    {caption.profile_id
                      ? `${caption.profile_id.slice(0, 8)}...`
                      : <span className="text-gray-600">null</span>}
                  </td>
                  <td className="py-3 px-4">
                    {caption.is_public ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-300 border border-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">
                    {caption.created_datetime_utc
                      ? new Date(caption.created_datetime_utc).toLocaleString()
                      : "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
