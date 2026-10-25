(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/history/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>History
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CheckinHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CheckinHistory.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DrinkHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DrinkHistory.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const VIEWS = [
    {
        key: "drinks",
        label: "Intake"
    },
    {
        key: "sleep",
        label: "Sleep"
    }
];
function History() {
    _s();
    const userId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserId"])();
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("drinks");
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // null = not editing
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const drinks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApi"])(userId ? `/drinks?user_id=${userId}` : null, {
        "History.useApi[drinks]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDrinks"])(userId)
    }["History.useApi[drinks]"]);
    const sleep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApi"])(userId ? `/sleep?user_id=${userId}` : null, {
        "History.useApi[sleep]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSleep"])(userId)
    }["History.useApi[sleep]"]);
    const current = view === "drinks" ? drinks : sleep;
    const stopEditing = ()=>{
        setSelected(null);
        setState("idle");
    };
    function toggle(id) {
        setSelected((s)=>{
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }
    async function remove() {
        if (!selected?.size) return;
        setState("deleting");
        try {
            if (view === "drinks") await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDrinks"])(userId, [
                ...selected
            ]);
            else await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteSleep"])(userId, [
                ...selected
            ]);
            stopEditing();
        } catch  {
            setState("error");
        }
    }
    const sel = selected ?? undefined;
    const hasRows = view === "drinks" ? !!drinks.data?.length : !!sleep.data?.length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: 40,
            maxWidth: 560
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            margin: 0
                        },
                        children: "History"
                    }, void 0, false, {
                        fileName: "[project]/app/history/page.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    hasRows && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "link",
                        onClick: ()=>selected ? stopEditing() : setSelected(new Set()),
                        children: selected ? "Done" : "Edit"
                    }, void 0, false, {
                        fileName: "[project]/app/history/page.tsx",
                        lineNumber: 52,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/history/page.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "tablist",
                "aria-label": "History",
                style: {
                    display: "flex",
                    gap: 6
                },
                children: VIEWS.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        role: "tab",
                        "aria-selected": view === v.key,
                        className: "pill",
                        style: {
                            flex: 1
                        },
                        onClick: ()=>{
                            setView(v.key);
                            if (selected) setSelected(new Set());
                            setState("idle");
                        },
                        children: v.label
                    }, v.key, false, {
                        fileName: "[project]/app/history/page.tsx",
                        lineNumber: 60,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/history/page.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            current.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "var(--muted)"
                },
                children: "Couldn't reach the server."
            }, void 0, false, {
                fileName: "[project]/app/history/page.tsx",
                lineNumber: 67,
                columnNumber: 24
            }, this) : view === "drinks" ? drinks.data ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DrinkHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                drinks: drinks.data,
                selected: sel,
                onToggle: toggle
            }, void 0, false, {
                fileName: "[project]/app/history/page.tsx",
                lineNumber: 68,
                columnNumber: 46
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "var(--muted)"
                },
                children: "Loading…"
            }, void 0, false, {
                fileName: "[project]/app/history/page.tsx",
                lineNumber: 68,
                columnNumber: 119
            }, this) : sleep.data ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CheckinHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                checkins: sleep.data,
                selected: sel,
                onToggle: toggle
            }, void 0, false, {
                fileName: "[project]/app/history/page.tsx",
                lineNumber: 69,
                columnNumber: 25
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "var(--muted)"
                },
                children: "Loading…"
            }, void 0, false, {
                fileName: "[project]/app/history/page.tsx",
                lineNumber: 69,
                columnNumber: 101
            }, this),
            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "action-bar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn",
                        onClick: remove,
                        disabled: !selected.size || state === "deleting",
                        children: state === "deleting" ? "Deleting…" : `Delete${selected.size ? ` ${selected.size}` : ""}`
                    }, void 0, false, {
                        fileName: "[project]/app/history/page.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "link",
                        onClick: stopEditing,
                        children: "Cancel"
                    }, void 0, false, {
                        fileName: "[project]/app/history/page.tsx",
                        lineNumber: 76,
                        columnNumber: 11
                    }, this),
                    state === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "0.85rem",
                            color: "var(--red)"
                        },
                        children: "Couldn't delete"
                    }, void 0, false, {
                        fileName: "[project]/app/history/page.tsx",
                        lineNumber: 77,
                        columnNumber: 33
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/history/page.tsx",
                lineNumber: 72,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/history/page.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_s(History, "KCD3iz6k4RhZ9nNC1P792CV5H7U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserId"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApi"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApi"]
    ];
});
_c = History;
var _c;
__turbopack_context__.k.register(_c, "History");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CheckinHistory.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CheckinHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SelectBox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SelectBox.tsx [app-client] (ecmascript)");
;
;
const fmtNight = (iso)=>new Date(`${iso}T12:00:00`).toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
const fmtTime = (iso)=>new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
function CheckinHistory({ checkins, selected, onToggle }) {
    const rows = [
        ...checkins
    ].sort((a, b)=>b.night.localeCompare(a.night));
    if (rows.length === 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        style: {
            color: "var(--muted)",
            fontSize: "0.9rem"
        },
        children: "No check-ins yet."
    }, void 0, false, {
        fileName: "[project]/components/CheckinHistory.tsx",
        lineNumber: 17,
        columnNumber: 33
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: 0,
                    fontSize: "0.95rem"
                },
                children: "Sleep"
            }, void 0, false, {
                fileName: "[project]/components/CheckinHistory.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "caption",
                style: {
                    marginBottom: 12
                },
                children: "When you went to bed, how long it took to fall asleep, and how rested you felt."
            }, void 0, false, {
                fileName: "[project]/components/CheckinHistory.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                style: {
                    listStyle: "none",
                    margin: 0,
                    padding: 0
                },
                children: rows.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        onClick: selected && (()=>onToggle?.(c.night)),
                        style: {
                            display: "grid",
                            gridTemplateColumns: selected ? "auto 1fr auto auto" : "1fr auto auto",
                            gap: 16,
                            alignItems: "baseline",
                            padding: "13px 0",
                            borderBottom: "1px solid var(--border)",
                            fontSize: "0.9rem",
                            cursor: selected ? "pointer" : undefined
                        },
                        children: [
                            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SelectBox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                checked: selected.has(c.night),
                                label: fmtNight(c.night)
                            }, void 0, false, {
                                fileName: "[project]/components/CheckinHistory.tsx",
                                lineNumber: 29,
                                columnNumber: 26
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    fmtNight(c.night),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "num",
                                        style: {
                                            color: "var(--muted)",
                                            marginLeft: 10,
                                            fontSize: "0.75rem"
                                        },
                                        children: [
                                            "bed ",
                                            fmtTime(c.bedtime)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CheckinHistory.tsx",
                                        lineNumber: 30,
                                        columnNumber: 38
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CheckinHistory.tsx",
                                lineNumber: 30,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "num",
                                style: {
                                    color: "var(--muted)",
                                    fontSize: "0.75rem"
                                },
                                children: [
                                    Math.round(c.latency_min),
                                    " min"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CheckinHistory.tsx",
                                lineNumber: 31,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-label": c.rested_1to5 ? `Rested ${c.rested_1to5} of 5` : "Rested not given",
                                className: "hint",
                                "data-hint": c.rested_1to5 ? `Rested ${c.rested_1to5}/5` : "Rested: not given",
                                style: {
                                    display: "flex",
                                    gap: 3,
                                    width: 46,
                                    padding: "8px 0",
                                    margin: "-8px 0",
                                    cursor: "default"
                                },
                                children: [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: 5,
                                            height: 5,
                                            borderRadius: "50%",
                                            background: c.rested_1to5 && n <= c.rested_1to5 ? "var(--text)" : "var(--border)"
                                        }
                                    }, n, false, {
                                        fileName: "[project]/components/CheckinHistory.tsx",
                                        lineNumber: 35,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/CheckinHistory.tsx",
                                lineNumber: 32,
                                columnNumber: 13
                            }, this)
                        ]
                    }, c.night, true, {
                        fileName: "[project]/components/CheckinHistory.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/CheckinHistory.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CheckinHistory.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = CheckinHistory;
var _c;
__turbopack_context__.k.register(_c, "CheckinHistory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/DrinkHistory.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DrinkHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SelectBox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SelectBox.tsx [app-client] (ecmascript)");
;
;
const label = (key)=>key.replace(/_/g, " ").replace(/^\w/, (c)=>c.toUpperCase());
const fmtDay = (d)=>d.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
const fmtTime = (d)=>d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
function DrinkHistory({ drinks, selected, onToggle }) {
    const rows = [
        ...drinks
    ].sort((a, b)=>b.time.localeCompare(a.time));
    // Newest day first, drinks within a day newest first.
    const days = [];
    for (const d of rows){
        const day = fmtDay(new Date(d.time));
        const last = days[days.length - 1];
        if (last?.day === day) {
            last.drinks.push(d);
            last.total += d.mg;
        } else days.push({
            day,
            drinks: [
                d
            ],
            total: d.mg
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: 0,
                    fontSize: "0.95rem"
                },
                children: "Intake"
            }, void 0, false, {
                fileName: "[project]/components/DrinkHistory.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "caption",
                style: {
                    marginBottom: 12
                },
                children: "Everything you've logged in the last two weeks."
            }, void 0, false, {
                fileName: "[project]/components/DrinkHistory.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            days.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "var(--muted)",
                    fontSize: "0.9rem"
                },
                children: "No drinks yet."
            }, void 0, false, {
                fileName: "[project]/components/DrinkHistory.tsx",
                lineNumber: 31,
                columnNumber: 29
            }, this),
            days.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginTop: 20
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                                paddingBottom: 6,
                                borderBottom: "1px solid var(--border)"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: "0.8rem",
                                        color: "var(--muted)"
                                    },
                                    children: g.day
                                }, void 0, false, {
                                    fileName: "[project]/components/DrinkHistory.tsx",
                                    lineNumber: 35,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "num",
                                    style: {
                                        fontSize: "0.75rem",
                                        color: "var(--muted)"
                                    },
                                    children: [
                                        Math.round(g.total),
                                        " mg"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DrinkHistory.tsx",
                                    lineNumber: 36,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DrinkHistory.tsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            style: {
                                listStyle: "none",
                                margin: 0,
                                padding: 0
                            },
                            children: g.drinks.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    onClick: selected && (()=>onToggle?.(d.time)),
                                    style: {
                                        display: "grid",
                                        gridTemplateColumns: selected ? "auto auto 1fr auto" : "auto 1fr auto",
                                        gap: 16,
                                        alignItems: "baseline",
                                        padding: "13px 0",
                                        borderBottom: "1px solid var(--border)",
                                        fontSize: "0.9rem",
                                        cursor: selected ? "pointer" : undefined
                                    },
                                    children: [
                                        selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SelectBox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            checked: selected.has(d.time),
                                            label: `${label(d.drink_key)} at ${fmtTime(new Date(d.time))}`
                                        }, void 0, false, {
                                            fileName: "[project]/components/DrinkHistory.tsx",
                                            lineNumber: 44,
                                            columnNumber: 30
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "num",
                                            style: {
                                                color: "var(--muted)",
                                                fontSize: "0.75rem"
                                            },
                                            children: fmtTime(new Date(d.time))
                                        }, void 0, false, {
                                            fileName: "[project]/components/DrinkHistory.tsx",
                                            lineNumber: 45,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: label(d.drink_key)
                                        }, void 0, false, {
                                            fileName: "[project]/components/DrinkHistory.tsx",
                                            lineNumber: 46,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "num",
                                            style: {
                                                color: "var(--muted)",
                                                fontSize: "0.75rem"
                                            },
                                            children: [
                                                Math.round(d.mg),
                                                " mg"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DrinkHistory.tsx",
                                            lineNumber: 47,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, d.time + d.drink_key, true, {
                                    fileName: "[project]/components/DrinkHistory.tsx",
                                    lineNumber: 40,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/DrinkHistory.tsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this)
                    ]
                }, g.day, true, {
                    fileName: "[project]/components/DrinkHistory.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/components/DrinkHistory.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_c = DrinkHistory;
var _c;
__turbopack_context__.k.register(_c, "DrinkHistory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/SelectBox.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SelectBox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function SelectBox({ checked, label }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        role: "checkbox",
        "aria-checked": checked,
        "aria-label": label,
        style: {
            width: 14,
            height: 14,
            alignSelf: "center",
            borderRadius: 2,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${checked ? "var(--ink)" : "var(--hairline)"}`,
            background: checked ? "var(--ink)" : "transparent",
            transition: "background 0.15s, border-color 0.15s"
        },
        children: checked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "9",
            height: "9",
            viewBox: "0 0 10 10",
            "aria-hidden": true,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M1.5 5.2 4 7.5 8.5 2.5",
                fill: "none",
                stroke: "var(--paper)",
                strokeWidth: "1.5"
            }, void 0, false, {
                fileName: "[project]/components/SelectBox.tsx",
                lineNumber: 16,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/SelectBox.tsx",
            lineNumber: 15,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/SelectBox.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = SelectBox;
var _c;
__turbopack_context__.k.register(_c, "SelectBox");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=_177-adpb-ip10._.js.map