import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

async function UserInfo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
        {user?.email?.[0]?.toUpperCase() ?? "?"}
      </div>
      <span className="text-sm text-gray-400 hidden md:block truncate">
        {user?.email}
      </span>
    </div>
  );
}

const navGroups = [
  {
    label: "Main",
    items: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    label: "Users & Access",
    items: [
      { href: "/profiles", label: "Users" },
      { href: "/allowed-signup-domains", label: "Allowed Domains" },
      { href: "/whitelisted-emails", label: "Whitelisted Emails" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/images", label: "Images" },
      { href: "/captions", label: "Captions" },
      { href: "/caption-requests", label: "Caption Requests" },
      { href: "/caption-examples", label: "Caption Examples" },
      { href: "/example-captions", label: "Example Captions" },
    ],
  },
  {
    label: "Humor",
    items: [
      { href: "/humor-flavors", label: "Humor Flavors" },
      { href: "/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/humor-mix", label: "Humor Mix" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    label: "LLM",
    items: [
      { href: "/llm-providers", label: "LLM Providers" },
      { href: "/llm-models", label: "LLM Models" },
      { href: "/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/llm-responses", label: "LLM Responses" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold text-orange-400">Humor Admin</h1>
          <p className="text-xs text-gray-500 mt-1">The Humor Project</p>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <UserInfo />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
