import { DataProvider, fetchUtils } from 'react-admin';

const apiUrl = '/api';

const httpClient = (url: string, options: any = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  // OAuth2-Proxy passes authentication headers automatically
  // The backend API requires JWT auth which should be handled by the proxy
  return fetchUtils.fetchJson(url, options);
};

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...params.filter,
      limit: perPage,
      order: order.toLowerCase(),
      page,
    };

    const url = `${apiUrl}/${resource}?${fetchUtils.queryParameters(query)}`;
    const { json } = await httpClient(url);

    // Handle LibreChat's cursor-based pagination
    return {
      data: json.conversations || json.data || json,
      total: json.total || (json.conversations ? json.conversations.length : 100),
    };
  },

  getOne: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const { json } = await httpClient(url);
    return { data: json };
  },

  getMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`).then(({ json }) => json)
    );
    const data = await Promise.all(promises);
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...params.filter,
      [params.target]: params.id,
      limit: perPage,
      order: order.toLowerCase(),
      page,
    };

    const url = `${apiUrl}/${resource}?${fetchUtils.queryParameters(query)}`;
    const { json } = await httpClient(url);

    return {
      data: json.data || json,
      total: json.total || (json.data ? json.data.length : 0),
    };
  },

  create: async (resource, params) => {
    const { json } = await httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: { ...params.data, id: json.id } };
  },

  update: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const { json } = await httpClient(url, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(params.data),
      }).then(({ json }) => json)
    );
    const data = await Promise.all(promises);
    return { data: params.ids };
  },

  delete: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    await httpClient(url, {
      method: 'DELETE',
    });
    return { data: params.previousData };
  },

  deleteMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`, {
        method: 'DELETE',
      })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },
};
