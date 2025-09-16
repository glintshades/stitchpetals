import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  // Only add content-type and body for methods that support it
  const methodsWithBody = ['POST', 'PUT', 'PATCH'];
  const hasBody = methodsWithBody.includes(method.toUpperCase()) && data;
  
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add admin token for admin endpoints
  if (url.includes('/api/admin/')) {
    const adminToken = localStorage.getItem('admin-token');
    if (adminToken) {
      headers["Authorization"] = `Bearer ${adminToken}`;
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const headers: Record<string, string> = {};
    
    // Add admin token for admin endpoints
    if (url.includes('/api/admin/')) {
      const adminToken = localStorage.getItem('admin-token');
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }
    }
    
    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
