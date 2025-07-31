import { useState, useEffect } from "react";
import { Lead, LEAD_STATUSES } from "@shared/leads";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";

export default function AdminLeads() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    // Check if already authenticated
    const authenticated =
      localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);

    if (authenticated) {
      fetchLeads();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [selectedStatus, page]);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchLeads();
    fetchStats();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch(
        `/api/leads?status=${selectedStatus}&page=${page}&limit=20`,
      );
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/leads/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchLeads();
        fetchStats();
        setSelectedLead(null);
      }
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  const deleteLead = async (leadId: number) => {
    if (!confirm("Tem certeza que deseja deletar este lead?")) return;

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLeads();
        fetchStats();
        setSelectedLead(null);
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = LEAD_STATUSES.find((s) => s.value === status);
    return statusObj?.color || "gray";
  };

  const getStatusLabel = (status: string) => {
    const statusObj = LEAD_STATUSES.find((s) => s.value === status);
    return statusObj?.label || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Leads
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie os leads capturados pelo formulário
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Total de Leads
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Esta Semana
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.recent}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Novos
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.byStatus.new || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Convertidos
              </h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.byStatus.converted || 0}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos</option>
                {LEAD_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.has_cnpj === "sim" ? "Lojista" : "Consumidor"}
                          {lead.store_type && (
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                              {lead.store_type.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.whatsapp && (
                        <div className="text-sm text-gray-900">
                          {lead.whatsapp}
                        </div>
                      )}
                      {lead.cep && (
                        <div className="text-sm text-gray-500">
                          CEP: {lead.cep}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(lead.status)}-100 text-${getStatusColor(lead.status)}-800`}
                      >
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">{(page - 1) * 20 + 1}</span> a{" "}
                    <span className="font-medium">
                      {Math.min(page * 20, pagination.total)}
                    </span>{" "}
                    de <span className="font-medium">{pagination.total}</span>{" "}
                    resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {page} de {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Próximo
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes do Lead
                  </h3>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLead.name}
                    </p>
                  </div>
                  {selectedLead.whatsapp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        WhatsApp
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLead.whatsapp}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Possui CNPJ
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLead.has_cnpj === "sim"
                        ? "Sim, é lojista"
                        : "Não, é consumidor"}
                    </p>
                  </div>
                  {selectedLead.store_type && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Loja
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLead.store_type === "fisica" && "Física"}
                        {selectedLead.store_type === "online" && "Online"}
                        {selectedLead.store_type === "fisica_online" &&
                          "Física e Online"}
                        {selectedLead.store_type === "midias_sociais" &&
                          "Mídias Sociais"}
                      </p>
                    </div>
                  )}
                  {selectedLead.cep && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        CEP
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLead.cep}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status Atual
                    </label>
                    <div className="mt-1 flex items-center space-x-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(selectedLead.status)}-100 text-${getStatusColor(selectedLead.status)}-800`}
                      >
                        {getStatusLabel(selectedLead.status)}
                      </span>
                      <select
                        value={selectedLead.status}
                        onChange={(e) =>
                          updateLeadStatus(selectedLead.id, e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {LEAD_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data de Criação
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedLead.created_at)}
                    </p>
                  </div>
                  {selectedLead.ip_address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        IP
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLead.ip_address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
