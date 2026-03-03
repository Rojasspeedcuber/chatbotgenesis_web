"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { Loader2, Eye } from "lucide-react";

interface WebhookEvent {
  id: string;
  provider: string;
  eventType: string;
  externalId: string;
  receivedAt: string;
  processedAt: string | null;
  status: string;
  errorMessage: string | null;
  payload: object;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWebhooks = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/admin/webhooks?${params}`);
      const data = await response.json();

      if (response.ok) {
        setWebhooks(data.webhooks);
        setPagination(data.pagination);
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao carregar webhooks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
      processed: "success",
      pending: "warning",
      failed: "destructive",
    };

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <p className="text-muted-foreground">
          Logs de eventos recebidos do Mercado Pago
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={statusFilter === "" ? "default" : "outline"}
          onClick={() => setStatusFilter("")}
          size="sm"
        >
          Todos
        </Button>
        <Button
          variant={statusFilter === "processed" ? "default" : "outline"}
          onClick={() => setStatusFilter("processed")}
          size="sm"
        >
          Processados
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          onClick={() => setStatusFilter("pending")}
          size="sm"
        >
          Pendentes
        </Button>
        <Button
          variant={statusFilter === "failed" ? "default" : "outline"}
          onClick={() => setStatusFilter("failed")}
          size="sm"
        >
          Falhas
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum webhook encontrado
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>External ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recebido</TableHead>
                  <TableHead>Processado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {webhook.eventType}
                      </code>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {webhook.externalId}
                    </TableCell>
                    <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(webhook.receivedAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {webhook.processedAt
                        ? formatDateTime(webhook.processedAt)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Detalhes do Webhook
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Tipo:</span>
                                <p className="font-mono">{webhook.eventType}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <p>{getStatusBadge(webhook.status)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">External ID:</span>
                                <p className="font-mono">{webhook.externalId}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Provider:</span>
                                <p>{webhook.provider}</p>
                              </div>
                            </div>
                            {webhook.errorMessage && (
                              <div>
                                <span className="text-muted-foreground text-sm">Erro:</span>
                                <p className="text-red-500 text-sm">
                                  {webhook.errorMessage}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground text-sm">Payload:</span>
                              <ScrollArea className="h-64 mt-2">
                                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                                  {JSON.stringify(webhook.payload, null, 2)}
                                </pre>
                              </ScrollArea>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => fetchWebhooks(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchWebhooks(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
