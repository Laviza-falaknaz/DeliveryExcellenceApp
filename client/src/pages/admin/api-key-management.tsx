import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, Copy, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export function ApiKeyManagement() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/admin/api-keys"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/admin/api-keys", { name });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedKey(data.apiKey);
      setShowCreateDialog(false);
      setShowKeyDialog(true);
      setNewKeyName("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/admin/api-keys/${id}/revoke`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API Key Revoked",
        description: "The API key has been deactivated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke API key. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/api-keys/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API Key Deleted",
        description: "The API key has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard.",
    });
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for the API key.",
        variant: "destructive",
      });
      return;
    }
    createKeyMutation.mutate(newKeyName);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key Management
              </CardTitle>
              <CardDescription className="mt-2">
                Create and manage API keys for external integrations like Power Automate, Zapier, or custom applications.
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-create-api-key"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              API keys provide full access to your Data Push APIs. Store them securely and never commit them to version control.
              Keys are shown only once upon creation.
            </AlertDescription>
          </Alert>

          {isLoading ? (
            <div className="text-center py-8 text-neutral-600">Loading API keys...</div>
          ) : !apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Key className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No API Keys</h3>
              <p className="text-neutral-600 mb-4">
                Get started by creating your first API key for external integrations.
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
                data-testid="button-create-first-key"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First API Key
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <code className="bg-neutral-100 px-2 py-1 rounded text-sm">
                          {key.keyPrefix}•••
                        </code>
                      </TableCell>
                      <TableCell>
                        {key.isActive ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Revoked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {key.lastUsedAt ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-neutral-500" />
                            {format(new Date(key.lastUsedAt), "MMM d, yyyy h:mm a")}
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-sm">Never used</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600">
                        {format(new Date(key.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {key.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeKeyMutation.mutate(key.id)}
                              disabled={revokeKeyMutation.isPending}
                              data-testid={`button-revoke-${key.id}`}
                            >
                              Revoke
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to permanently delete this API key?")) {
                                deleteKeyMutation.mutate(key.id);
                              }
                            }}
                            disabled={deleteKeyMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-${key.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-testid="dialog-create-api-key">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Give your API key a descriptive name to identify its purpose (e.g., "Production Power Automate").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Production Power Automate"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                data-testid="input-key-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewKeyName("");
              }}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateKey}
              disabled={createKeyMutation.isPending}
              data-testid="button-confirm-create"
            >
              {createKeyMutation.isPending ? "Creating..." : "Create API Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show Generated Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={(open) => {
        setShowKeyDialog(open);
        if (!open) {
          setGeneratedKey("");
          setCopiedKey(false);
        }
      }}>
        <DialogContent className="max-w-2xl" data-testid="dialog-generated-key">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              API Key Created Successfully
            </DialogTitle>
            <DialogDescription>
              Save this key now. For security reasons, you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-amber-500 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Important: Copy This Key Now</AlertTitle>
              <AlertDescription className="text-amber-800">
                This is the only time the full API key will be displayed. Make sure to copy and store it securely.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="generated-key">Your API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="generated-key"
                  value={generatedKey}
                  readOnly
                  className="font-mono text-sm bg-neutral-50"
                  data-testid="input-generated-key"
                />
                <Button
                  onClick={handleCopyKey}
                  variant={copiedKey ? "default" : "outline"}
                  className={copiedKey ? "bg-green-600 hover:bg-green-700" : ""}
                  data-testid="button-copy-key"
                >
                  {copiedKey ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 bg-neutral-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm">How to Use This Key</h4>
              <p className="text-sm text-neutral-600 mb-2">
                Include this key in your API requests using one of these methods:
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-neutral-700 mb-1">Option 1: X-API-Key Header (Recommended)</p>
                  <code className="block bg-white p-2 rounded text-xs border">
                    X-API-Key: {generatedKey}
                  </code>
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-700 mb-1">Option 2: Authorization Header</p>
                  <code className="block bg-white p-2 rounded text-xs border">
                    Authorization: Bearer {generatedKey}
                  </code>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowKeyDialog(false);
                setGeneratedKey("");
                setCopiedKey(false);
              }}
              data-testid="button-close-generated-key"
            >
              I've Saved My Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
