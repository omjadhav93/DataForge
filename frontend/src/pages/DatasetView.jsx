import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useDatasetStore from '../store/useDatasetStore';
import { apiUrl } from '../lib/api';



/* ─── Debounce hook ─────────────────────────────────────────────────────────── */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─── Pagination component ──────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onPageChange }) {
  const pages = [];
  const delta = 2;
  const left = Math.max(0, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-40"
      >
        <i className="fa-solid fa-chevron-left text-xs" />
      </button>

      {left > 0 && (
        <>
          <button onClick={() => onPageChange(0)} className="w-8 h-8 rounded hover:bg-slate-100 text-sm">1</button>
          {left > 1 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded text-sm font-medium transition-colors ${p === page ? 'bg-brand-600 text-white' : 'hover:bg-slate-100'}`}
        >
          {p + 1}
        </button>
      ))}

      {right < totalPages - 1 && (
        <>
          {right < totalPages - 2 && <span className="px-1 text-slate-400">…</span>}
          <button onClick={() => onPageChange(totalPages - 1)} className="w-8 h-8 rounded hover:bg-slate-100 text-sm">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-40"
      >
        <i className="fa-solid fa-chevron-right text-xs" />
      </button>
    </div>
  );
}

/* ─── Columns Drawer ────────────────────────────────────────────────────────── */
function ColumnsDrawer({ columns, visibleCols, toggleColumn, showAllColumns, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = columns.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="absolute top-16 right-6 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 flex flex-col" style={{ maxHeight: '80vh' }}>
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Columns</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none focus:border-brand-500"
            placeholder="Search columns..."
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-0.5">
        {filtered.map((col) => (
          <label key={col} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={visibleCols.includes(col)}
              onChange={() => toggleColumn(col)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-medium text-slate-700 flex-1">{col}</span>
            <i className="fa-solid fa-grip-lines text-slate-300 text-[10px]" />
          </label>
        ))}
      </div>
      <div className="p-3 border-t border-slate-100 flex items-center justify-between">
        <button onClick={showAllColumns} className="text-brand-600 text-xs font-bold hover:underline">Reset</button>
        <button onClick={onClose} className="bg-brand-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-700">Apply</button>
      </div>
    </div>
  );
}

/* ─── Active Filter Breadcrumbs ─────────────────────────────────────────────── */
function FilterBreadcrumbs({ globalSearch, columnSearch, filters, onClearAll }) {
  const chips = [];

  if (globalSearch) chips.push({ key: 'global', label: `Search: "${globalSearch}"` });

  Object.entries(columnSearch).forEach(([col, val]) => {
    if (val) chips.push({ key: `col-${col}`, label: `${col} contains "${val}"` });
  });

  filters.forEach((f) => {
    if (f.value) {
      chips.push({ key: `filter-${f.id}`, label: `${f.column} = "${f.value}"` });
    }
  });

  if (chips.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-brand-50 border-b border-brand-100 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-slate-500 font-medium">Active:</span>
      {chips.map((chip) => (
        <span key={chip.key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-brand-200 rounded-full text-brand-700 font-medium">
          {chip.label}
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="ml-auto text-slate-500 hover:text-red-500 font-semibold flex items-center gap-1"
      >
        <i className="fa-solid fa-xmark text-[10px]" /> Clear all
      </button>
    </div>
  );
}

/* ─── Filter Builder ────────────────────────────────────────────────────────── */
function FilterBuilder({ columns, filters, addFilter, updateFilter, removeFilter, applyFilters }) {
  return (
    <div className="p-4 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-800">Filters</h3>
      </div>
      <div className="space-y-3">
        {filters.map((f, idx) => (
          <div key={f.id} className="flex items-center gap-2 flex-wrap">
            {idx > 0 && (
              <select
                value={f.conjunction}
                onChange={(e) => updateFilter(f.id, { conjunction: e.target.value })}
                className="w-20 border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold bg-slate-100 focus:outline-none"
              >
                <option>AND</option>
                <option>OR</option>
              </select>
            )}
            <select
              value={f.column}
              onChange={(e) => updateFilter(f.id, { column: e.target.value })}
              className="w-44 border border-slate-200 rounded-md px-2 py-1.5 text-sm bg-slate-50 focus:outline-none"
            >
              {columns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="relative">
              <input
                value={f.value}
                onChange={(e) => updateFilter(f.id, { value: e.target.value })}
                className="border border-slate-200 rounded-md px-3 py-1.5 text-sm w-44 focus:outline-none focus:border-brand-500"
                placeholder="Value…"
              />
              {f.value && (
                <button onClick={() => updateFilter(f.id, { value: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              )}
            </div>
            <button onClick={() => removeFilter(f.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
              <i className="fa-regular fa-trash-can text-sm" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={addFilter}
          className="text-brand-600 text-sm font-semibold flex items-center gap-1.5 hover:underline"
        >
          <i className="fa-solid fa-plus text-xs" /> Add Filter
        </button>
        <button
          onClick={applyFilters}
          className="bg-brand-600 text-white px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

/* ─── Main DatasetView Page ─────────────────────────────────────────────────── */
export default function DatasetView() {
  const navigate = useNavigate();

  const uploadInfo     = useDatasetStore((s) => s.uploadInfo);
  const rows           = useDatasetStore((s) => s.rows);
  const pagination     = useDatasetStore((s) => s.pagination);
  const loading        = useDatasetStore((s) => s.loading);
  const error          = useDatasetStore((s) => s.error);
  const globalSearch   = useDatasetStore((s) => s.globalSearch);
  const setGlobalSearch = useDatasetStore((s) => s.setGlobalSearch);
  const columnSearch   = useDatasetStore((s) => s.columnSearch);
  const setColumnSearch = useDatasetStore((s) => s.setColumnSearch);
  const visibleCols    = useDatasetStore((s) => s.visibleCols);
  const toggleColumn   = useDatasetStore((s) => s.toggleColumn);
  const showAllColumns = useDatasetStore((s) => s.showAllColumns);
  const filters        = useDatasetStore((s) => s.filters);
  const addFilter      = useDatasetStore((s) => s.addFilter);
  const updateFilter   = useDatasetStore((s) => s.updateFilter);
  const removeFilter   = useDatasetStore((s) => s.removeFilter);
  const clearFilters   = useDatasetStore((s) => s.clearFilters);
  const showFilters    = useDatasetStore((s) => s.showFilters);
  const toggleFilters  = useDatasetStore((s) => s.toggleFilters);
  const showColumns    = useDatasetStore((s) => s.showColumns);
  const toggleColumns  = useDatasetStore((s) => s.toggleColumns);
  const fetchRows      = useDatasetStore((s) => s.fetchRows);
  const setSorting     = useDatasetStore((s) => s.setSorting);
  const sortBy         = useDatasetStore((s) => s.sortBy);
  const sortDir        = useDatasetStore((s) => s.sortDir);
  const clearUploadInfo = useDatasetStore((s) => s.clearUploadInfo);
  const setPage        = useDatasetStore((s) => s.setPage);
  const setPageSize    = useDatasetStore((s) => s.setPageSize);

  // Local state for controlled inputs (debounced before triggering fetch)
  const [localGlobal, setLocalGlobal] = useState(globalSearch);
  const [localColSearch, setLocalColSearch] = useState(columnSearch);
  const [activeColMenu, setActiveColMenu] = useState(null);
  const debouncedGlobal = useDebounce(localGlobal, 400);
  const debouncedColSearch = useDebounce(localColSearch, 400);

  // Initial load + Metadata Verification
  useEffect(() => {
    if (!uploadInfo?.tableName) {
      navigate('/');
      return;
    }

    // Fallback for older localStorage caches where visibleCols wasn't saved
    if (visibleCols.length === 0 && uploadInfo.columns?.length > 0) {
      showAllColumns();
    }

    fetch(apiUrl(`/api/datasets/${uploadInfo.tableName}/metadata`))
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(() => {
        fetchRows();
      })
      .catch(() => {
        clearUploadInfo();
        navigate('/');
      });
  }, [uploadInfo?.tableName, navigate, clearUploadInfo]); // eslint-disable-line

  // Trigger fetch when debounced global search changes
  useEffect(() => {
    setGlobalSearch(debouncedGlobal);
    if (uploadInfo) fetchRows({ page: 0 });
  }, [debouncedGlobal]); // eslint-disable-line

  // Trigger fetch when debounced column search changes
  useEffect(() => {
    Object.entries(debouncedColSearch).forEach(([col, val]) => setColumnSearch(col, val));
    if (uploadInfo) fetchRows({ page: 0 });
  }, [debouncedColSearch]); // eslint-disable-line



  const handleColumnSearch = useCallback((col, val) => {
    setLocalColSearch((prev) => ({ ...prev, [col]: val }));
  }, []);

  if (!uploadInfo) return null;

  const columns = uploadInfo.columns ?? [];
  const visibleColumns = columns.filter((c) => visibleCols.includes(c));
  const { page, size, totalRows, totalPages } = pagination;
  const activeFilterCount = filters.filter((f) => f.value).length +
    (localGlobal ? 1 : 0) +
    Object.values(localColSearch).filter(Boolean).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans antialiased text-slate-800 bg-white">

      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 bg-white">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => navigate('/')} className="hover:text-brand-600 transition-colors font-medium flex items-center gap-1">
            <i className="fa-solid fa-database text-xs text-brand-500" /> DataForge
          </button>
          <i className="fa-solid fa-chevron-right text-[10px] text-slate-300" />
          <span className="text-slate-800 font-semibold">{uploadInfo.tableName}</span>
          <span className="ml-2 text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
            {totalRows.toLocaleString()} rows
          </span>
        </nav>
        <div className="flex items-center gap-5">
          <a href="#" className="text-sm text-slate-500 hover:text-brand-600 font-medium">Docs</a>
          <a href="#" className="text-slate-500 hover:text-slate-900">
            <i className="fa-brands fa-github text-xl" />
          </a>
        </div>
      </header>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70 flex-shrink-0">
        {/* Global Search */}
        <div className="relative flex-1 max-w-sm">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={localGlobal}
            onChange={(e) => setLocalGlobal(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
            placeholder="Search across all columns…"
          />
          {localGlobal && (
            <button onClick={() => setLocalGlobal('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={toggleFilters}
          className={`px-4 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-brand-50 text-brand-700 border-brand-300'
              : 'text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <i className="fa-solid fa-filter" />
          Filters {activeFilterCount > 0 && <span className="bg-brand-600 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">{activeFilterCount}</span>}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={() => { clearFilters(); setLocalGlobal(''); setLocalColSearch({}); }}
            className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-1.5"
          >
            <i className="fa-solid fa-xmark" /> Clear All
          </button>
        )}

        <div className="flex-1" />

        {/* Columns button */}
        <button
          onClick={toggleColumns}
          className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            showColumns ? 'bg-brand-50 text-brand-700 border-brand-300' : 'text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <i className="fa-solid fa-table-columns" /> Columns
          <span className="text-[11px] text-slate-400">({visibleColumns.length}/{columns.length})</span>
        </button>
      </div>

      {/* ── Filter Breadcrumbs ───────────────────────────────────────────── */}
      <FilterBreadcrumbs
        globalSearch={localGlobal}
        columnSearch={localColSearch}
        filters={filters}
        onClearAll={() => { clearFilters(); setLocalGlobal(''); setLocalColSearch({}); }}
      />

      {/* ── Filter Builder (collapsible) ─────────────────────────────────── */}
      {showFilters && (
        <FilterBuilder
          columns={columns}
          filters={filters}
          addFilter={addFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
          applyFilters={() => fetchRows({ page: 0 })}
        />
      )}

      {/* ── Pagination header ────────────────────────────────────────────── */}
      <div className="px-6 py-3 flex items-center justify-between text-sm text-slate-500 bg-white border-b border-slate-100 flex-shrink-0">
        <div>
          {loading
            ? <span className="flex items-center gap-2"><i className="fa-solid fa-spinner fa-spin text-brand-500" /> Loading…</span>
            : <span>Showing <b>{page * size + 1}</b> to <b>{Math.min((page + 1) * size, totalRows)}</b> of <b>{totalRows.toLocaleString()}</b> rows</span>
          }
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span>Rows per page:</span>
            <select
              value={size}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-slate-200 rounded-md py-1 pl-2 pr-5 text-sm bg-white focus:outline-none"
            >
              {[20, 50, 100].map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation" /> {error}
        </div>
      )}

      {/* ── Data Table ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto relative">
        {loading && rows.length > 0 && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <i className="fa-solid fa-spinner fa-spin text-brand-500 text-2xl" />
          </div>
        )}

        {rows.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
            <i className="fa-regular fa-folder-open text-5xl" />
            <p className="text-sm font-medium">No rows found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm" style={{ minWidth: `${visibleColumns.length * 160}px` }}>
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="bg-slate-50/80">
                {visibleColumns.map((col) => (
                  <th key={col} className="border-b border-r border-slate-200 p-3 min-w-[140px] relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                        {col}
                        {sortBy === col && (
                          <i className={`fa-solid fa-arrow-${sortDir === 'asc' ? 'up' : 'down'} text-[10px] text-brand-500`} />
                        )}
                      </span>
                      <i 
                        className="fa-solid fa-ellipsis-vertical text-slate-300 text-xs cursor-pointer hover:text-slate-500 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveColMenu(activeColMenu === col ? null : col);
                        }}
                      />
                    </div>
                    {activeColMenu === col && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveColMenu(null)} />
                        <div className="absolute right-2 top-8 w-40 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden font-normal text-xs">
                          <button
                            onClick={() => { setSorting(col, 'asc'); setActiveColMenu(null); }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                          >
                            <i className="fa-solid fa-arrow-down-a-z text-slate-400 w-4 text-center"></i> Sort A-Z
                          </button>
                          <button
                            onClick={() => { setSorting(col, 'desc'); setActiveColMenu(null); }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                          >
                            <i className="fa-solid fa-arrow-down-z-a text-slate-400 w-4 text-center"></i> Sort Z-A
                          </button>
                          <div className="border-t border-slate-100"></div>
                          <button
                            onClick={() => { toggleColumn(col); setActiveColMenu(null); }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-red-600"
                          >
                            <i className="fa-solid fa-eye-slash text-red-400 w-4 text-center"></i> Collapse Column
                          </button>
                        </div>
                      </>
                    )}
                    <div className="relative">
                      <i className="fa-solid fa-magnifying-glass absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400" />
                      <input
                        value={localColSearch[col] ?? ''}
                        onChange={(e) => handleColumnSearch(col, e.target.value)}
                        className="w-full pl-6 pr-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:border-brand-400"
                        placeholder="Search…"
                      />
                    </div>
                  </th>
                ))}
                {/* actions col */}
                <th className="border-b border-slate-200 p-3 w-10 bg-white" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-50/80 transition-colors">
                  {visibleColumns.map((col) => (
                    <td key={col} className="p-4 border-r border-slate-100 text-slate-700 max-w-[260px] truncate">
                      {row[col] == null ? <span className="text-slate-300 italic text-xs">null</span> : String(row[col])}
                    </td>
                  ))}
                  <td className="p-4 text-center">
                    <i className="fa-solid fa-ellipsis-vertical text-slate-300 hover:text-slate-600 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer Pagination ────────────────────────────────────────────── */}
      <div className="px-6 py-3 flex items-center justify-between text-sm text-slate-500 bg-white border-t border-slate-100 flex-shrink-0">
        <div>
          {!loading && totalRows > 0 && (
            <span>Showing <b>{page * size + 1}</b>–<b>{Math.min((page + 1) * size, totalRows)}</b> of <b>{totalRows.toLocaleString()}</b> rows</span>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* ── Columns Drawer Overlay ───────────────────────────────────────── */}
      {showColumns && (
        <>
          <div className="fixed inset-0 z-20" onClick={toggleColumns} />
          <ColumnsDrawer
            columns={columns}
            visibleCols={visibleCols}
            toggleColumn={toggleColumn}
            showAllColumns={showAllColumns}
            onClose={toggleColumns}
          />
        </>
      )}
    </div>
  );
}

