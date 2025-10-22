import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ConnectionSettings() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: connectionInfo, isLoading } = useQuery({
    queryKey: ["/api/admin/connection"],
  });

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading) {
    return <div>Loading connection information...</div>;
  }

  const dev = connectionInfo?.development || {};
  const prod = connectionInfo?.production || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Settings
          </CardTitle>
          <CardDescription>
            View and copy database connection details for development and production environments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Development Database
            </h3>
            <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <ConnectionField
                label="Host"
                value={dev.host}
                onCopy={() => copyToClipboard(dev.host, "dev-host")}
                copied={copiedField === "dev-host"}
              />
              <ConnectionField
                label="Port"
                value={dev.port}
                onCopy={() => copyToClipboard(dev.port, "dev-port")}
                copied={copiedField === "dev-port"}
              />
              <ConnectionField
                label="Database"
                value={dev.database}
                onCopy={() => copyToClipboard(dev.database, "dev-database")}
                copied={copiedField === "dev-database"}
              />
              <ConnectionField
                label="User"
                value={dev.user}
                onCopy={() => copyToClipboard(dev.user, "dev-user")}
                copied={copiedField === "dev-user"}
              />
              <ConnectionField
                label="SSL"
                value={dev.ssl ? "Enabled" : "Disabled"}
              />
              <ConnectionField
                label="Connection String"
                value={dev.connectionString}
                onCopy={() => copyToClipboard(dev.connectionString, "dev-connection")}
                copied={copiedField === "dev-connection"}
                monospace
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Production Database
            </h3>
            <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> {prod.note}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Managed by: {prod.managedBy}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                To access production database settings, use the Replit database pane in the left sidebar.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Security Notice</h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Keep your database credentials secure. Never share connection strings in public repositories or unsecured channels. The password has been masked in the connection string above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ConnectionFieldProps {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  monospace?: boolean;
}

function ConnectionField({ label, value, onCopy, copied, monospace }: ConnectionFieldProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className={`text-sm text-gray-900 dark:text-white break-all ${monospace ? "font-mono text-xs" : ""}`}>
          {value || "N/A"}
        </p>
      </div>
      {onCopy && value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="ml-2"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
