type ApiLikeError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const getErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado') => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiLikeError;
    return apiError.response?.data?.message ?? apiError.message ?? fallback;
  }

  return fallback;
};
