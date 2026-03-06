import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  const supabase = createAdminClient();

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="text-red-400">Error loading images: {error.message}</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Images</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            Showing {images?.length ?? 0} most recent
          </span>
          <Link
            href="/images/new"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Image
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images?.map((image) => (
          <div
            key={image.id}
            className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
          >
            {image.url && (
              <div className="aspect-video bg-gray-800 overflow-hidden">
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-xs font-mono text-gray-500 mb-2 truncate">
                {image.id}
              </p>
              {image.image_description && (
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                  {image.image_description}
                </p>
              )}
              <div className="flex items-center gap-2 mb-3">
                {image.is_public && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-300 border border-green-800">
                    Public
                  </span>
                )}
                {image.is_common_use && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-800">
                    Common Use
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {new Date(image.created_datetime_utc).toLocaleString()}
              </p>
              <div className="flex gap-2 mt-3">
                <Link
                  href={`/images/edit?id=${image.id}`}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton id={image.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
