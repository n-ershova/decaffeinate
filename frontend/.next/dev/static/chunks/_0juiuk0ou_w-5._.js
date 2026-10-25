(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/log/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Log
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CaptureInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CaptureInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConfirmCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ConfirmCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConfirmDrawer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ConfirmDrawer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PresetGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PresetGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UsualSuggestions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/UsualSuggestions.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/toast.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
const label = (key)=>key.replace(/_/g, " ").replace(/^\w/, (c)=>c.toUpperCase());
function Log() {
    _s();
    const userId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserId"])();
    const presets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApi"])("/presets", __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPresets"]);
    const history = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApi"])(userId ? `/drinks?user_id=${userId}` : null, {
        "Log.useApi[history]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDrinks"])(userId)
    }["Log.useApi[history]"]);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // A one-tap pick from Your usual or Common drinks, waiting for confirmation.
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    async function add(d, name) {
        setResult(null);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logDrink"])({
            ...d,
            user_id: userId
        });
        setToast(`Added ${name}, ${Math.round(d.mg)} mg`);
    }
    if (!userId) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: 40
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    margin: 0
                },
                children: "Log a drink"
            }, void 0, false, {
                fileName: "[project]/app/log/page.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            result ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConfirmCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                result: result,
                onConfirm: async (d)=>{
                    await add(d, result.estimate.label);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])("Logged");
                },
                onCancel: ()=>setResult(null)
            }, void 0, false, {
                fileName: "[project]/app/log/page.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CaptureInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                userId: userId,
                onResult: (r)=>{
                    setToast(null);
                    setResult(r);
                    if (r.logged) (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])("Logged");
                },
                onManual: (mg, source)=>add({
                        drink_key: "unknown",
                        mg,
                        mg_low: mg,
                        mg_high: mg,
                        source
                    }, "Unknown")
            }, void 0, false, {
                fileName: "[project]/app/log/page.tsx",
                lineNumber: 43,
                columnNumber: 9
            }, this),
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                style: {
                    margin: "-24px 0 0",
                    fontSize: "0.85rem",
                    color: "var(--muted)"
                },
                children: toast
            }, void 0, false, {
                fileName: "[project]/app/log/page.tsx",
                lineNumber: 50,
                columnNumber: 17
            }, this),
            history.data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UsualSuggestions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                drinks: history.data,
                onPick: (d)=>setPending({
                        drink: {
                            drink_key: d.drink_key,
                            mg: d.mg,
                            mg_low: d.mg_low,
                            mg_high: d.mg_high,
                            source: "preset"
                        },
                        name: label(d.drink_key)
                    })
            }, void 0, false, {
                fileName: "[project]/app/log/page.tsx",
                lineNumber: 53,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: "Common drinks"
                    }, void 0, false, {
                        fileName: "[project]/app/log/page.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    presets.data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PresetGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        presets: presets.data,
                        onPick: (p)=>setPending({
                                drink: {
                                    drink_key: p.key,
                                    mg: p.mg,
                                    mg_low: p.mg_low,
                                    mg_high: p.mg_high,
                                    source: "preset"
                                },
                                name: p.label
                            })
                    }, void 0, false, {
                        fileName: "[project]/app/log/page.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/log/page.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            pending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConfirmDrawer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                name: pending.name,
                mg: pending.drink.mg,
                low: pending.drink.mg_low,
                high: pending.drink.mg_high,
                onConfirm: async ()=>{
                    await add(pending.drink, pending.name);
                    setPending(null);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])("Logged");
                },
                onCancel: ()=>setPending(null)
            }, void 0, false, {
                fileName: "[project]/app/log/page.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/log/page.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(Log, "Gd7smad5xL69tsBUxsH0gY7TpmU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserId"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApi"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApi"]
    ];
});
_c = Log;
var _c;
__turbopack_context__.k.register(_c, "Log");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CameraCapture.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CameraCapture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CameraCapture({ maxSide, onCapture, onCancel, onUnavailable }) {
    _s();
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const streamRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [flash, setFlash] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CameraCapture.useEffect": ()=>{
            let cancelled = false;
            if (!navigator.mediaDevices?.getUserMedia) {
                onUnavailable();
                return;
            }
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                },
                audio: false
            }).then({
                "CameraCapture.useEffect": (stream)=>{
                    if (cancelled) {
                        stream.getTracks().forEach({
                            "CameraCapture.useEffect": (t)=>t.stop()
                        }["CameraCapture.useEffect"]);
                        return;
                    }
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                }
            }["CameraCapture.useEffect"]).catch({
                "CameraCapture.useEffect": ()=>{
                    if (!cancelled) onUnavailable();
                }
            }["CameraCapture.useEffect"]);
            return ({
                "CameraCapture.useEffect": ()=>{
                    cancelled = true;
                    streamRef.current?.getTracks().forEach({
                        "CameraCapture.useEffect": (t)=>t.stop()
                    }["CameraCapture.useEffect"]);
                    streamRef.current = null;
                }
            })["CameraCapture.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["CameraCapture.useEffect"], []);
    function capture() {
        const video = videoRef.current;
        if (!video || !video.videoWidth) return;
        const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        setFlash(true);
        canvas.toBlob((b)=>{
            if (b) setTimeout(()=>onCapture(b), 220);
        }, "image/jpeg", 0.82);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `viewfinder${ready ? " ready" : ""}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                ref: videoRef,
                autoPlay: true,
                playsInline: true,
                muted: true,
                onLoadedMetadata: ()=>setReady(true)
            }, void 0, false, {
                fileName: "[project]/components/CameraCapture.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            !ready && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "viewfinder-status",
                children: "Starting camera…"
            }, void 0, false, {
                fileName: "[project]/components/CameraCapture.tsx",
                lineNumber: 54,
                columnNumber: 18
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "viewfinder-corners",
                "aria-hidden": true,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/components/CameraCapture.tsx",
                        lineNumber: 55,
                        columnNumber: 55
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/components/CameraCapture.tsx",
                        lineNumber: 55,
                        columnNumber: 63
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/components/CameraCapture.tsx",
                        lineNumber: 55,
                        columnNumber: 71
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/components/CameraCapture.tsx",
                        lineNumber: 55,
                        columnNumber: 79
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CameraCapture.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "viewfinder-close",
                onClick: onCancel,
                "aria-label": "Close camera",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    width: "12",
                    height: "12",
                    viewBox: "0 0 12 12",
                    "aria-hidden": true,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M1 1l10 10M11 1L1 11",
                        stroke: "currentColor",
                        strokeWidth: "1.25",
                        strokeLinecap: "round"
                    }, void 0, false, {
                        fileName: "[project]/components/CameraCapture.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/CameraCapture.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CameraCapture.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "shutter",
                onClick: capture,
                disabled: !ready || flash,
                "aria-label": "Take photo"
            }, void 0, false, {
                fileName: "[project]/components/CameraCapture.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            flash && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "viewfinder-flash"
            }, void 0, false, {
                fileName: "[project]/components/CameraCapture.tsx",
                lineNumber: 62,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CameraCapture.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_s(CameraCapture, "0vu6hBRl81UE1a84XdF2jYJWBFQ=");
_c = CameraCapture;
var _c;
__turbopack_context__.k.register(_c, "CameraCapture");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CaptureInput.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CaptureInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CameraCapture$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CameraCapture.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const MAX_SIDE = 1024;
const TIMEOUT_MS = 12_000;
const MAX_MANUAL_MG = 1000; // matches the backend's one-drink ceiling
/** Downscale to at most MAX_SIDE px on the long edge and re-encode as JPEG. */ async function downscale(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject)=>canvas.toBlob((b)=>b ? resolve(b) : reject(new Error("encode failed")), "image/jpeg", 0.82));
}
function withTimeout(p, ms) {
    return Promise.race([
        p,
        new Promise((_, reject)=>setTimeout(()=>reject(new Error("timeout")), ms))
    ]);
}
function CaptureInput({ userId, onResult, onManual }) {
    _s();
    const fileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const textRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const manualRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [manual, setManual] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // source of the unmatched attempt
    const [mg, setMg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [cameraOpen, setCameraOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // A photo we can't read sends people to the description box; a description we can't match just says so.
    // Either way, the caffeine amount can be typed in directly.
    function unmatched(source, result) {
        if (onManual) {
            setManual(source);
            setMg("");
        }
        if (source === "text") {
            setMessage(result ? "No drink matched." : "Couldn\u2019t check that. Try again.");
            requestAnimationFrame(()=>manualRef.current?.focus({
                    preventScroll: true
                }));
            return;
        }
        const lead = result?.gemini.analysis?.category === "not_a_drink" ? "That doesn\u2019t look like a drink." : "Couldn\u2019t make out the drink.";
        setMessage(`${lead} Try describing it.`);
        requestAnimationFrame(()=>textRef.current?.focus({
                preventScroll: true
            }));
    }
    const manualMg = Number(mg);
    const manualValid = mg.trim() !== "" && Number.isFinite(manualMg) && manualMg > 0 && manualMg <= MAX_MANUAL_MG;
    function logManual(e) {
        e.preventDefault();
        if (!manualValid || !manual || !onManual) return;
        onManual(Math.round(manualMg), manual);
        setManual(null);
        setMessage(null);
        setMg("");
    }
    async function send(input) {
        setBusy(true);
        setMessage(null);
        setManual(null);
        try {
            const result = await withTimeout((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["identifyDrink"])({
                ...input,
                user_id: userId
            }), TIMEOUT_MS);
            if (result.estimate.drink_key === "unknown") {
                unmatched(input.source, result);
                return;
            }
            onResult(result);
            setText("");
        } catch  {
            unmatched(input.source);
        } finally{
            setBusy(false);
        }
    }
    async function onFile(e) {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-picking the same file
        if (!file) return;
        let image = file;
        try {
            image = await downscale(file);
        } catch  {}
        send({
            image,
            source: "photo"
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "aria-busy": busy,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: 12,
                    alignItems: "center"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `photo-action${busy ? " busy" : ""}`,
                        onClick: ()=>setCameraOpen(true),
                        disabled: busy || cameraOpen,
                        "aria-label": busy ? "Recognising" : "Photograph your drink",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "camera-btn",
                                "aria-hidden": true,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "22",
                                    height: "22",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "1.25",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M3 8.5A1.5 1.5 0 0 1 4.5 7h2.6l1.4-2h7l1.4 2h2.6A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CaptureInput.tsx",
                                            lineNumber: 110,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                            cx: "12",
                                            cy: "13",
                                            r: "3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CaptureInput.tsx",
                                            lineNumber: 111,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CaptureInput.tsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/CaptureInput.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: busy ? "Recognising\u2026" : "Photo"
                            }, void 0, false, {
                                fileName: "[project]/components/CaptureInput.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CaptureInput.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: fileRef,
                        type: "file",
                        accept: "image/*",
                        capture: "environment",
                        onChange: onFile,
                        hidden: true
                    }, void 0, false, {
                        fileName: "[project]/components/CaptureInput.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CaptureInput.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            cameraOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CameraCapture$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                maxSide: MAX_SIDE,
                onCapture: (image)=>{
                    setCameraOpen(false);
                    send({
                        image,
                        source: "photo"
                    });
                },
                onCancel: ()=>setCameraOpen(false),
                // No camera access (permission denied, http origin, no device): fall back to the file picker.
                onUnavailable: ()=>{
                    setCameraOpen(false);
                    fileRef.current?.click();
                }
            }, void 0, false, {
                fileName: "[project]/components/CaptureInput.tsx",
                lineNumber: 120,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "or-divider",
                "aria-hidden": true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "or"
                }, void 0, false, {
                    fileName: "[project]/components/CaptureInput.tsx",
                    lineNumber: 129,
                    columnNumber: 47
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CaptureInput.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                className: "inline-field",
                onSubmit: (e)=>{
                    e.preventDefault();
                    if (text.trim()) send({
                        text: text.trim(),
                        source: "text"
                    });
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: textRef,
                        value: text,
                        onChange: (e)=>setText(e.target.value),
                        disabled: busy,
                        placeholder: "Describe it, e.g. large oat flat white",
                        "aria-label": "Describe your drink",
                        maxLength: 300
                    }, void 0, false, {
                        fileName: "[project]/components/CaptureInput.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Submit, {
                        label: "Add",
                        hidden: !text.trim(),
                        disabled: busy
                    }, void 0, false, {
                        fileName: "[project]/components/CaptureInput.tsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CaptureInput.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "caption",
                style: {
                    margin: "12px 0 0"
                },
                children: message
            }, void 0, false, {
                fileName: "[project]/components/CaptureInput.tsx",
                lineNumber: 142,
                columnNumber: 19
            }, this),
            manual && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                className: "manual-row",
                onSubmit: logManual,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "manual-mg",
                        children: "Know the caffeine?"
                    }, void 0, false, {
                        fileName: "[project]/components/CaptureInput.tsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-field",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "manual-mg",
                                ref: manualRef,
                                className: "num",
                                type: "number",
                                inputMode: "numeric",
                                min: 1,
                                max: MAX_MANUAL_MG,
                                step: 1,
                                value: mg,
                                onChange: (e)=>setMg(e.target.value),
                                placeholder: "80",
                                style: {
                                    flex: "none",
                                    width: "4ch"
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/CaptureInput.tsx",
                                lineNumber: 148,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "unit",
                                children: "mg"
                            }, void 0, false, {
                                fileName: "[project]/components/CaptureInput.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CaptureInput.tsx",
                        lineNumber: 147,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Submit, {
                        label: "Log caffeine",
                        hidden: !manualValid
                    }, void 0, false, {
                        fileName: "[project]/components/CaptureInput.tsx",
                        lineNumber: 155,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CaptureInput.tsx",
                lineNumber: 145,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CaptureInput.tsx",
        lineNumber: 101,
        columnNumber: 5
    }, this);
}
_s(CaptureInput, "5tcAWKQF1CxJmL0NtEf4pgeT1r8=");
_c = CaptureInput;
/** Round arrow that only shows once there's something to submit. */ function Submit({ label, hidden, disabled }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "submit",
        className: `arrow-submit${hidden ? " idle" : ""}`,
        disabled: hidden || disabled,
        "aria-label": label,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 14 14",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.25",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": true,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M2 7h10M8 3l4 4-4 4"
            }, void 0, false, {
                fileName: "[project]/components/CaptureInput.tsx",
                lineNumber: 168,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/CaptureInput.tsx",
            lineNumber: 166,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/CaptureInput.tsx",
        lineNumber: 165,
        columnNumber: 5
    }, this);
}
_c1 = Submit;
var _c, _c1;
__turbopack_context__.k.register(_c, "CaptureInput");
__turbopack_context__.k.register(_c1, "Submit");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ConfirmCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConfirmCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DrinkDetails$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DrinkDetails.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const BASIS = {
    label: "From the label",
    product: "Brand\u2019s published figure",
    volume: "Typical, scaled to the serving",
    table: "Typical for this drink"
};
// §6.5: café drinks are stored per shot; regular assumes 2 shots, large 3.
const PER_SHOT = new Set([
    "espresso_shot",
    "milk_coffee",
    "americano",
    "mocha"
]);
const SHOT = {
    mg: 65,
    low: 50,
    high: 100
};
const SIZE_SHOTS = {
    small: 1,
    regular: 2,
    large: 3
};
const SIZE_SCALE = {
    small: 0.75,
    regular: 1,
    large: 1.5
};
const DECAF = {
    mg: 5,
    low: 2,
    high: 15
};
function recalc(base, key, baseSize, shots, size, decaf) {
    const v = regular(base, key, baseSize, shots, size);
    // Decaf only ever lowers caffeine (as in lookup.py): water and herbal tea stay at 0.
    return decaf ? {
        mg: Math.min(v.mg, DECAF.mg),
        mg_low: Math.min(v.mg_low, DECAF.low),
        mg_high: Math.min(v.mg_high, DECAF.high)
    } : v;
}
function regular(base, key, baseSize, shots, size) {
    // Branded products carry their own per-size figures.
    const sized = base.sizes?.[size];
    if (sized) return {
        mg: sized.mg,
        mg_low: sized.mg_low,
        mg_high: sized.mg_high
    };
    if (PER_SHOT.has(key)) {
        const extra = key === "mocha" ? 10 : 0;
        return {
            mg: SHOT.mg * shots + extra,
            mg_low: SHOT.low * shots + extra,
            mg_high: SHOT.high * shots + extra
        };
    }
    const k = SIZE_SCALE[size] / SIZE_SCALE[baseSize];
    return {
        mg: base.mg * k,
        mg_low: base.mg_low * k,
        mg_high: base.mg_high * k
    };
}
function ConfirmCard({ result, onConfirm, onCancel, source = "photo" }) {
    _s();
    const { estimate, gemini, logged } = result;
    const baseSize = estimate.size ?? gemini.size ?? "regular";
    const [shots, setShots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(gemini.shots ?? SIZE_SHOTS[baseSize]);
    const [size, setSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(baseSize);
    const [decaf, setDecaf] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(gemini.decaf);
    const analysis = gemini.analysis;
    // Gemini's headline is more specific ("Pret oat flat white"); fall back to the lookup label.
    const name = analysis?.verdict || estimate.label;
    if (estimate.drink_key === "unknown") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        margin: 0,
                        fontSize: "1.1rem"
                    },
                    children: analysis?.category === "not_a_drink" ? "That doesn\u2019t look like a drink." : "We couldn\u2019t tell what that was."
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmCard.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this),
                analysis?.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "caption",
                    style: {
                        margin: "8px 0 0"
                    },
                    children: analysis.description
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmCard.tsx",
                    lineNumber: 64,
                    columnNumber: 35
                }, this),
                !!analysis?.image_issues?.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "caption",
                    style: {
                        margin: "4px 0 0"
                    },
                    children: [
                        "Try again: ",
                        analysis.image_issues.join(", "),
                        "."
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ConfirmCard.tsx",
                    lineNumber: 66,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        margin: "4px 0 16px",
                        fontSize: "0.85rem",
                        color: "var(--muted)"
                    },
                    children: "Pick a preset or describe it instead."
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmCard.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "link",
                    onClick: onCancel,
                    children: "Dismiss"
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmCard.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ConfirmCard.tsx",
            lineNumber: 60,
            columnNumber: 7
        }, this);
    }
    if (logged) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Summary, {
                    label: name,
                    mg: logged.mg,
                    low: logged.mg_low,
                    high: logged.mg_high
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmCard.tsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DrinkDetails$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    gemini: gemini
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmCard.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 16
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: "0.85rem",
                                color: "var(--muted)"
                            },
                            children: "Logged"
                        }, void 0, false, {
                            fileName: "[project]/components/ConfirmCard.tsx",
                            lineNumber: 80,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "link",
                            onClick: onCancel,
                            children: "Undo"
                        }, void 0, false, {
                            fileName: "[project]/components/ConfirmCard.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ConfirmCard.tsx",
                    lineNumber: 79,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ConfirmCard.tsx",
            lineNumber: 76,
            columnNumber: 7
        }, this);
    }
    // On café drinks size and shots are the same question, so keep them in step.
    const perShot = PER_SHOT.has(estimate.drink_key) && !estimate.sizes;
    const pickSize = (s)=>{
        setSize(s);
        if (perShot) setShots(SIZE_SHOTS[s]);
    };
    const pickShots = (n)=>{
        setShots(n);
        if (perShot) setSize(Object.keys(SIZE_SHOTS).find((k)=>SIZE_SHOTS[k] === n) ?? size);
    };
    const v = recalc(estimate, estimate.drink_key, baseSize, shots, size, decaf);
    const caffeinated = regular(estimate, estimate.drink_key, baseSize, shots, size).mg_high > 0;
    const needs = new Set(estimate.needs);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Summary, {
                label: decaf && caffeinated && !gemini.decaf ? `${name} (decaf)` : name,
                mg: v.mg,
                low: v.mg_low,
                high: v.mg_high
            }, void 0, false, {
                fileName: "[project]/components/ConfirmCard.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            estimate.basis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "caption",
                style: {
                    margin: "6px 0 0"
                },
                children: decaf ? BASIS.table : BASIS[estimate.basis]
            }, void 0, false, {
                fileName: "[project]/components/ConfirmCard.tsx",
                lineNumber: 101,
                columnNumber: 26
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DrinkDetails$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                gemini: gemini
            }, void 0, false, {
                fileName: "[project]/components/ConfirmCard.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            needs.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 20
                },
                children: [
                    needs.has("shots") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Chips, {
                        label: "Shots",
                        options: [
                            [
                                1,
                                "Single"
                            ],
                            [
                                2,
                                "Double"
                            ],
                            [
                                3,
                                "Triple"
                            ]
                        ],
                        value: shots,
                        onPick: pickShots
                    }, void 0, false, {
                        fileName: "[project]/components/ConfirmCard.tsx",
                        lineNumber: 107,
                        columnNumber: 13
                    }, this),
                    needs.has("size") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Chips, {
                        label: "Size",
                        options: [
                            [
                                "small",
                                "S"
                            ],
                            [
                                "regular",
                                "M"
                            ],
                            [
                                "large",
                                "L"
                            ]
                        ],
                        value: size,
                        onPick: pickSize
                    }, void 0, false, {
                        fileName: "[project]/components/ConfirmCard.tsx",
                        lineNumber: 110,
                        columnNumber: 13
                    }, this),
                    needs.has("decaf") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Chips, {
                        label: "Caffeine",
                        options: [
                            [
                                false,
                                "Regular"
                            ],
                            [
                                true,
                                "Decaf"
                            ]
                        ],
                        value: decaf,
                        onPick: setDecaf
                    }, void 0, false, {
                        fileName: "[project]/components/ConfirmCard.tsx",
                        lineNumber: 113,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ConfirmCard.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                    marginTop: 24
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn",
                        onClick: ()=>onConfirm({
                                drink_key: decaf && caffeinated ? "decaf" : estimate.drink_key,
                                mg: Math.round(v.mg),
                                mg_low: Math.round(v.mg_low),
                                mg_high: Math.round(v.mg_high),
                                source
                            }),
                        children: "Log it"
                    }, void 0, false, {
                        fileName: "[project]/components/ConfirmCard.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "link",
                        onClick: onCancel,
                        children: "Cancel"
                    }, void 0, false, {
                        fileName: "[project]/components/ConfirmCard.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ConfirmCard.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ConfirmCard.tsx",
        lineNumber: 99,
        columnNumber: 5
    }, this);
}
_s(ConfirmCard, "e0Mbw0xU+csB61jt96Cs48ml8Pk=");
_c = ConfirmCard;
function Card({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            borderTop: "1px solid var(--text)",
            borderBottom: "1px solid var(--border)",
            padding: "20px 0 24px"
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/components/ConfirmCard.tsx",
        lineNumber: 135,
        columnNumber: 10
    }, this);
}
_c1 = Card;
function Summary({ label, mg, low, high }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: 0,
                    fontSize: "0.95rem"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/components/ConfirmCard.tsx",
                lineNumber: 141,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: "6px 0 0",
                    display: "flex",
                    alignItems: "baseline"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "3rem",
                            lineHeight: 1,
                            fontWeight: 200,
                            letterSpacing: "-0.04em",
                            fontFeatureSettings: '"tnum"'
                        },
                        children: Math.round(mg)
                    }, void 0, false, {
                        fileName: "[project]/components/ConfirmCard.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            marginLeft: 6,
                            color: "var(--muted)"
                        },
                        children: "mg"
                    }, void 0, false, {
                        fileName: "[project]/components/ConfirmCard.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    Math.round(low) !== Math.round(high) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            marginLeft: 12,
                            fontSize: "0.82rem",
                            color: "var(--muted)"
                        },
                        children: [
                            "likely ",
                            Math.round(low),
                            "–",
                            Math.round(high)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ConfirmCard.tsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ConfirmCard.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ConfirmCard.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
_c2 = Summary;
function Chips({ label, options, value, onPick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "radiogroup",
        "aria-label": label,
        style: {
            display: "flex",
            gap: 6,
            alignItems: "center"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    width: 80,
                    fontSize: "0.8rem",
                    color: "var(--muted)"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/components/ConfirmCard.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            options.map(([v, text])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    role: "radio",
                    "aria-checked": v === value,
                    className: "pill",
                    onClick: ()=>onPick(v),
                    children: text
                }, String(v), false, {
                    fileName: "[project]/components/ConfirmCard.tsx",
                    lineNumber: 160,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/components/ConfirmCard.tsx",
        lineNumber: 157,
        columnNumber: 5
    }, this);
}
_c3 = Chips;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "ConfirmCard");
__turbopack_context__.k.register(_c1, "Card");
__turbopack_context__.k.register(_c2, "Summary");
__turbopack_context__.k.register(_c3, "Chips");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ConfirmDrawer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConfirmDrawer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ConfirmDrawer({ name, mg, low, high, onConfirm, onCancel }) {
    _s();
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const confirm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConfirmDrawer.useEffect": ()=>{
            confirm.current?.focus();
        }
    }["ConfirmDrawer.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConfirmDrawer.useEffect": ()=>{
            const onKey = {
                "ConfirmDrawer.useEffect.onKey": (e)=>{
                    if (e.key === "Escape" && !saving) onCancel();
                }
            }["ConfirmDrawer.useEffect.onKey"];
            window.addEventListener("keydown", onKey);
            return ({
                "ConfirmDrawer.useEffect": ()=>window.removeEventListener("keydown", onKey)
            })["ConfirmDrawer.useEffect"];
        }
    }["ConfirmDrawer.useEffect"], [
        onCancel,
        saving
    ]);
    async function save() {
        setSaving(true);
        setError(false);
        try {
            await onConfirm();
        } catch  {
            setError(true);
            setSaving(false);
        }
    }
    const range = Math.round(low) !== Math.round(high) ? `${Math.round(low)}–${Math.round(high)} mg` : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "confirm-title",
        className: "drawer-backdrop",
        onClick: (e)=>{
            if (e.target === e.currentTarget && !saving) onCancel();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "drawer",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "eyebrow",
                    children: "Log this drink?"
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmDrawer.tsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    id: "confirm-title",
                    style: {
                        margin: 0,
                        fontSize: "2rem",
                        fontWeight: 200,
                        letterSpacing: "-0.035em"
                    },
                    children: name
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmDrawer.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        margin: "12px 0 0",
                        display: "flex",
                        alignItems: "baseline",
                        gap: 10
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "num",
                            style: {
                                fontSize: "1.25rem"
                            },
                            children: [
                                Math.round(mg),
                                " mg"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ConfirmDrawer.tsx",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this),
                        range && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "num",
                            style: {
                                fontSize: "0.8rem",
                                color: "var(--muted)"
                            },
                            children: range
                        }, void 0, false, {
                            fileName: "[project]/components/ConfirmDrawer.tsx",
                            lineNumber: 48,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ConfirmDrawer.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        margin: "16px 0 0",
                        fontSize: "0.85rem",
                        color: "var(--red)"
                    },
                    children: "Couldn't save. Try again."
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmDrawer.tsx",
                    lineNumber: 51,
                    columnNumber: 19
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginTop: 28
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            ref: confirm,
                            className: "btn",
                            onClick: save,
                            disabled: saving,
                            children: saving ? "Logging…" : "Log it"
                        }, void 0, false, {
                            fileName: "[project]/components/ConfirmDrawer.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "link",
                            onClick: onCancel,
                            disabled: saving,
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/components/ConfirmDrawer.tsx",
                            lineNumber: 55,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ConfirmDrawer.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ConfirmDrawer.tsx",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ConfirmDrawer.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(ConfirmDrawer, "3fYE9HG3TSdtNxjL5mL2NnQgLcI=");
_c = ConfirmDrawer;
var _c;
__turbopack_context__.k.register(_c, "ConfirmDrawer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/DrinkDetails.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DrinkDetails
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const label = (key)=>key.replace(/_/g, " ").replace(/^\w/, (c)=>c.toUpperCase());
const muted = {
    color: "var(--muted)"
};
function DrinkDetails({ gemini }) {
    const a = gemini.analysis;
    if (!a) return null;
    const serving = [
        a.volume_ml ? `${Math.round(a.volume_ml)} ml` : null,
        a.volume_source === "printed" ? "printed" : null,
        gemini.size,
        a.temperature
    ].filter(Boolean).join(" · ");
    const rows = [
        [
            "Brand",
            gemini.brand
        ],
        [
            "Product",
            a.product_name
        ],
        [
            "Serving",
            serving
        ],
        [
            "Milk",
            a.milk
        ],
        [
            "Extras",
            a.additions?.join(", ")
        ],
        [
            "Shots",
            gemini.shots ? String(gemini.shots) : null
        ],
        [
            "On label",
            a.printed_caffeine
        ]
    ];
    const shown = rows.filter(([, v])=>v);
    const why = (a.evidence?.length ?? 0) + (a.visible_text?.length ?? 0) + (a.alternatives?.length ?? 0) + (a.image_issues?.length ?? 0) > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            marginTop: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "caption",
                style: {
                    margin: 0
                },
                children: a.description
            }, void 0, false, {
                fileName: "[project]/components/DrinkDetails.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "caption",
                style: {
                    margin: "4px 0 0"
                },
                children: [
                    Math.round(gemini.confidence * 100),
                    "% sure",
                    gemini.decaf ? " · decaf" : ""
                ]
            }, void 0, true, {
                fileName: "[project]/components/DrinkDetails.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            shown.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "80px 1fr",
                    rowGap: 6,
                    margin: "16px 0 0",
                    fontSize: "0.85rem"
                },
                children: shown.map(([k, v])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "contents"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                style: {
                                    fontSize: "0.8rem",
                                    ...muted
                                },
                                children: k
                            }, void 0, false, {
                                fileName: "[project]/components/DrinkDetails.tsx",
                                lineNumber: 44,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                style: {
                                    margin: 0
                                },
                                children: v
                            }, void 0, false, {
                                fileName: "[project]/components/DrinkDetails.tsx",
                                lineNumber: 45,
                                columnNumber: 15
                            }, this)
                        ]
                    }, k, true, {
                        fileName: "[project]/components/DrinkDetails.tsx",
                        lineNumber: 43,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/DrinkDetails.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this),
            why && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                style: {
                    marginTop: 14,
                    fontSize: "0.82rem"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        className: "link",
                        style: {
                            fontSize: "0.82rem",
                            listStyle: "none"
                        },
                        children: "How it decided"
                    }, void 0, false, {
                        fileName: "[project]/components/DrinkDetails.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gap: 12,
                            marginTop: 10
                        },
                        children: [
                            !!a.evidence?.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(List, {
                                title: "Clues",
                                items: a.evidence
                            }, void 0, false, {
                                fileName: "[project]/components/DrinkDetails.tsx",
                                lineNumber: 55,
                                columnNumber: 38
                            }, this),
                            !!a.visible_text?.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "eyebrow",
                                        style: {
                                            margin: "0 0 4px"
                                        },
                                        children: "Text on it"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DrinkDetails.tsx",
                                        lineNumber: 58,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 6
                                        },
                                        children: a.visible_text.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: "0.78rem",
                                                    padding: "2px 8px",
                                                    border: "1px solid var(--hairline)",
                                                    borderRadius: 999
                                                },
                                                children: t
                                            }, t, false, {
                                                fileName: "[project]/components/DrinkDetails.tsx",
                                                lineNumber: 61,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/DrinkDetails.tsx",
                                        lineNumber: 59,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DrinkDetails.tsx",
                                lineNumber: 57,
                                columnNumber: 15
                            }, this),
                            !!a.alternatives?.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(List, {
                                title: "Could also be",
                                items: a.alternatives.map((x)=>`${label(x.drink)} · ${Math.round(x.confidence * 100)}%`)
                            }, void 0, false, {
                                fileName: "[project]/components/DrinkDetails.tsx",
                                lineNumber: 67,
                                columnNumber: 15
                            }, this),
                            !!a.image_issues?.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(List, {
                                title: "Photo issues",
                                items: a.image_issues
                            }, void 0, false, {
                                fileName: "[project]/components/DrinkDetails.tsx",
                                lineNumber: 69,
                                columnNumber: 42
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DrinkDetails.tsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DrinkDetails.tsx",
                lineNumber: 52,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DrinkDetails.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = DrinkDetails;
function List({ title, items }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "eyebrow",
                style: {
                    margin: "0 0 4px"
                },
                children: title
            }, void 0, false, {
                fileName: "[project]/components/DrinkDetails.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                style: {
                    margin: 0,
                    paddingLeft: 16,
                    lineHeight: 1.6
                },
                children: items.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: t
                    }, t, false, {
                        fileName: "[project]/components/DrinkDetails.tsx",
                        lineNumber: 82,
                        columnNumber: 27
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/DrinkDetails.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DrinkDetails.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this);
}
_c1 = List;
var _c, _c1;
__turbopack_context__.k.register(_c, "DrinkDetails");
__turbopack_context__.k.register(_c1, "List");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/PresetGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PresetGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const KINDS = [
    [
        "all",
        "All"
    ],
    [
        "coffee",
        "Coffee"
    ],
    [
        "tea",
        "Tea"
    ],
    [
        "energy",
        "Energy & soda"
    ],
    [
        "other",
        "Other"
    ]
];
const KIND_OF = {
    espresso_shot: "coffee",
    milk_coffee: "coffee",
    americano: "coffee",
    mocha: "coffee",
    filter_coffee: "coffee",
    cold_brew: "coffee",
    instant_coffee: "coffee",
    capsule_coffee: "coffee",
    decaf: "coffee",
    black_tea: "tea",
    green_tea: "tea",
    oolong_tea: "tea",
    white_tea: "tea",
    matcha: "tea",
    chai_latte: "tea",
    milk_tea: "tea",
    yerba_mate: "tea",
    iced_tea_bottled: "tea",
    herbal_tea: "tea",
    cola: "energy",
    diet_cola: "energy",
    red_bull: "energy",
    energy_drink_500: "energy",
    pre_workout: "energy"
};
const kindOf = (key)=>KIND_OF[key] ?? "other";
function PresetGrid({ presets, onPick }) {
    _s();
    const [kind, setKind] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const present = new Set(presets.map((p)=>kindOf(p.key)));
    const shown = kind === "all" ? presets : presets.filter((p)=>kindOf(p.key) === kind);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "group",
                "aria-label": "Filter by type",
                style: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 12
                },
                children: KINDS.filter(([k])=>k === "all" || present.has(k)).map(([k, text])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "pill",
                        "aria-pressed": kind === k,
                        onClick: ()=>setKind(k),
                        children: text
                    }, k, false, {
                        fileName: "[project]/components/PresetGrid.tsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/PresetGrid.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    columnGap: 32,
                    borderTop: "1px solid var(--border)"
                },
                children: shown.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "tile",
                        onClick: ()=>onPick(p),
                        "aria-label": `${p.label}, ${Math.round(p.mg)} mg`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: p.label
                            }, void 0, false, {
                                fileName: "[project]/components/PresetGrid.tsx",
                                lineNumber: 41,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "num",
                                style: {
                                    fontSize: "0.75rem",
                                    color: "var(--muted)",
                                    whiteSpace: "nowrap"
                                },
                                children: [
                                    Math.round(p.mg),
                                    " mg"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PresetGrid.tsx",
                                lineNumber: 42,
                                columnNumber: 13
                            }, this)
                        ]
                    }, p.key, true, {
                        fileName: "[project]/components/PresetGrid.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/PresetGrid.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/PresetGrid.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_s(PresetGrid, "TPtmIuQnNKRC5wA37MiGJkYwHmg=");
_c = PresetGrid;
var _c;
__turbopack_context__.k.register(_c, "PresetGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/UsualSuggestions.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UsualSuggestions,
    "usualDrinks",
    ()=>usualDrinks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const NEAR_HOURS = 2;
const NEAR_WEIGHT = 3;
/** Circular distance between two hours of the day (0..12). */ const hourGap = (a, b)=>Math.min(Math.abs(a - b), 24 - Math.abs(a - b));
function usualDrinks(drinks, now, n = 3) {
    const hour = now.getHours() + now.getMinutes() / 60;
    const groups = new Map();
    for (const d of drinks){
        const t = new Date(d.time);
        const key = `${d.drink_key}:${Math.round(d.mg)}`;
        const w = hourGap(t.getHours() + t.getMinutes() / 60, hour) <= NEAR_HOURS ? NEAR_WEIGHT : 1;
        const g = groups.get(key);
        if (!g) groups.set(key, {
            score: w,
            latest: d
        });
        else {
            g.score += w;
            if (t > new Date(g.latest.time)) g.latest = d;
        }
    }
    return [
        ...groups.values()
    ].sort((a, b)=>b.score - a.score || new Date(b.latest.time).getTime() - new Date(a.latest.time).getTime()).slice(0, n).map((g)=>g.latest);
}
const label = (key)=>key.replace(/_/g, " ").replace(/^\w/, (c)=>c.toUpperCase());
function UsualSuggestions({ drinks, onPick }) {
    const top = usualDrinks(drinks, new Date());
    if (top.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "eyebrow",
                children: "Your usual?"
            }, void 0, false, {
                fileName: "[project]/components/UsualSuggestions.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap"
                },
                children: top.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "pill",
                        onClick: ()=>onPick(d),
                        children: [
                            label(d.drink_key),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "num",
                                style: {
                                    marginLeft: 8,
                                    fontSize: "0.75rem",
                                    color: "var(--muted)"
                                },
                                children: [
                                    Math.round(d.mg),
                                    " mg"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UsualSuggestions.tsx",
                                lineNumber: 52,
                                columnNumber: 13
                            }, this)
                        ]
                    }, `${d.drink_key}:${d.mg}`, true, {
                        fileName: "[project]/components/UsualSuggestions.tsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/UsualSuggestions.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/UsualSuggestions.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_c = UsualSuggestions;
var _c;
__turbopack_context__.k.register(_c, "UsualSuggestions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=_0juiuk0ou_w-5._.js.map