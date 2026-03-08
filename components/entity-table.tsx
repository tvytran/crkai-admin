import Link from "next/link";
import { GenericDeleteButton } from "./generic-delete-button";

interface EntityTableProps {
  title: string;
  data: Record<string, unknown>[] | null;
  error?: string;
  entitySlug: string;
  tableName: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

function renderCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-600">null</span>;
  }
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-300 border border-green-800">
        Yes
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400">
        No
      </span>
    );
  }
  if (typeof value === "object") {
    const json = JSON.stringify(value);
    return (
      <span className="font-mono text-xs">
        {json.length > 80 ? json.slice(0, 80) + "..." : json}
      </span>
    );
  }
  const str = String(value);
  if (str.length > 100) {
    return <span title={str}>{str.slice(0, 100)}...</span>;
  }
  return str;
}

export function EntityTable({
  title,
  data,
  error,
  entitySlug,
  tableName,
  canCreate,
  canEdit,
  canDelete,
}: EntityTableProps) {
  if (error) {
    const isTableMissing =
      error.includes("does not exist") || error.includes("undefined_table");
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="bg-red-900/20 rounded-xl p-6 border border-red-800">
          {isTableMissing ? (
            <>
              <p className="text-red-400 font-medium mb-2">
                Table &quot;{tableName}&quot; does not exist yet
              </p>
              <p className="text-gray-400 text-sm">
                This table needs to be created in your Supabase database before
                you can manage {title.toLowerCase()} here.
              </p>
            </>
          ) : (
            <p className="text-red-400">
              Error loading {title.toLowerCase()}: {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  const columns =
    data && data.length > 0 ? Object.keys(data[0]) : [];
  const hasActions = canEdit || canDelete;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {data?.length ?? 0} records
          </span>
          {canCreate && (
            <Link
              href={`/${entitySlug}/new`}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + New
            </Link>
          )}
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="text-gray-500 bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
          No records found
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="text-left py-3 px-4 text-gray-400 font-medium whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                  {hasActions && (
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={(row.id as string) ?? i}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30"
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="py-3 px-4 text-gray-300 max-w-xs truncate"
                      >
                        {renderCellValue(row[col])}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {canEdit && (
                            <Link
                              href={`/${entitySlug}/edit?id=${row.id}`}
                              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Edit
                            </Link>
                          )}
                          {canDelete && (
                            <GenericDeleteButton
                              table={tableName}
                              id={String(row.id)}
                            />
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
