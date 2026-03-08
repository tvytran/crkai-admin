import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return <div className="text-red-400">Error loading profiles: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Users</h1>
        <span className="text-sm text-gray-400">
          {profiles?.length ?? 0} total
        </span>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Superadmin</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">In Study</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map((profile) => (
                <tr
                  key={profile.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30"
                >
                  <td className="py-3 px-4 font-mono text-xs text-gray-300">
                    {profile.id.slice(0, 8)}...
                  </td>
                  <td className="py-3 px-4 text-gray-200">
                    {profile.email ?? <span className="text-gray-600">null</span>}
                  </td>
                  <td className="py-3 px-4 text-gray-200">
                    {profile.first_name || profile.last_name
                      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
                      : <span className="text-gray-600">null</span>}
                  </td>
                  <td className="py-3 px-4">
                    {profile.is_superadmin ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-300 border border-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {profile.is_in_study ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">
                    {profile.created_datetime_utc
                      ? new Date(profile.created_datetime_utc).toLocaleDateString()
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
