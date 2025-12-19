/**
 * API client utilities for backend communication
 */

import { env } from "./env";

export interface ApiError {
  error: string;
  message: string;
  timestamp?: string;
}

/**
 * Make an authenticated API request to the backend
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.API_BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    "X-API-Key": env.API_KEY,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: "Request failed",
        message: response.statusText || "An error occurred",
      };
    }
    
    throw new Error(errorData.message || errorData.error || "API request failed");
  }

  return response.json();
}

/**
 * Calculate interest rate
 */
export async function calculateRate(payload: {
  financial: {
    revenue: number;
    ebitda: number;
    debt: number;
    cash_reserves?: number;
  };
  esg: {
    carbon_emissions: number;
    diversity_score?: number | null;
  };
  month: string;
}) {
  return apiRequest<{
    new_interest_rate: number;
    risk_score: number;
    is_compliant: boolean;
    audit_hash: string;
    message: string;
    breakdown: {
      base_rate: number;
      margin: number;
      risk_score: number;
      volatility: number;
      probability_of_default: number;
    };
  }>("/calculate-rate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Calculate risk score
 */
export async function calculateRisk(ebitda_values: number[]) {
  return apiRequest<{
    risk_score: number;
    volatility: number;
    probability_of_default: number;
    message: string;
  }>("/calculate-risk", {
    method: "POST",
    body: JSON.stringify({ ebitda_values }),
  });
}

