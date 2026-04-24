type ApiLikeError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
      errors?: Array<{
        field?: string;
        message?: string;
      }>;
    };
  };
};

export const getErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado') => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiLikeError;
    const validationErrors = apiError.response?.data?.errors;

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors
        .map((item) => item.message)
        .filter(Boolean)
        .join(' · ');
    }

    return apiError.response?.data?.message ?? apiError.message ?? fallback;
  }

  return fallback;
};
