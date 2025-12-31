import { AxiosInstance } from "axios";
import { stringify } from "query-string";
import { CrudFilters, DataProvider } from "@refinedev/core";
import { axiosInstance, generateSort, generateFilter } from "./utils";


type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

const handleUnauthorized = () => {  
  window.location.href = '/login';
};

export const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
    getList: async({ resource, pagination, filters, sorters, meta }: { 
        resource: string; 
        pagination?: any; 
        filters?: any; 
        sorters?: any; 
        meta?: any 
    }) => {
        const url = `${apiUrl}/${resource}`;
        console.log('DataProvider getList - Constructed URL:', url);

        const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};

        const { headers: headersFromMeta, method, q, categoryID } = meta ?? {};
        const requestMethod = (method as MethodTypes) ?? "get";

        const queryFilters = generateFilter(filters);

        const query: {
            _start?: number;
            _end?: number,
            _sort?: string,
            _order?: string;
            q?: string;
            categoryID?: string;
        } = {};

        if (mode === "server") {
            query._start = (current - 1) * pageSize;
            query._end = current * pageSize;
        }

        if (q) {
            query.q = q;
        }

        if (categoryID) {
            query.categoryID = categoryID;
        }

        const generatedSort = generateSort(sorters);
        if (generatedSort) {
            const { _sort, _order } = generatedSort;
            query._sort = _sort.join(",");
            query._order = _order.join(",");
        }

        const { data, headers } = await httpClient[requestMethod](
            `${url}?${stringify(query)}&${stringify(queryFilters)}`,
        );

        const total = +headers["X-Total-Count"];

        // Handle the case where data has a 'list' property (your backend structure)
        if (data.list && Array.isArray(data.list)) {
            console.log('DataProvider getList - Using data.list:', data.list);
            return {
                data: data.list,
                total: data.total || data.list.length,
                meta: data.summary,
            };
        }

        // Handle the case where data is directly an array
        if (Array.isArray(data)) {
            console.log('DataProvider getList - Using data directly:', data);
            return {
                data: data,
                total: total || data.length,
            };
        }

        return {
            data: [],
            total: 0,
        }; 
    },
    getMany: async ({ resource, ids, meta}: { resource: string; ids: (string | number)[]; meta?: any }) => {
        const { headers, method, q } = meta ?? {};
        const requestMethod = (method as MethodTypes) ?? "get";
        const { data } = await httpClient[requestMethod](
            `${apiUrl}/${resource}?${stringify({ id: ids })}`,
        );
        
        // Ensure we return an array
        if (Array.isArray(data)) {
            return {
                data,
            };
        }
        
        // Fallback for unexpected data structure
        return {
            data: [],
        };
    },
    create: async ({ resource, variables, meta }: { resource: string; variables: any; meta?: any }) => {
        const url = `${apiUrl}/${resource}`;
        const { headers, method, q } = meta ?? {};
        const requestMethod = (method as MethodTypesWithBody) ?? "post";

        console.log('DataProvider create - Resource:', resource);
        console.log('DataProvider create - Variables:', variables);
        console.log('DataProvider create - Variables type:', typeof variables);
        console.log('DataProvider create - Images field:', variables?.images);
        console.log('DataProvider create - Images field type:', typeof variables?.images);
        console.log('DataProvider create - Images isArray:', Array.isArray(variables?.images));

        const { data } = await httpClient[requestMethod](url, variables);
        return {
            data,
        };
    },
    update: async ({ resource, id, variables, meta }: { resource: string; id: string | number; variables: any; meta?: any }) => {
        const url = `${apiUrl}/${resource}/${id}`;
        const { headers, method, q } = meta ?? {};
        const requestMethod = (method as MethodTypesWithBody) ?? "put";

        const { data } = await httpClient[requestMethod](url, variables);
        return {
            data,
        };
    },
    deleteOne: async ({ resource, id, variables, meta }: { resource: string; id: string | number; variables?: any; meta?: any }) => {
        const url = `${apiUrl}/${resource}/${id}`;
        const { headers, method, q } = meta ?? {};
        const requestMethod = (method as MethodTypesWithBody) ?? "delete";

        const { data } = await httpClient[requestMethod](url, variables);
        return {
            data,
        };
    }, 
    getOne: async ({ resource, id, meta }: { resource: string; id: string | number; meta?: any }) => {
        const url = `${apiUrl}/${resource}/${id}`;
        const { headers, method, q } = meta ?? {};
        const requestMethod = (method as MethodTypes) ?? "get";

        const { data } = await httpClient[requestMethod](url);
        
        // Ensure we return the data in the expected format
        if (data && typeof data === 'object') {
            return {
                data,
            };
        }
        
        // Fallback for unexpected data structure
        return {
            data: null,
        };
    },
    custom: async ({
        url,
        method,
        filters,
        sorters,
        payload,
        query,
        headers,
    }: {
        url: string;
        method: string;
        filters?: any;
        sorters?: any;
        payload?: any;
        query?: any;
        headers?: any;
    }) => {
        let requestUrl = `${url}?`;

        if (sorters) {
            const generatedSort = generateSort(sorters);
            if (generatedSort) {
                const { _sort, _order } = generatedSort ?? {};
                const sortQuery = {
                    _sort: _sort?.join(","),
                    _order: _order?.join(","),
                };
                requestUrl = `${requestUrl}&${stringify(sortQuery)}`;
            }
        }

        if (filters) {
            const filterQuery = generateFilter(filters);
            requestUrl = `${requestUrl}&${stringify(filterQuery)}`;
        }

        if (query) {
            requestUrl = `${requestUrl}&${stringify(query)}`;
        }

        let axiosResponse;
        switch (method) {
            case "put":
            case "post":
            case "patch":
                axiosResponse = await httpClient[method](url, payload, {
                    headers,
                });
                break;
            case "delete":
                axiosResponse = await httpClient.delete(url, {
                    data: payload,
                    headers: { ...headers },
                });
                break;
            default:
                throw new Error(`Unsupported method: ${method}`);
        }

        return axiosResponse!;
    },
    getApiUrl: () => {
        return apiUrl;
    },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);