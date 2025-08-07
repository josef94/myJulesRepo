const API_URL = 'http://localhost:3001/api';

export const saveData = async (data: any) => {
  const response = await fetch(`${API_URL}/data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const loadData = async () => {
  const response = await fetch(`${API_URL}/data`);
  return response.json();
};

export const lock = async (user: string) => {
  const response = await fetch(`${API_URL}/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user }),
  });
  return response.json();
};

export const unlock = async (user: string) => {
  const response = await fetch(`${API_URL}/unlock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user }),
  });
  return response.json();
};
