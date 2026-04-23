import { useState, useEffect, useCallback } from 'react';
import { userService, UpdateUserPayload } from '../services/user.service';
import { User } from '../types';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await userService.list();
      setUsers(list ?? []);
    } catch (error) {
      setError(getErrorMessage(error, 'No se pudieron cargar los usuarios'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, payload: UpdateUserPayload) => {
    const updated = await userService.update(id, payload);
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
    return updated;
  }, []);

  const removeUser = useCallback(async (id: string) => {
    await userService.remove(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  return { users, isLoading, error, fetchUsers, updateUser, removeUser };
}
