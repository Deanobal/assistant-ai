import { mockClientAccounts } from './mockClients';

const STORAGE_KEY = 'assistantai_client_accounts';

export function loadClientAccounts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockClientAccounts));
    return mockClientAccounts;
  }
  return JSON.parse(stored);
}

export function saveClientAccounts(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function updateClientAccount(clientId, updater) {
  const current = loadClientAccounts();
  const next = current.map((client) => client.id === clientId ? updater(client) : client);
  saveClientAccounts(next);
  return next.find((client) => client.id === clientId);
}