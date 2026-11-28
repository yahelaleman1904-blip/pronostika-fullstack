import { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import ChangeRoleModal from '../components/ChangeRoleModal';
import DeleteUserModal from '../components/DeleteUserModal';
import Toast from '../components/Toast';
import {
  fetchAdminUsers,
  fetchRoles,
  changeUserRole,
  deleteAdminUser,
} from '../services/adminUsersService';
import { getErrorMessage } from '../services/http';

const PAGE_SIZES = [5, 10, 20, 50];

const ROLE_STYLES = {
  ADMIN: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  ANALISTA: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  USUARIO: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
};

const COLUMNS = [
  { key: 'nombre', label: 'Usuario', sortable: true },
  { key: 'email', label: 'Correo', sortable: true },
  { key: 'telefono', label: 'Teléfono', sortable: false },
  { key: 'rol', label: 'Rol', sortable: false },
  { key: 'createdAt', label: 'Alta', sortable: true },
];

const avatarFor = (u) =>
  u.avatarUrl ||
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(`${u.nombre} ${u.apellido}`)}`;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalElementos: 0, totalPaginas: 0 });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState({ field: 'id', dir: 'asc' });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loadedKey, setLoadedKey] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [userForRole, setUserForRole] = useState(null);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = useCallback(() => setToast({ message: '', type: 'success' }), []);

  // Espera 400 ms después de teclear antes de buscar en el servidor
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Cada combinación de página/tamaño/búsqueda/orden es una petición distinta;
  // la tabla está "cargando" mientras la última respuesta no corresponda a la actual.
  const requestKey = `${page}|${size}|${search}|${sort.field},${sort.dir}|${reloadCount}`;
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;
    fetchAdminUsers({ page, size, buscar: search, sort: `${sort.field},${sort.dir}` })
      .then((data) => {
        if (!active) return;
        setUsers(data.contenido);
        setPageInfo({ totalElementos: data.totalElementos, totalPaginas: data.totalPaginas });
        setErrorMsg('');
      })
      .catch((error) => {
        if (!active) return;
        setUsers([]);
        setErrorMsg(getErrorMessage(error, 'No se pudieron cargar los usuarios.'));
      })
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [page, size, search, sort, requestKey]);

  const loadUsers = () => setReloadCount((n) => n + 1);

  useEffect(() => {
    fetchRoles()
      .then(setRoles)
      .catch(() => setRoles([]));
  }, []);

  const toggleSort = (field) => {
    setSort((prev) =>
      prev.field === field ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' }
    );
    setPage(0);
  };

  const handleChangeRole = async (newRole) => {
    if (!userForRole) return;
    setIsSavingRole(true);
    try {
      const updated = await changeUserRole(userForRole.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`${updated.nombre} ahora tiene el rol ${updated.rol}.`);
      setUserForRole(null);
    } catch (error) {
      showToast(getErrorMessage(error, 'No se pudo cambiar el rol.'), 'error');
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAdminUser(userToDelete.id);
      showToast(`Se eliminó a ${userToDelete.nombre} ${userToDelete.apellido}.`);
      setUserToDelete(null);
      // Si era el último de la página, regresa a la anterior
      if (users.length === 1 && page > 0) {
        setPage((p) => p - 1);
      } else {
        loadUsers();
      }
    } catch (error) {
      showToast(getErrorMessage(error, 'No se pudo eliminar el usuario.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const from = pageInfo.totalElementos === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, pageInfo.totalElementos);
  const totalPages = Math.max(pageInfo.totalPaginas, 1);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] p-6 lg:p-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Administración de usuarios</h1>
            <p className="text-xs text-[#94A3B8]">
              {pageInfo.totalElementos} usuario{pageInfo.totalElementos === 1 ? '' : 's'} registrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o correo"
              className="w-64 pl-9 pr-3 py-2.5 rounded-xl bg-[#1E293B] border border-[#334155] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#10B981]"
            />
          </div>
          <button
            onClick={loadUsers}
            className="p-2.5 rounded-xl bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer btn-press"
            aria-label="Recargar"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl glass-card overflow-hidden animate-fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-[#334155]">
                {COLUMNS.map((col) => (
                  <th key={col.key} className="px-5 py-3.5 font-semibold">
                    {col.sortable ? (
                      <button
                        onClick={() => toggleSort(col.key)}
                        className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-white ${
                          sort.field === col.key ? 'text-[#10B981]' : ''
                        }`}
                      >
                        {col.label}
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
                <th className="px-5 py-3.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: Math.min(size, 5) }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-[#334155]/60">
                    <td colSpan={COLUMNS.length + 1} className="px-5 py-4">
                      <div className="skeleton h-5" />
                    </td>
                  </tr>
                ))}

              {!isLoading && errorMsg && (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="px-5 py-10 text-center text-red-300">
                    {errorMsg}
                  </td>
                </tr>
              )}

              {!isLoading && !errorMsg && users.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="px-5 py-10 text-center text-[#94A3B8]">
                    {search ? `No hay usuarios que coincidan con "${search}".` : 'Aún no hay usuarios.'}
                  </td>
                </tr>
              )}

              {!isLoading &&
                !errorMsg &&
                users.map((u) => (
                  <tr key={u.id} className="border-b border-[#334155]/60 glass-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarFor(u)}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-[#334155] bg-[#0F172A]"
                        />
                        <div>
                          <p className="font-semibold text-white leading-tight">
                            {u.nombre} {u.apellido}
                          </p>
                          <p className={`text-xs ${u.activo ? 'text-[#10B981]' : 'text-slate-500'}`}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{u.email}</td>
                    <td className="px-5 py-3.5 text-slate-400">{u.telefono || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                          ROLE_STYLES[u.rol] || 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setUserForRole(u)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold cursor-pointer btn-press"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Rol
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 cursor-pointer btn-press"
                          aria-label={`Eliminar a ${u.nombre}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Paginación server-side */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-[#334155] text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span>Filas por página</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1.5 rounded-lg bg-[#0F172A] border border-[#334155] text-white focus:outline-none focus:border-[#10B981]"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="ml-2">
              {from}–{to} de {pageInfo.totalElementos}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0 || isLoading}
              className="p-2 rounded-lg bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer btn-press disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Página <span className="text-white font-semibold">{page + 1}</span> de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= totalPages || isLoading}
              className="p-2 rounded-lg bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer btn-press disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {userForRole && (
        <ChangeRoleModal
          key={userForRole.id}
          user={userForRole}
          roles={roles}
          isSaving={isSavingRole}
          onCancel={() => setUserForRole(null)}
          onConfirm={handleChangeRole}
        />
      )}

      <DeleteUserModal
        user={userToDelete}
        isDeleting={isDeleting}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDelete}
      />

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
}
