export function normalizeApiError(error, { maxUploadMb = 10, maxFiles = 1 } = {}) {
  if (error?.type === 'entity.parse.failed' || error instanceof SyntaxError && error?.status === 400) {
    return apiError(400, ['Du lieu JSON khong hop le. Vui long kiem tra va gui lai.'], false);
  }

  if (error?.code === 'LIMIT_FILE_SIZE') {
    return apiError(413, [`Moi file khong duoc vuot qua ${maxUploadMb}MB.`], false);
  }

  if (error?.code === 'LIMIT_FILE_COUNT') {
    return apiError(413, [`Moi lan gui toi da ${maxFiles} file.`], false);
  }

  if (error?.message === 'UNSUPPORTED_FILE_TYPE') {
    return apiError(400, ['Dinh dang file chua duoc ho tro.'], false);
  }

  if (error?.message === 'UNSUPPORTED_COVER_IMAGE_TYPE') {
    return apiError(400, ['Anh dai dien chi ho tro JPG, PNG hoac WEBP.'], false);
  }

  return apiError(500, ['May chu dang ban. Vui long thu lai.'], true);
}

function apiError(status, errors, log) {
  return {
    status,
    body: {
      ok: false,
      errors,
    },
    log,
  };
}
