// src/utils/errorHandler.js
import { ApiError } from "@/errors/apiError"

export function handleApiError(error) {

  if (error instanceof ApiError) {

    return Response.json(
      { status: "error", message: error.message },
      { status: error.statusCode }
    )

  }

  return Response.json(
    { status: "error", message: "Internal Server Error" },
    { status: 500 }
  )

}