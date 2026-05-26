import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Central Zustand store for dataset state.
 *
 * uploadInfo  – data returned from POST /api/datasets/upload
 *               { datasetId, tableName, rowCount, columns: string[] }
 *
 * rows        – array of row objects from GET /api/datasets/{tableName}/rows
 * pagination  – { page, size, totalRows, totalPages }
 * globalSearch – string applied across all columns
 * columnSearch – { [columnName]: string } per-column header search
 * visibleCols  – Set of column names currently shown
 * filters      – [{ id, conjunction, column, operator, value, value2 }]
 * showFilters  – whether filter panel is expanded
 * showColumns  – whether columns drawer is open
 * loading      – fetch in progress
 * error        – last error string
 */
const useDatasetStore = create(
  persist(
    (set, get) => ({
  // ── Upload result ──────────────────────────────────────────────────────────
  uploadInfo: null, // { datasetId, tableName, rowCount, columns }

  setUploadInfo: (info) =>
    set({
      uploadInfo: info,
      // seed visibleCols from columns list
      visibleCols: info.columns,
      // reset everything else when a new dataset is loaded
      rows: [],
      pagination: { page: 0, size: 20, totalRows: 0, totalPages: 0 },
      globalSearch: '',
      columnSearch: {},
      filters: [],
      sortBy: 'id',
      sortDir: 'asc',
    }),

  clearUploadInfo: () =>
    set({
      uploadInfo: null,
      visibleCols: [],
      rows: [],
      pagination: { page: 0, size: 20, totalRows: 0, totalPages: 0 },
      globalSearch: '',
      columnSearch: {},
      filters: [],
      sortBy: 'id',
      sortDir: 'asc',
    }),

  // ── Table data ─────────────────────────────────────────────────────────────
  rows: [],
  pagination: { page: 0, size: 20, totalRows: 0, totalPages: 0 },
  loading: false,
  error: null,
  sortBy: 'id',
  sortDir: 'asc',
  setSorting: (col, dir) => {
    set({ sortBy: col, sortDir: dir, pagination: { ...get().pagination, page: 0 } });
    get().fetchRows({ page: 0 });
  },

  // ── Search / filter state ──────────────────────────────────────────────────
  globalSearch: '',
  setGlobalSearch: (v) => set({ globalSearch: v }),

  columnSearch: {},
  setColumnSearch: (col, v) =>
    set((s) => ({ columnSearch: { ...s.columnSearch, [col]: v } })),

  // ── Column visibility ──────────────────────────────────────────────────────
  visibleCols: [],
  toggleColumn: (col) =>
    set((s) => {
      const next = s.visibleCols.includes(col)
        ? s.visibleCols.filter((c) => c !== col)
        : [...s.visibleCols, col];
      return { visibleCols: next };
    }),
  showAllColumns: () =>
    set((s) => ({
      visibleCols: s.uploadInfo?.columns ?? [],
    })),

  // ── Filter builder ─────────────────────────────────────────────────────────
  filters: [],
  addFilter: () =>
    set((s) => {
      const firstCol = s.uploadInfo?.columns?.[0] ?? '';
      return {
        filters: [
          ...s.filters,
          {
            id: Date.now(),
            conjunction: s.filters.length === 0 ? '' : 'AND',
            column: firstCol,
            value: '',
          },
        ],
      };
    }),
  updateFilter: (id, patch) =>
    set((s) => ({
      filters: s.filters.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    })),
  removeFilter: (id) =>
    set((s) => ({ filters: s.filters.filter((f) => f.id !== id) })),
  clearFilters: () => set({ filters: [], globalSearch: '', columnSearch: {} }),

  // ── UI panels ──────────────────────────────────────────────────────────────
  showFilters: false,
  toggleFilters: () => set((s) => ({ showFilters: !s.showFilters })),

  showColumns: false,
  toggleColumns: () => set((s) => ({ showColumns: !s.showColumns })),

  // ── Data fetching ──────────────────────────────────────────────────────────
  fetchRows: async ({ page, size } = {}) => {
    const {
      uploadInfo,
      pagination,
      globalSearch,
      columnSearch,
      filters,
      sortBy,
      sortDir,
    } = get();

    if (!uploadInfo?.tableName) return;

    const resolvedPage = page ?? pagination.page;
    const resolvedSize = size ?? pagination.size;

    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams();
      params.set('page', resolvedPage);
      params.set('size', resolvedSize);
      params.set('sortBy', sortBy);
      params.set('sortDir', sortDir);

      if (globalSearch) params.set('search', globalSearch);

      // per-column search appended as extra query params (backend reads allParams)
      Object.entries(columnSearch).forEach(([col, val]) => {
        if (val) params.set(col, val);
      });

      // active filter-builder rows keep their conjunctions as ordered repeated params
      filters.forEach((f, index) => {
        if (!f.value || !f.column) return;

        params.append('filterColumn', f.column);
        params.append('filterValue', f.value);
        params.append('filterConjunction', index === 0 ? 'AND' : (f.conjunction || 'AND'));
      });

      const res = await fetch(
        `/api/datasets/${uploadInfo.tableName}/rows?${params.toString()}`
      );

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();
      // data: { data, totalRows, page, size, totalPages }
      set({
        rows: data.data,
        pagination: {
          page: data.page,
          size: data.size,
          totalRows: data.totalRows,
          totalPages: data.totalPages,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  setPage: (page) => {
    set((s) => ({ pagination: { ...s.pagination, page } }));
    get().fetchRows({ page });
  },

  setPageSize: (size) => {
    set((s) => ({ pagination: { ...s.pagination, size, page: 0 } }));
    get().fetchRows({ size, page: 0 });
  },
  }),
  {
    name: 'dataforge-store',
    partialize: (state) => ({ 
      uploadInfo: state.uploadInfo,
      visibleCols: state.visibleCols 
    }),
  }
));

export default useDatasetStore;


