"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import Map from "@/uhm/components/Map";
import BackgroundLayersPanel from "@/uhm/components/editor/BackgroundLayersPanel";
import TimelineBar from "@/uhm/components/ui/TimelineBar";
import ProjectEntityRefsPanel from "@/uhm/components/editor/ProjectEntityRefsPanel";
import EntityWikiBindingsPanel from "@/uhm/components/editor/EntityWikiBindingsPanel";
import GeometryBindingPanel from "@/uhm/components/editor/GeometryBindingPanel";
import SelectedGeometryPanel from "@/uhm/components/editor/SelectedGeometryPanel";
import WikiSidebarPanel from "@/uhm/components/wiki/WikiSidebarPanel";

import { fetchProjectCommits } from "@/uhm/api/projects";
import { requestJson } from "@/uhm/api/http";
import { API_ENDPOINTS } from "@/uhm/api/config";
import { normalizeEditorSnapshot, getDefaultTypeIdForFeature, normalizeFeatureEntityIds } from "@/uhm/lib/editor/snapshot/editorSnapshot";
import { normalizeTimelineYearValue } from "@/uhm/lib/utils/timeline";
import { isFeatureVisibleAtYear } from "@/uhm/lib/editor/editorPageUtils";
import { buildEntityLabelContextDraft as buildPreviewEntityLabelContextDraft } from "@/uhm/lib/preview/relationIndex";
import { getDirectGeometryChildIds } from "@/uhm/lib/editor/geometry/geometryBinding";
import { ResizeHandle } from "@/uhm/components/ui/ResizeHandle";
import { EMPTY_FEATURE_COLLECTION, WORLD_BBOX } from "@/uhm/lib/map/geo/constants";
import { FIXED_TIMELINE_RANGE, clampYearToFixedRange } from "@/uhm/lib/utils/timeline";
import { loadBackgroundLayerVisibilityFromStorage } from "@/uhm/lib/editor/background/backgroundVisibilityStorage";


import { apiGetSubmissionDetail, updateSubmission } from "@/service/submisisonService";
import { SubmissionItem } from "@/components/tables/SubmissionsTable";
import {
    EditorStoreProvider,
    useEditorStore,
    useEditorStoreApi,
} from "@/uhm/store/editorStore";

import type { Feature, FeatureCollection, GeometryEntitySnapshot, GeometrySnapshot } from "@/uhm/types/geo";
import type { EditorSnapshot, ProjectCommit, EntityWikiLinkSnapshot, Project } from "@/uhm/types/projects";
import type { EntitySnapshot } from "@/uhm/types/entities";
import type { WikiSnapshot } from "@/uhm/types/wiki";

const CURRENT_YEAR = new Date().getUTCFullYear();
const DEFAULT_EDITOR_USER_ID = "admin-viewer";

// Helper functions copied from useProjectCommands.ts to build read-only session snapshot.
function toEditorSessionSnapshot(snapshot: EditorSnapshot): EditorSnapshot {
    return {
        ...snapshot,
        entities: toEditorSessionEntities(snapshot.entities),
        geometries: toEditorSessionGeometries(snapshot.geometries),
        geometry_entity: toEditorSessionGeometryEntity(snapshot.geometry_entity),
        wikis: toEditorSessionWikis(snapshot.wikis),
        entity_wiki: toEditorSessionEntityWikiLinks(snapshot.entity_wiki),
    };
}

function toEditorSessionEntities(input: EditorSnapshot["entities"]): EntitySnapshot[] {
    const rows = Array.isArray(input) ? input : [];
    return rows
        .filter((e): e is any => Boolean(e) && (typeof e.id === "string" || typeof e.id === "number"))
        .filter((e) => e.operation !== "delete")
        .map((e) => {
            const id = String(e.id);
            const source: EntitySnapshot["source"] = e.source === "inline" ? "inline" : "ref";
            return {
                id,
                source,
                operation: "reference",
                name: typeof e.name === "string" ? e.name : undefined,
                description: typeof e.description === "string" ? e.description : e.description ?? null,
                time_start: normalizeTimelineYearValue(e.time_start) ?? undefined,
                time_end: normalizeTimelineYearValue(e.time_end) ?? undefined,
            };
        });
}

function toEditorSessionGeometries(input: EditorSnapshot["geometries"]): GeometrySnapshot[] {
    const rows = Array.isArray(input) ? input : [];
    return rows
        .filter((g): g is any => Boolean(g) && (typeof g.id === "string" || typeof g.id === "number"))
        .filter((g) => g.operation !== "delete")
        .map((g) => {
            const id = String(g.id);
            const source: GeometrySnapshot["source"] = g.source === "inline" ? "inline" : "ref";
            return {
                id,
                source,
                operation: "reference",
                type: g.type ?? undefined,
                draw_geometry: g.draw_geometry,
                geometry: g.geometry,
                bound_with: g.bound_with ?? null,
                time_start: normalizeTimelineYearValue(g.time_start) ?? undefined,
                time_end: normalizeTimelineYearValue(g.time_end) ?? undefined,
                bbox: g.bbox
                    ? {
                        min_lng: g.bbox.min_lng,
                        min_lat: g.bbox.min_lat,
                        max_lng: g.bbox.max_lng,
                        max_lat: g.bbox.max_lat,
                    }
                    : g.bbox ?? undefined,
            };
        });
}

function toEditorSessionGeometryEntity(input: EditorSnapshot["geometry_entity"]): GeometryEntitySnapshot[] {
    const rows = Array.isArray(input) ? input : [];
    const deduped = new globalThis.Map<string, GeometryEntitySnapshot>();
    for (const row of rows) {
        if (!row) continue;
        const safeRow = row as any;
        if (safeRow.operation === "delete") continue;
        const geometry_id = typeof safeRow.geometry_id === "string" || typeof safeRow.geometry_id === "number"
            ? String(safeRow.geometry_id).trim()
            : "";
        const entity_id = typeof safeRow.entity_id === "string" || typeof safeRow.entity_id === "number"
            ? String(safeRow.entity_id).trim()
            : "";
        if (!geometry_id || !entity_id) continue;
        const key = `${geometry_id}::${entity_id}`;
        deduped.set(key, {
            geometry_id,
            entity_id,
            operation: "reference",
        });
    }
    return Array.from(deduped.values()).sort((a, b) => {
        const g = a.geometry_id.localeCompare(b.geometry_id);
        if (g !== 0) return g;
        return a.entity_id.localeCompare(b.entity_id);
    });
}

function toEditorSessionWikis(input: EditorSnapshot["wikis"]): WikiSnapshot[] {
    const rows = Array.isArray(input) ? input : [];
    return rows
        .filter((w): w is any => Boolean(w) && typeof w.id === "string" && w.id.trim().length > 0)
        .filter((w) => w.operation !== "delete")
        .map((w) => {
            const source: WikiSnapshot["source"] = w.source === "inline" ? "inline" : "ref";
            return {
                id: w.id,
                source,
                operation: "reference",
                title: typeof w.title === "string" ? w.title : "",
                slug: w.slug ?? null,
                doc: w.doc ?? null,
            };
        });
}

function toEditorSessionEntityWikiLinks(input: EditorSnapshot["entity_wiki"]): EntityWikiLinkSnapshot[] {
    const rows = Array.isArray(input) ? input : [];
    const deduped = new globalThis.Map<string, EntityWikiLinkSnapshot>();
    for (const row of rows) {
        if (!row) continue;
        const safeRow = row as any;
        if (safeRow.operation === "delete") continue;
        const entity_id = typeof safeRow.entity_id === "string" || typeof safeRow.entity_id === "number"
            ? String(safeRow.entity_id).trim()
            : "";
        const wiki_id = typeof safeRow.wiki_id === "string" || typeof safeRow.wiki_id === "number"
            ? String(safeRow.wiki_id).trim()
            : "";
        if (!entity_id || !wiki_id) continue;
        const key = `${entity_id}::${wiki_id}`;
        deduped.set(key, {
            entity_id,
            wiki_id,
            operation: "reference",
        });
    }
    return Array.from(deduped.values()).sort((a, b) => {
        const e = a.entity_id.localeCompare(b.entity_id);
        if (e !== 0) return e;
        return a.wiki_id.localeCompare(b.wiki_id);
    });
}

export default function SubmissionDetailPage() {
    return (
        <EditorStoreProvider
            options={{
                emptyFeatureCollection: EMPTY_FEATURE_COLLECTION,
                defaultEditorUserId: DEFAULT_EDITOR_USER_ID,
                fallbackTimelineRange: FIXED_TIMELINE_RANGE,
                currentYear: CURRENT_YEAR,
            }}
        >
            <SubmissionDetailPageContent />
        </EditorStoreProvider>
    );
}

// Side Component to set the Zustand store state based on loaded data.
function StoreInitializer({
    project,
    sessionSnapshot,
}: {
    project: Project;
    sessionSnapshot: EditorSnapshot;
}) {
    const store = useEditorStoreApi();
    useEffect(() => {
        if (!project || !sessionSnapshot) return;
        const state = store.getState();
        state.setActiveSection(project);
        state.setSelectedProjectId(project.id);
        state.setBaselineSnapshot(sessionSnapshot);
        state.setBaselineFeatureCollection(sessionSnapshot?.editor_feature_collection || EMPTY_FEATURE_COLLECTION);
        state.setSnapshotEntityRows(sessionSnapshot?.entities || []);
        state.setSnapshotWikis(sessionSnapshot?.wikis || []);
        state.setSnapshotEntityWikiLinks(sessionSnapshot?.entity_wiki || []);
        state.setBackgroundVisibility(loadBackgroundLayerVisibilityFromStorage());
        state.setIsBackgroundVisibilityReady(true);

        // Auto-detect the earliest year from geometries or entities to center the timeline.
        let minYear: number | null = null;
        if (sessionSnapshot?.geometries && sessionSnapshot.geometries.length > 0) {
            for (const g of sessionSnapshot.geometries) {
                if (g.time_start !== undefined && g.time_start !== null) {
                    const y = Number(g.time_start);
                    if (!Number.isNaN(y)) {
                        if (minYear === null || y < minYear) {
                            minYear = y;
                        }
                    }
                }
            }
        }
        if (minYear === null && sessionSnapshot?.entities && sessionSnapshot.entities.length > 0) {
            for (const e of sessionSnapshot.entities) {
                if (e.time_start !== undefined && e.time_start !== null) {
                    const y = Number(e.time_start);
                    if (!Number.isNaN(y)) {
                        if (minYear === null || y < minYear) {
                            minYear = y;
                        }
                    }
                }
            }
        }
        if (minYear !== null) {
            state.setTimelineDraftYear(clampYearToFixedRange(minYear));
        }
    }, [project, sessionSnapshot, store]);

    return null;
}

function clampNumber(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function SubmissionDetailPageContent() {
    const params = useParams();
    const router = useRouter();
    const id = String(params.id || "");

    const [submission, setSubmission] = useState<SubmissionItem | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [sessionSnapshot, setSessionSnapshot] = useState<EditorSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [reviewNote, setReviewNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Retrieve Zustand state
    const {
        baselineFeatureCollection,
        selectedFeatureIds,
        setSelectedFeatureIds,
        timelineDraftYear,
        setTimelineDraftYear,
        backgroundVisibility,
        geometryVisibility,
        snapshotEntityRows,
        snapshotWikis,
        snapshotEntityWikiLinks,
        leftPanelWidth,
        setLeftPanelWidth,
        rightPanelWidth,
        setRightPanelWidth,
        timelineFilterEnabled,
        setTimelineFilterEnabled,
    } = useEditorStore(useShallow((state) => ({
        baselineFeatureCollection: state.baselineFeatureCollection,
        selectedFeatureIds: state.selectedFeatureIds,
        setSelectedFeatureIds: state.setSelectedFeatureIds,
        timelineDraftYear: state.timelineDraftYear,
        setTimelineDraftYear: state.setTimelineDraftYear,
        backgroundVisibility: state.backgroundVisibility,
        geometryVisibility: state.geometryVisibility,
        snapshotEntityRows: state.snapshotEntityRows,
        snapshotWikis: state.snapshotWikis,
        snapshotEntityWikiLinks: state.snapshotEntityWikiLinks,
        leftPanelWidth: state.leftPanelWidth,
        setLeftPanelWidth: state.setLeftPanelWidth,
        rightPanelWidth: state.rightPanelWidth,
        setRightPanelWidth: state.setRightPanelWidth,
        timelineFilterEnabled: state.timelineFilterEnabled,
        setTimelineFilterEnabled: state.setTimelineFilterEnabled,
    })));

    // Fetch submission details and project commit snapshot
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                
                const subRes = await apiGetSubmissionDetail(id);
                if (!subRes || !subRes.status || !subRes.data) {
                    throw new Error("Không thể tải thông tin submission");
                }
                const subData = subRes.data as SubmissionItem;
                setSubmission(subData);
                setReviewNote(subData.review_note || "");

                const projectId = subData.project_id;
                const commits = await fetchProjectCommits(projectId);
                
                const projRes = await requestJson<Project>(`${API_ENDPOINTS.projects}/${encodeURIComponent(projectId)}`);
                setProject(projRes);

                const targetCommit = commits.find((c) => String(c.id) === String(subData.commit_id));
                if (!targetCommit) {
                    throw new Error(`Không tìm thấy commit #${subData.commit_id} của project`);
                }

                const snapshot = normalizeEditorSnapshot(targetCommit.snapshot_json);
                const session = snapshot ? toEditorSessionSnapshot(snapshot) : null;
                setSessionSnapshot(session);
            } catch (err: any) {
                console.error("Error loading submission details:", err);
                setError(err.message || "Lỗi hệ thống");
            } finally {
                setLoading(false);
            }
        }
        if (id) {
            loadData();
        }
    }, [id]);

    // Apply filters based on timeline year
    const activeTimelineYear = timelineDraftYear;
    const activeTimelineFilterEnabled = timelineFilterEnabled;

    const activeMapDraft = useMemo<FeatureCollection>(() => {
        const draft = baselineFeatureCollection || EMPTY_FEATURE_COLLECTION;
        if (!activeTimelineFilterEnabled) return draft;
        return {
            type: "FeatureCollection",
            features: draft.features.filter((f) => isFeatureVisibleAtYear(f, activeTimelineYear)),
        };
    }, [baselineFeatureCollection, activeTimelineFilterEnabled, activeTimelineYear]);

    const mapLabelContextDraft = useMemo<FeatureCollection>(() => {
        return baselineFeatureCollection || EMPTY_FEATURE_COLLECTION;
    }, [baselineFeatureCollection]);

    // Handle review (approve / reject)
    const handleReview = async (status: "APPROVED" | "REJECTED") => {
        if (!submission) return;
        setSubmitting(true);
        try {
            const res = await updateSubmission(submission.id, {
                status,
                review_note: reviewNote,
            });
            if (res?.status) {
                toast.success("Cập nhật trạng thái submission thành công!");
                setSubmission((prev) => prev ? { ...prev, status, review_note: reviewNote } : null);
            } else {
                toast.error(res?.message || "Cập nhật thất bại");
            }
        } catch (err: any) {
            console.error(err);
            toast.error("Lỗi khi cập nhật trạng thái submission");
        } finally {
            setSubmitting(false);
        }
    };

    // Right Sidebar Geometry Choices
    const geometryChoices = useMemo(() => {
        const draft = baselineFeatureCollection || EMPTY_FEATURE_COLLECTION;
        const mapRenderGeometryIds = new Set(
            activeMapDraft.features.map((feature) => String(feature.properties.id))
        );

        const rows = draft.features
            .filter((f) => f && f.properties && (typeof f.properties.id === "string" || typeof f.properties.id === "number"))
            .map((f) => {
                const id = String(f.properties.id);
                const semantic = String(f.properties.type || getDefaultTypeIdForFeature(f) || "").trim();
                const label = semantic.length ? `${semantic} (${f.geometry.type})` : "Geometry";
                const timeStart = normalizeTimelineYearValue(f.properties.time_start);
                const timeEnd = normalizeTimelineYearValue(f.properties.time_end);
                const hasStart = timeStart !== null;
                const hasEnd = timeEnd !== null;
                const timeStatus: "missing" | "partial" | "complete" =
                    !hasStart && !hasEnd
                        ? "missing"
                        : !hasStart || !hasEnd
                            ? "partial"
                            : "complete";
                const isTimelineVisible = mapRenderGeometryIds.has(id);
                const timelineStatus: "off" | "visible" | "filteredOut" = !activeTimelineFilterEnabled
                    ? "off"
                    : isTimelineVisible
                        ? "visible"
                        : "filteredOut";
                return {
                    id,
                    label,
                    time_start: timeStart,
                    time_end: timeEnd,
                    isTimelineVisible,
                    isOrphan: normalizeFeatureEntityIds(f).length === 0,
                    timeStatus,
                    timelineStatus,
                    isNew: false,
                };
            });

        rows.sort((a, b) => {
            const na = String(a.label || a.id);
            const nb = String(b.label || b.id);
            return na.localeCompare(nb);
        });
        return rows;
    }, [baselineFeatureCollection, activeMapDraft, activeTimelineFilterEnabled]);

    // Selected features state resolution
    const selectedFeatures = useMemo<Feature[]>(() => {
        const draft = baselineFeatureCollection || EMPTY_FEATURE_COLLECTION;
        return selectedFeatureIds
            .map((fid) => draft.features.find((f) => f.properties.id === fid) || null)
            .filter((f): f is Feature => Boolean(f));
    }, [baselineFeatureCollection, selectedFeatureIds]);

    const selectedFeature = selectedFeatures[0] || null;

    const selectedGeometryChildIds = useMemo<string[]>(() => {
        if (!selectedFeature) return [];
        return getDirectGeometryChildIds(
            baselineFeatureCollection || EMPTY_FEATURE_COLLECTION,
            String(selectedFeature.properties.id)
        );
    }, [baselineFeatureCollection, selectedFeature]);

    const selectedGeometryTime = useMemo(() => {
        if (!selectedFeature) return null;
        const start = normalizeTimelineYearValue(selectedFeature.properties.time_start);
        const end = normalizeTimelineYearValue(selectedFeature.properties.time_end);
        return { time_start: start, time_end: end };
    }, [selectedFeature]);

    if (loading) {
        return (
            <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0b1220", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", border: "4px solid #1f2937", borderTop: "4px solid #38bdf8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 500 }}>Đang tải dữ liệu bản đồ...</div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error || !submission || !project || !sessionSnapshot) {
        return (
            <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0b1220", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px", color: "#f8fafc" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>{error || "Không thể tìm thấy submission"}</div>
                <button
                    onClick={() => router.push("/submissions")}
                    style={{
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "14px",
                    }}
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#0b1220" }}>
            <style>{`
                html, body {
                    overflow: hidden !important;
                    scrollbar-width: none !important;
                }
                html::-webkit-scrollbar, body::-webkit-scrollbar {
                    display: none !important;
                }
            `}</style>

            {/* Initialize store with project & snapshot data */}
            <StoreInitializer project={project} sessionSnapshot={sessionSnapshot} />

            {/* Left Sidebar showing submission details and review form */}
            <div
                style={{
                    width: leftPanelWidth,
                    background: "#0b1220",
                    borderRight: "1px solid #1f2937",
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    color: "#f8fafc",
                }}
            >
                {/* Header */}
                <div style={{ padding: "16px", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                        onClick={() => router.push("/submissions")}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        title="Quay lại danh sách"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>Chi tiết yêu cầu duyệt</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>#{submission.id.slice(0, 8)}</div>
                    </div>
                </div>

                {/* Info scroll area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Project Title */}
                    <div>
                        <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "6px" }}>Dự án</div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#38bdf8" }}>{submission.project_title}</div>
                        <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px", lineHeight: "1.5" }}>{submission.project_description || "Không có mô tả dự án."}</div>
                    </div>

                    {/* Submitter */}
                    <div>
                        <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "6px" }}>Người gửi</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {submission.user?.avatar_url ? (
                                <img src={submission.user.avatar_url} alt="avatar" style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                            ) : (
                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", color: "#e2e8f0" }}>
                                    {submission.user?.display_name?.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: 600 }}>{submission.user?.display_name || "N/A"}</div>
                                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{submission.user?.email || ""}</div>
                            </div>
                        </div>
                    </div>

                    {/* Meta grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Ngày tạo</div>
                            <div style={{ fontSize: "12px", color: "#e2e8f0" }}>{new Date(submission.created_at).toLocaleString("vi-VN")}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Trạng thái</div>
                            <div>
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        background: submission.status === "PENDING" ? "#eab308" : submission.status === "APPROVED" || submission.status === "SUCCESS" ? "#22c55e" : "#ef4444",
                                        color: "#0f172a",
                                    }}
                                >
                                    {submission.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {submission.content && (
                        <div>
                            <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "6px" }}>Nội dung ghi chú</div>
                            <div style={{ fontSize: "12px", color: "#cbd5e1", background: "#0f172a", padding: "10px", borderRadius: "6px", border: "1px solid #1f2937", whiteSpace: "pre-wrap" }}>
                                {submission.content}
                            </div>
                        </div>
                    )}

                    {/* Review Forms */}
                    <div style={{ borderTop: "1px solid #1f2937", paddingTop: "16px", marginTop: "8px" }}>
                        <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "10px" }}>Đánh giá của Admin</div>
                        
                        {submission.status === "PENDING" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <textarea
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    placeholder="Nhập phản hồi/ghi chú duyệt tại đây..."
                                    style={{
                                        width: "100%",
                                        height: "100px",
                                        background: "#0f172a",
                                        border: "1px solid #1f2937",
                                        borderRadius: "6px",
                                        color: "#cbd5e1",
                                        padding: "8px 10px",
                                        fontSize: "12px",
                                        outline: "none",
                                        resize: "none",
                                    }}
                                />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <button
                                        onClick={() => handleReview("APPROVED")}
                                        disabled={submitting}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "#16a34a",
                                            color: "white",
                                            border: "none",
                                            padding: "10px 12px",
                                            borderRadius: "6px",
                                            cursor: submitting ? "not-allowed" : "pointer",
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            transition: "background 0.2s",
                                        }}
                                    >
                                        {submitting ? "Đang xử lý..." : "Duyệt thông qua"}
                                    </button>
                                    <button
                                        onClick={() => handleReview("REJECTED")}
                                        disabled={submitting}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "#dc2626",
                                            color: "white",
                                            border: "none",
                                            padding: "10px 12px",
                                            borderRadius: "6px",
                                            cursor: submitting ? "not-allowed" : "pointer",
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            transition: "background 0.2s",
                                        }}
                                    >
                                        {submitting ? "Đang xử lý..." : "Từ chối duyệt"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div>
                                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>Người duyệt</div>
                                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>{submission.reviewer?.display_name || "Admin"}</div>
                                </div>
                                {submission.reviewed_at && (
                                    <div>
                                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>Thời gian duyệt</div>
                                        <div style={{ fontSize: "12px", color: "#cbd5e1" }}>{new Date(submission.reviewed_at).toLocaleString("vi-VN")}</div>
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>Ghi chú duyệt</div>
                                    <div style={{ fontSize: "12px", color: "#cbd5e1", background: "#0f172a", padding: "10px", borderRadius: "6px", border: "1px solid #1f2937", minHeight: "40px" }}>
                                        {submission.review_note || "(Không có ghi chú)"}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Resize left panel */}
            <ResizeHandle
                title="Resize left panel"
                onDrag={(deltaX) => {
                    setLeftPanelWidth((prev) => clampNumber(prev + deltaX, 220, 520));
                }}
            />

            {/* Map Area */}
            <div style={{ flex: 1, position: "relative", minHeight: "100vh" }}>
                <Map
                    mode="idle"
                    renderDraft={activeMapDraft}
                    labelContextDraft={mapLabelContextDraft}
                    labelTimelineYear={activeTimelineFilterEnabled ? activeTimelineYear : null}
                    selectedFeatureIds={selectedFeatureIds}
                    onSelectFeatureIds={setSelectedFeatureIds}
                    allowGeometryEditing={false}
                    allowFeatureSelection={true}
                    backgroundVisibility={backgroundVisibility}
                    geometryVisibility={geometryVisibility}
                    applyGeometryBindingFilter={activeTimelineFilterEnabled}
                    hoverPopupEnabled={true}
                />

                <TimelineBar
                    year={activeTimelineYear}
                    onYearChange={setTimelineDraftYear}
                    isLoading={false}
                    disabled={false}
                    statusText={null}
                    filterEnabled={activeTimelineFilterEnabled}
                    onFilterEnabledChange={setTimelineFilterEnabled}
                />
            </div>

            {/* Resize right panel */}
            <ResizeHandle
                title="Resize right panel"
                onDrag={(deltaX) => {
                    setRightPanelWidth((prev) => clampNumber(prev - deltaX, 260, 720));
                }}
            />

            {/* Right Sidebar showing geometry, entities, wikis, and bindings */}
            <BackgroundLayersPanel
                width={rightPanelWidth}
                topContent={
                    <div style={{ display: "grid", gap: "12px" }}>
                        <GeometryBindingPanel
                            geometries={geometryChoices}
                            selectedGeometryId={selectedFeature ? String(selectedFeature.properties.id) : null}
                            selectedGeometryChildIds={selectedGeometryChildIds}
                            onToggleBindGeometryForSelectedGeometry={() => {}} // no-op read-only
                            onFocusGeometry={(id) => {
                                const target = baselineFeatureCollection?.features.find((f) => String(f.properties.id) === String(id));
                                if (target) {
                                    setSelectedFeatureIds([target.properties.id]);
                                }
                            }}
                        />

                        <ProjectEntityRefsPanel
                            onCreateEntityOnly={() => {}}
                            onUpdateEntity={() => {}}
                            hasSelectedGeometry={Boolean(selectedFeature)}
                            selectedGeometryTime={selectedGeometryTime}
                            onToggleBindEntityForSelectedGeometry={() => {}}
                            onRerollEntityId={() => {}}
                            onDeleteEntity={() => {}}
                        />

                        <WikiSidebarPanel
                            projectId={project.id}
                            setWikis={() => {}}
                            onRemoveWiki={() => {}}
                        />

                        <EntityWikiBindingsPanel
                            setLinks={() => {}}
                        />

                        {selectedFeatures.length > 0 ? (
                            <SelectedGeometryPanel
                                selectedFeatures={selectedFeatures}
                                onApplyGeometryMetadata={async () => ({ ok: true })}
                                onDeleteFeatures={() => {}}
                                onDeselectAll={() => setSelectedFeatureIds([])}
                                changeCount={0}
                                onReplayEdit={() => {}}
                                onRerollGeometryId={() => {}}
                            />
                        ) : null}
                    </div>
                }
            />
        </div>
    );
}
