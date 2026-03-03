"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { Search, Loader2, Check, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  lastActiveAt: string;
  subscriptionStatus: string | null;
  chatSessionsCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.set("search", search);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleToggleAccess = async (userId: string, currentStatus: string | null) => {
    const hasAccess = currentStatus === "ACTIVE" || currentStatus === "AUTHORIZED";
    setUpdatingUserId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grantAccess: !hasAccess }),
      });

      if (response.ok) {
        toast({
          title: hasAccess ? "Acesso revogado" : "Acesso concedido",
          description: hasAccess
            ? "O usuário não pode mais acessar o chat"
            : "O usuário agora pode acessar o chat",
        });
        fetchUsers(pagination?.page || 1);
      } else {
        throw new Error("Erro ao atualizar acesso");
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao atualizar acesso do usuário",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Sem assinatura</Badge>;

    const variants: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
      ACTIVE: "success",
      AUTHORIZED: "success",
      PENDING: "warning",
      CANCELLED: "destructive",
      PAUSED: "secondary",
      PAST_DUE: "destructive",
    };

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="Buscar por email ou nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Último acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || "Sem nome"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.subscriptionStatus)}</TableCell>
                    <TableCell>{user.chatSessionsCount}</TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(user.lastActiveAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={
                          user.subscriptionStatus === "ACTIVE" ||
                          user.subscriptionStatus === "AUTHORIZED"
                            ? "destructive"
                            : "default"
                        }
                        onClick={() => handleToggleAccess(user.id, user.subscriptionStatus)}
                        disabled={updatingUserId === user.id}
                      >
                        {updatingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.subscriptionStatus === "ACTIVE" ||
                          user.subscriptionStatus === "AUTHORIZED" ? (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Revogar
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Conceder
                          </>
                        )}
                      </Button>
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
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchUsers(pagination.page + 1)}
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
