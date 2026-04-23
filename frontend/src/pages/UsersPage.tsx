import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useI18n } from '../hooks/useI18n';
import { User, Role } from '../types';
import { getErrorMessage } from '../utils/getErrorMessage';

const ROLES: Role[] = ['ADMIN', 'AGENT', 'CLIENT'];

const roleBadge: Record<Role, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/55 dark:text-white dark:ring-1 dark:ring-purple-700/60',
  AGENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/55 dark:text-white dark:ring-1 dark:ring-blue-700/60',
  CLIENT: 'bg-slate-100 text-slate-800 dark:bg-slate-800/90 dark:text-white dark:ring-1 dark:ring-slate-600/60',
};

interface EditState {
  userId: string;
  role: Role;
  active: boolean;
}

interface DeleteState {
  user: User;
}

const UsersPage = () => {
  const { t, formatDate } = useI18n();
  const { users, isLoading, error, fetchUsers, updateUser, removeUser } = useUsers();
  const [editing, setEditing] = useState<EditState | null>(null);
  const [deleting, setDeleting] = useState<DeleteState | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const startEdit = (u: User) => setEditing({ userId: u.id, role: u.role, active: u.active });
  const cancelEdit = () => { setEditing(null); setActionError(null); };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setActionError(null);
    try {
      await updateUser(editing.userId, { role: editing.role, active: editing.active });
      setEditing(null);
    } catch (error) {
      setActionError(getErrorMessage(error, t('users.errorSave')));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    setActionError(null);
    try {
      await removeUser(deleting.user.id);
      setDeleting(null);
    } catch (error) {
      setActionError(getErrorMessage(error, t('users.errorDelete')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">{t('users.title')}</h2>
          <p className="section-subtitle">{t('users.subtitle')}</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          {isLoading ? t('common.loading') : `↺ ${t('users.refresh')}`}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:border dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>
      )}

      <div className="panel-card overflow-hidden p-0">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="sticky top-0" style={{ backgroundColor: 'var(--c-surface-2)' }}>
            <tr>
              {[t('common.name'), t('common.email'), t('common.role'), t('common.status'), t('common.created'), t('common.actions')].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--c-text)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && users.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-sm" style={{ color: 'var(--c-text-2)' }}>{t('common.loading')}</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-sm" style={{ color: 'var(--c-text-2)' }}>{t('users.empty')}</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--c-text)' }}>{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    u.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    {u.active ? t('users.active') : t('users.inactive')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--c-text)' }}>
                  {formatDate(u.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(u)}
                      className="rounded px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => setDeleting({ user: u })}
                      className="rounded px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (() => {
        const u = users.find(x => x.id === editing.userId)!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="modal-card">
              <h3 className="panel-title">{t('users.editUser')}</h3>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--c-text-2)' }}>{u.name} — {u.email}</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--c-text-2)' }}>{t('common.role')}</label>
                  <select
                    value={editing.role}
                    onChange={e => setEditing(s => s && ({ ...s, role: e.target.value as Role }))}
                    className="input-field"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(s => s && ({ ...s, active: !s.active }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editing.active ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      editing.active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className="text-sm" style={{ color: 'var(--c-text-2)' }}>{editing.active ? t('users.active') : t('users.inactive')}</span>
                </div>
              </div>

              {actionError && <p className="mt-3 text-xs text-red-600">{actionError}</p>}

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={cancelEdit} className="btn-ghost">{t('common.cancel')}</button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirm Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="modal-card">
            <h3 className="panel-title">{t('users.deleteUser')}</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--c-text-2)' }}>
              {t('users.deleteWarning')} <strong>{deleting.user.name}</strong> ({deleting.user.email}). {t('users.deleteIrreversible')}
            </p>
            {actionError && <p className="mt-3 text-xs text-red-600">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setDeleting(null); setActionError(null); }} className="btn-ghost">{t('common.cancel')}</button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? t('common.loading') : t('users.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UsersPage;
