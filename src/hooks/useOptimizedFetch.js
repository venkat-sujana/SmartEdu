'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Optimized fetch hook with caching, request deduplication, and error handling
 */
export function useOptimizedFetch(url, options = {}) {
  const {
    enabled = true,
    initialData = null,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 60 * 1000, // 1 minute
    onSuccess,
    onError,
    dependencies = [],
  } = options

  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  // Cache reference
  const cacheRef = useRef(new Map())
  const abortControllerRef = useRef(null)

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (!url || !enabled) return

      const cacheKey = url
      const cached = cacheRef.current.get(cacheKey)
      const now = Date.now()

      // Return cached data if still fresh
      if (!skipCache && cached && now - cached.timestamp < staleTime) {
        setData(cached.data)
        return cached.data
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setIsFetching(true)
      if (!cached) setIsLoading(true)

      try {
        const response = await fetch(url, {
          credentials: 'include',
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        // Update cache
        cacheRef.current.set(cacheKey, {
          data: result,
          timestamp: now,
        })

        // Clean old cache entries
        if (cacheRef.current.size > 50) {
          const entries = Array.from(cacheRef.current.entries())
          entries
            .sort((a, b) => a[1].timestamp - b[1].timestamp)
            .slice(0, 10)
            .forEach(([key]) => cacheRef.current.delete(key))
        }

        setData(result)
        setError(null)
        onSuccess?.(result)

        return result
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err)
          onError?.(err)
        }
        throw err
      } finally {
        setIsLoading(false)
        setIsFetching(false)
      }
    },
    [url, enabled, staleTime, onSuccess, onError, ...dependencies]
  )

  // Refetch function
  const refetch = useCallback(() => fetchData(true), [fetchData])

  // Initial fetch
  useEffect(() => {
    fetchData()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  // Background refetch interval
  useEffect(() => {
    if (!url || !enabled || !cacheTime) return

    const interval = setInterval(() => {
      const cached = cacheRef.current.get(url)
      const now = Date.now()

      if (!cached || now - cached.timestamp > cacheTime) {
        fetchData(true)
      }
    }, cacheTime)

    return () => clearInterval(interval)
  }, [url, enabled, cacheTime, fetchData])

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  }
}

/**
 * Hook for paginated data with virtualization support
 */
export function usePaginatedData(items, options = {}) {
  const { pageSize = 10, initialPage = 0, filterFn = null, sortFn = null } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [filters, setFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Process data
  const processedData = useMemo(() => {
    let result = [...items]

    // Apply filters
    if (filterFn) {
      result = result.filter(item => filterFn(item, filters))
    }

    // Apply sorting
    if (sortConfig.key && sortFn) {
      result.sort((a, b) => {
        const comparison = sortFn(a, b, sortConfig.key)
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [items, filters, sortConfig, filterFn, sortFn])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const startIndex = currentPage * pageSize
  const paginatedItems = processedData.slice(startIndex, startIndex + pageSize)

  const goToPage = useCallback(
    page => {
      setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)))
    },
    [totalPages]
  )

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const updateFilters = useCallback(newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(0)
  }, [])

  const updateSort = useCallback(key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
    setCurrentPage(0)
  }, [])

  return {
    items: paginatedItems,
    allItems: processedData,
    currentPage,
    totalPages,
    totalItems: processedData.length,
    pageSize,
    filters,
    sortConfig,
    goToPage,
    nextPage,
    prevPage,
    updateFilters,
    updateSort,
    setCurrentPage,
  }
}

// Import useMemo at the top
import { useMemo } from 'react'
