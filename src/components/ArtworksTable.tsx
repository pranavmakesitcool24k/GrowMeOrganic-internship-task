import React, { useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import type { Artwork } from "../types";
import { fetchArtworks } from "../api";
import { Button } from "primereact/button";

type PageState = {
  page: number;
  rows: number;
};

const ArtworksTable: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [pageState, setPageState] = useState<PageState>({ page: 1, rows: 10 });
  const [selectedMap, setSelectedMap] = useState<Map<number, Artwork>>(
    () => new Map()
  );
  const [pageSelection, setPageSelection] = useState<Artwork[]>([]);
  const prevPageSelectionIdsRef = useRef<Set<number>>(new Set());

  const loadPage = React.useCallback(
    async (page: number, rows: number) => {
      setLoading(true);
      try {
        const resp = await fetchArtworks(page, rows);
        setArtworks(resp.data);
        setTotalRecords(resp.total);
        const currentSelected = resp.data.filter((a) => selectedMap.has(a.id));
        setPageSelection(currentSelected);
        prevPageSelectionIdsRef.current = new Set(
          currentSelected.map((r) => r.id)
        );
      } catch (err) {
        console.error("Error fetching artworks", err);
        setArtworks([]);
        setTotalRecords(0);
        setPageSelection([]);
        prevPageSelectionIdsRef.current = new Set();
      } finally {
        setLoading(false);
      }
    },
    [selectedMap]
  );

  useEffect(() => {
    loadPage(pageState.page, pageState.rows);
  }, [pageState.page, pageState.rows, loadPage]);

  function onPageChange(ev: { page: number; rows: number }) {
    const nextPage = ev.page + 1;
    setPageState({ page: nextPage, rows: ev.rows });
  }

  function onSelectionChange(e: { value: Artwork[] }) {
    const newSelection = e.value ?? [];
    const newIds = new Set(
      newSelection
        .filter((r): r is Artwork => r && typeof r.id === "number")
        .map((r) => r.id)
    );
    const prevIds = prevPageSelectionIdsRef.current;
    const mapCopy = new Map(selectedMap);
    for (const item of newSelection) {
      if (!mapCopy.has(item.id)) {
        mapCopy.set(item.id, item);
      }
    }
    for (const prevId of prevIds) {
      if (!newIds.has(prevId)) {
        mapCopy.delete(prevId);
      }
    }
    setSelectedMap(mapCopy);
    setPageSelection(newSelection);
    prevPageSelectionIdsRef.current = new Set(newSelection.map((r) => r.id));
  }

  function deselectItem(id: number) {
    const mapCopy = new Map(selectedMap);
    mapCopy.delete(id);
    setSelectedMap(mapCopy);
    if (artworks.some((a) => a.id === id)) {
      setPageSelection((prev) => prev.filter((p) => p.id !== id));
      prevPageSelectionIdsRef.current.delete(id);
    }
  }

  const header = useMemo(() => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <strong>Art Institute - Artworks</strong>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Fields: title, place_of_origin, artist_display, inscriptions,
            date_start, date_end
          </div>
        </div>
        <div>
          <small>Total selected: {selectedMap.size}</small>
        </div>
      </div>
    );
  }, [selectedMap.size]);

  return (
    <div>
      <div className="selection-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Selected Items</strong>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Selections persist across pages (only selected rows are stored).
            </div>
          </div>
          <div>
            <Button
              label="Clear All"
              className="p-button-text p-button-sm"
              onClick={() => {
                setSelectedMap(new Map());
                setPageSelection([]);
                prevPageSelectionIdsRef.current = new Set();
              }}
            />
          </div>
        </div>

        <div className="selection-list" style={{ marginTop: 8 }}>
          {selectedMap.size === 0 ? (
            <div style={{ color: "#6b7280" }}>No items selected yet.</div>
          ) : (
            Array.from(selectedMap.values()).map((art) => (
              <div key={art.id} className="selection-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {art.title ?? "(no title)"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {art.place_of_origin ?? ""}
                  </div>
                </div>
                <div>
                  <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-sm"
                    onClick={() => deselectItem(art.id)}
                    aria-label={`Deselect ${art.id}`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        style={{
          background: "white",
          padding: 12,
          borderRadius: 8,
          boxShadow: "0 6px 20px rgba(10,10,10,0.05)",
        }}
      >
        <DataTable
          value={artworks}
          header={header}
          loading={loading}
          paginator={false}
          selection={pageSelection}
          onSelectionChange={onSelectionChange}
          selectionMode="checkbox"
          dataKey="id"
          emptyMessage="No records found for this page."
          responsiveLayout="scroll"
        >
          <Column selectionMode="multiple" style={{ width: "3rem" }}></Column>
          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column
            field="artist_display"
            header="Artist Display"
            style={{ width: "30%" }}
          />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Date Start" />
          <Column field="date_end" header="Date End" />
        </DataTable>

        <div
          style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}
        >
          <Paginator
            first={(pageState.page - 1) * pageState.rows}
            rows={pageState.rows}
            totalRecords={totalRecords}
            onPageChange={(e) => onPageChange({ page: e.page, rows: e.rows })}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </div>
      </div>
    </div>
  );
};

export default ArtworksTable;
