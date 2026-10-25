(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/sleep/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sleep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lightsOut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lightsOut.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/toast.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const hhmm = (d)=>`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const HERO = {
    margin: "6px 0 0 -0.04em",
    fontSize: "clamp(5.5rem, 26vw, 9.5rem)",
    lineHeight: 0.92,
    fontWeight: 200,
    letterSpacing: "-0.055em",
    fontFeatureSettings: '"tnum"'
};
function Eyebrow({ filled, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        style: {
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.85rem",
            color: "var(--muted)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "aria-hidden": true,
                style: {
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    border: `1px solid ${filled ? "var(--night)" : "var(--ink)"}`,
                    background: filled ? "var(--night)" : "linear-gradient(90deg, var(--ink) 50%, transparent 50%)"
                }
            }, void 0, false, {
                fileName: "[project]/app/sleep/page.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/app/sleep/page.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_c = Eyebrow;
function Sleep() {
    _s();
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [time, setTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sleep.useEffect": ()=>{
            setNow(new Date());
            setTime((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lightsOut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLightsOut"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lightsOut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nightOf"])(new Date())));
            const id = setInterval({
                "Sleep.useEffect.id": ()=>setNow(new Date())
            }["Sleep.useEffect.id"], 15_000);
            return ({
                "Sleep.useEffect": ()=>clearInterval(id)
            })["Sleep.useEffect"];
        }
    }["Sleep.useEffect"], []);
    if (!now) return null;
    return time ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LightsOut, {
        time: time,
        onUndo: ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lightsOut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearLightsOut"])();
            setTime(null);
        }
    }, void 0, false, {
        fileName: "[project]/app/sleep/page.tsx",
        lineNumber: 39,
        columnNumber: 7
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GoingToSleep, {
        now: now,
        onPress: ()=>{
            setTime((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lightsOut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setLightsOut"])(new Date()));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])("Logged");
        }
    }, void 0, false, {
        fileName: "[project]/app/sleep/page.tsx",
        lineNumber: 40,
        columnNumber: 7
    }, this);
}
_s(Sleep, "PEJXLaXwN/XOzhx8CDK02xOVboc=");
_c1 = Sleep;
function LightsOut({ time, onUndo }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: 40,
            maxWidth: 480
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Eyebrow, {
                        filled: true,
                        children: "Lights out at"
                    }, void 0, false, {
                        fileName: "[project]/app/sleep/page.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            ...HERO,
                            color: "var(--night)"
                        },
                        children: time
                    }, void 0, false, {
                        fileName: "[project]/app/sleep/page.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/sleep/page.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    borderTop: "1px solid var(--border)",
                    paddingTop: 24
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            margin: 0,
                            fontSize: "0.95rem"
                        },
                        children: "Sleep well."
                    }, void 0, false, {
                        fileName: "[project]/app/sleep/page.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "caption",
                        children: "We'll ask how it went in the morning."
                    }, void 0, false, {
                        fileName: "[project]/app/sleep/page.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "link",
                        style: {
                            marginTop: 20
                        },
                        onClick: onUndo,
                        children: "Undo"
                    }, void 0, false, {
                        fileName: "[project]/app/sleep/page.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/sleep/page.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/sleep/page.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_c2 = LightsOut;
function GoingToSleep({ now, onPress }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: 40,
            maxWidth: 480
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Eyebrow, {
                        filled: false,
                        children: "It's now"
                    }, void 0, false, {
                        fileName: "[project]/app/sleep/page.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: HERO,
                        children: hhmm(now)
                    }, void 0, false, {
                        fileName: "[project]/app/sleep/page.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/sleep/page.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    borderTop: "1px solid var(--border)",
                    paddingTop: 24
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn",
                        onClick: onPress,
                        style: {
                            background: "var(--paper)",
                            color: "var(--ink)",
                            border: "0.5px solid var(--ink)"
                        },
                        children: "Going to sleep"
                    }, void 0, false, {
                        fileName: "[project]/app/sleep/page.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "caption",
                        style: {
                            marginTop: 14
                        },
                        children: "Press this once the lights are off and you're ready to fall asleep. It fills in tomorrow's check-in for you."
                    }, void 0, false, {
                        fileName: "[project]/app/sleep/page.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/sleep/page.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/sleep/page.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
_c3 = GoingToSleep;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "Eyebrow");
__turbopack_context__.k.register(_c1, "Sleep");
__turbopack_context__.k.register(_c2, "LightsOut");
__turbopack_context__.k.register(_c3, "GoingToSleep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_sleep_page_tsx_0ygv7o6hsomme._.js.map