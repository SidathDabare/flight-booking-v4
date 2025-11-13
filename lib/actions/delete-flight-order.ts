/**
 * Delete/Cancel a flight order using the Amadeus API
 * This action deletes the order from both Amadeus and the local database
 */

interface DeleteFlightOrderResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  amadeusOrderId?: string;
  status?: string;
  updatedAt?: string;
  amadeusResponse?: unknown;
  error?: string;
  details?: string;
  code?: string;
  title?: string;
}

export async function deleteFlightOrder(orderId: string): Promise<DeleteFlightOrderResponse> {
  try {
    const response = await fetch(`/api/delete-flight-order/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to delete flight order',
        details: data.details,
        code: data.code,
        title: data.title,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error('Error deleting flight order:', error);
    return {
      success: false,
      error: 'Network error occurred while deleting flight order',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}