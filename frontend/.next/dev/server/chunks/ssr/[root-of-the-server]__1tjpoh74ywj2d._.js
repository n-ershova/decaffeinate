module.exports = [
(()=>{"use strict";return[
"[project]/components/AppShell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AppShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MorningCheckin$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MorningCheckin.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toaster$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Toaster.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
const TABS = [
    {
        href: "/",
        label: "Today"
    },
    {
        href: "/log",
        label: "Log"
    },
    {
        href: "/sleep",
        label: "Sleep"
    },
    {
        href: "/history",
        label: "History"
    },
    {
        href: "/you",
        label: "You"
    },
    {
        href: "/machine",
        label: "Machine"
    },
    {
        href: "/settings",
        label: "Settings"
    }
];
const LONG_PRESS_MS = 700;
const SKIP_KEY = "checkin_skipped";
const skipped = (night)=>{
    try {
        return localStorage.getItem(SKIP_KEY) === night;
    } catch  {
        return false;
    }
};
function AppShell({ children }) {
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const timer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Hidden demo toggle: hold the wordmark.
    const press = ()=>{
        timer.current = setTimeout(()=>router.push("/demo"), LONG_PRESS_MS);
    };
    const release = ()=>{
        if (timer.current) clearTimeout(timer.current);
    };
    // Morning check-in: shown once per night on real screens, until saved or skipped.
    const bare = path.startsWith("/onboarding") || path.startsWith("/dev") || path === "/login" || path === "/reset";
    const userId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUserId"])();
    const profile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useApi"])(userId && !bare ? `/users/${userId}` : null, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUser"])(userId));
    const pending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useApi"])(userId && !bare ? `/sleep/pending?user_id=${userId}` : null, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSleepPending"])(userId));
    // The in-memory backend forgets users when it restarts; start onboarding again
    // rather than leaving every screen failing on a stale stored id.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const reset = ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setStoredUserId"])(null);
            router.replace("/login");
        };
        window.addEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNKNOWN_USER_EVENT"], reset);
        return ()=>window.removeEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNKNOWN_USER_EVENT"], reset);
    }, [
        router
    ]);
    const [dismissed, setDismissed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const night = pending.data?.night;
    const showCheckin = !!pending.data?.needs_checkin && night !== dismissed && !skipped(night);
    const closeCheckin = ()=>{
        try {
            localStorage.setItem(SKIP_KEY, night);
        } catch  {}
        setDismissed(night);
        pending.mutate();
    };
    if (path.startsWith("/onboarding") || path === "/login" || path === "/reset") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "main",
        children: children
    }, void 0, false, {
        fileName: "[project]/components/AppShell.tsx",
        lineNumber: 56,
        columnNumber: 88
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "top",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "wordmark",
                        onPointerDown: press,
                        onPointerUp: release,
                        onPointerLeave: release,
                        onPointerCancel: release,
                        onContextMenu: (e)=>e.preventDefault(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "wordmark-mark",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/components/AppShell.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            "Decaffeinate"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/AppShell.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "tabs",
                        "aria-label": "Main",
                        children: TABS.map((t)=>{
                            const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: t.href,
                                className: `tab${active ? " active" : ""}`,
                                "aria-current": active ? "page" : undefined,
                                children: t.label
                            }, t.href, false, {
                                fileName: "[project]/components/AppShell.tsx",
                                lineNumber: 73,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/AppShell.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/AppShell.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "main",
                children: children
            }, void 0, false, {
                fileName: "[project]/components/AppShell.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                style: {
                    padding: "20px 24px",
                    textAlign: "center"
                },
                children: [
                    profile.data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "caption",
                        children: [
                            "Signed in as ",
                            profile.data.name
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/AppShell.tsx",
                        lineNumber: 82,
                        columnNumber: 26
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "link",
                        onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])().catch(()=>window.alert("Could not sign out. Please try again.")),
                        children: "Sign out"
                    }, void 0, false, {
                        fileName: "[project]/components/AppShell.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/AppShell.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            showCheckin && userId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MorningCheckin$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                userId: userId,
                night: night,
                onDone: closeCheckin
            }, void 0, false, {
                fileName: "[project]/components/AppShell.tsx",
                lineNumber: 85,
                columnNumber: 33
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Toaster$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/AppShell.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/AppShell.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/AuthGate.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthGate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
// Reachable without a session: signing in or up, and setting a new password from an emailed link.
const PUBLIC = [
    "/login",
    "/reset"
];
function AuthGate({ children }) {
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [checked, setChecked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let active = true;
        async function check() {
            try {
                const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sessionUser"])();
                if (!active) return;
                setError(false);
                setUserId((previous)=>{
                    if (previous !== (user?.id ?? null)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearApiCache"])();
                    return user?.id ?? null;
                });
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setStoredUserId"])(user?.id ?? null);
                setChecked(true);
                if (!user && !PUBLIC.includes(path)) router.replace("/login");
                if (user && path === "/login") router.replace("/");
            } catch  {
                if (active) setError(true);
            }
        }
        const expired = ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearApiCache"])();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setStoredUserId"])(null);
            setUserId(null);
            router.replace("/login");
        };
        const storage = (event)=>{
            if (event.key === "user_id") {
                setChecked(false);
                check();
            }
        };
        check();
        window.addEventListener("focus", check);
        window.addEventListener("session-expired", expired);
        window.addEventListener("storage", storage);
        return ()=>{
            active = false;
            window.removeEventListener("focus", check);
            window.removeEventListener("session-expired", expired);
            window.removeEventListener("storage", storage);
        };
    }, [
        path,
        router
    ]);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "main",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                children: "Could not connect to the server."
            }, void 0, false, {
                fileName: "[project]/components/AuthGate.tsx",
                lineNumber: 51,
                columnNumber: 44
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "btn",
                onClick: ()=>window.location.reload(),
                children: "Try again"
            }, void 0, false, {
                fileName: "[project]/components/AuthGate.tsx",
                lineNumber: 51,
                columnNumber: 96
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/AuthGate.tsx",
        lineNumber: 51,
        columnNumber: 21
    }, this);
    if (PUBLIC.includes(path) && !userId) return children;
    if (!checked || !userId) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "main",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            role: "status",
            children: "Checking your session…"
        }, void 0, false, {
            fileName: "[project]/components/AuthGate.tsx",
            lineNumber: 53,
            columnNumber: 58
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/AuthGate.tsx",
        lineNumber: 53,
        columnNumber: 35
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: children
    }, userId, false, {
        fileName: "[project]/components/AuthGate.tsx",
        lineNumber: 54,
        columnNumber: 10
    }, this);
}
}),
"[project]/components/MorningCheckin.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MorningCheckin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/fixtures.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lightsOut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lightsOut.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/** Bedtime on `night`; times before noon are taken to be after midnight. */ function bedtimeIso(night, hhmm) {
    const [y, m, d] = night.split("-").map(Number);
    const [h, min] = hhmm.split(":").map(Number);
    const t = new Date(y, m - 1, d, h, min);
    if (h < 12) t.setDate(t.getDate() + 1);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isoLocal"])(t);
}
function MorningCheckin({ userId, night, onDone }) {
    const [bedtime, setBedtime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lightsOut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLightsOut"])(night) ?? "23:00");
    const [latency, setLatency] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(20);
    const [rested, setRested] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    async function save() {
        setSaving(true);
        setError(false);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["submitSleep"])({
                user_id: userId,
                night,
                bedtime: bedtimeIso(night, bedtime),
                latency_min: latency,
                rested_1to5: rested
            });
            onDone();
        } catch  {
            setError(true);
            setSaving(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "checkin-title",
        style: {
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgb(20 20 19 / 0.35)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                width: "100%",
                maxWidth: 440,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "4px 4px 0 0",
                padding: "32px 28px calc(28px + env(safe-area-inset-bottom))"
            },
            className: "sheet",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "eyebrow",
                    children: "Good morning"
                }, void 0, false, {
                    fileName: "[project]/components/MorningCheckin.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    id: "checkin-title",
                    style: {
                        margin: 0,
                        fontSize: "2rem",
                        fontWeight: 200,
                        letterSpacing: "-0.035em"
                    },
                    children: "How did you sleep?"
                }, void 0, false, {
                    fileName: "[project]/components/MorningCheckin.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    style: {
                        display: "block",
                        marginTop: 28
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "eyebrow",
                            style: {
                                display: "block"
                            },
                            children: "Went to bed"
                        }, void 0, false, {
                            fileName: "[project]/components/MorningCheckin.tsx",
                            lineNumber: 55,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            className: "field",
                            type: "time",
                            value: bedtime,
                            onChange: (e)=>setBedtime(e.target.value),
                            style: {
                                fontSize: "1.75rem",
                                colorScheme: "inherit"
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/MorningCheckin.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/MorningCheckin.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    style: {
                        display: "block",
                        marginTop: 24
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "eyebrow",
                                    children: "Time to fall asleep"
                                }, void 0, false, {
                                    fileName: "[project]/components/MorningCheckin.tsx",
                                    lineNumber: 62,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "num",
                                    style: {
                                        fontSize: "0.8rem"
                                    },
                                    children: latency >= 120 ? "2 h+" : `${latency} min`
                                }, void 0, false, {
                                    fileName: "[project]/components/MorningCheckin.tsx",
                                    lineNumber: 63,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MorningCheckin.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "range",
                            min: 0,
                            max: 120,
                            step: 5,
                            value: latency,
                            onChange: (e)=>setLatency(Number(e.target.value)),
                            style: {
                                width: "100%",
                                accentColor: "var(--text)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/MorningCheckin.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/MorningCheckin.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginTop: 20
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "eyebrow",
                            style: {
                                display: "block"
                            },
                            children: "How rested do you feel?"
                        }, void 0, false, {
                            fileName: "[project]/components/MorningCheckin.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            role: "radiogroup",
                            "aria-label": "Rested, 1 to 5",
                            style: {
                                display: "flex",
                                gap: 6
                            },
                            children: [
                                1,
                                2,
                                3,
                                4,
                                5
                            ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    role: "radio",
                                    "aria-checked": rested === n,
                                    className: "pill",
                                    style: {
                                        flex: 1
                                    },
                                    onClick: ()=>setRested(rested === n ? null : n),
                                    children: n
                                }, n, false, {
                                    fileName: "[project]/components/MorningCheckin.tsx",
                                    lineNumber: 73,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/MorningCheckin.tsx",
                            lineNumber: 71,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/MorningCheckin.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        margin: "16px 0 0",
                        fontSize: "0.85rem",
                        color: "var(--red)"
                    },
                    children: "Couldn't save. Try again."
                }, void 0, false, {
                    fileName: "[project]/components/MorningCheckin.tsx",
                    lineNumber: 79,
                    columnNumber: 19
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginTop: 28
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "btn",
                            onClick: save,
                            disabled: saving,
                            children: saving ? "Saving…" : "Save"
                        }, void 0, false, {
                            fileName: "[project]/components/MorningCheckin.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "link",
                            onClick: onDone,
                            disabled: saving,
                            children: "Skip"
                        }, void 0, false, {
                            fileName: "[project]/components/MorningCheckin.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/MorningCheckin.tsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/MorningCheckin.tsx",
            lineNumber: 47,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/MorningCheckin.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/Toaster.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/toast.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const SHOW_MS = 2000;
function Toaster() {
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const timer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onToast"])((m)=>{
            if (timer.current) clearTimeout(timer.current);
            setMessage(m);
            setVisible(true);
            timer.current = setTimeout(()=>setVisible(false), SHOW_MS);
        }), []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>()=>{
            if (timer.current) clearTimeout(timer.current);
        }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "status",
        "aria-live": "polite",
        className: `toast${visible ? " show" : ""}`,
        children: message
    }, void 0, false, {
        fileName: "[project]/components/Toaster.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "UNKNOWN_USER_EVENT",
    ()=>UNKNOWN_USER_EVENT,
    "clearApiCache",
    ()=>clearApiCache,
    "createUser",
    ()=>createUser,
    "deleteDrinks",
    ()=>deleteDrinks,
    "deleteSleep",
    ()=>deleteSleep,
    "getBrief",
    ()=>getBrief,
    "getCurve",
    ()=>getCurve,
    "getDrinks",
    ()=>getDrinks,
    "getMachine",
    ()=>getMachine,
    "getPresets",
    ()=>getPresets,
    "getProfile",
    ()=>getProfile,
    "getSleep",
    ()=>getSleep,
    "getSleepPending",
    ()=>getSleepPending,
    "getState",
    ()=>getState,
    "getUser",
    ()=>getUser,
    "identifyDrink",
    ()=>identifyDrink,
    "logAlcohol",
    ()=>logAlcohol,
    "logDrink",
    ()=>logDrink,
    "postHr",
    ()=>postHr,
    "revalidate",
    ()=>revalidate,
    "seedDemo",
    ()=>seedDemo,
    "setStoredUserId",
    ()=>setStoredUserId,
    "storedUserId",
    ()=>storedUserId,
    "submitSleep",
    ()=>submitSleep,
    "updateUser",
    ()=>updateUser,
    "useApi",
    ()=>useApi,
    "useUserId",
    ()=>useUserId,
    "whatIf",
    ()=>whatIf
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/fixtures.ts [app-ssr] (ecmascript)");
"use client";
;
;
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MOCK = process.env.NEXT_PUBLIC_MOCK === "1";
// Lets photo/text recognition hit the real backend while everything else stays mocked.
const LIVE_IDENTIFY = process.env.NEXT_PUBLIC_LIVE_IDENTIFY === "1";
// Mocks only what needs the M2–M7 model (/profile, /whatif, /brief), built from real logs.
// /state is real: the backend serves it from backend/model.py until M3–M7 land.
// The Today curve itself is real: GET /curve needs only M1.
const MOCK_MODEL = process.env.NEXT_PUBLIC_MOCK_MODEL === "1";
const MOCK_DELAY_MS = 300;
const mock = (make)=>new Promise((resolve)=>setTimeout(()=>resolve(make()), MOCK_DELAY_MS));
// In-memory store so writes show up in later reads while in mock mode.
const store = {
    drinks: null,
    sleep: null,
    user: {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOCK_USER"]
    }
};
const mockDrinks = ()=>store.drinks ??= (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureDrinkHistory"])();
const mockSleep = ()=>store.sleep ??= (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureSleep"])();
const sameDay = (iso, now)=>new Date(iso).toDateString() === now.toDateString();
class ApiError extends Error {
    status;
    constructor(message, status){
        super(message);
        this.status = status;
    }
}
const UNKNOWN_USER_EVENT = "unknown-user";
async function http(path, init) {
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        credentials: "include",
        cache: "no-store"
    });
    if (res.status === 401) window.dispatchEvent(new Event("session-expired"));
    if (res.status === 404) {
        const body = await res.clone().json().catch(()=>null);
        if (body?.detail === "Unknown user") window.dispatchEvent(new Event(UNKNOWN_USER_EVENT));
    }
    if (!res.ok) throw new ApiError(`${init?.method ?? "GET"} ${path} failed: ${res.status}`, res.status);
    return res.json();
}
const json = (method, body)=>({
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
const qs = (params)=>{
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params))if (v !== undefined) p.set(k, String(v));
    return `?${p}`;
};
function getState(userId = 1, drink) {
    if (MOCK) {
        return mock(()=>{
            const now = new Date();
            const today = mockDrinks().filter((d)=>sameDay(d.time, now));
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureState"])(now, today, userId, drink, store.user.bedtime.slice(0, 5));
        });
    }
    // Real even with NEXT_PUBLIC_MOCK_MODEL=1: until M3–M7 land, the backend answers
    // /state from backend/model.py, the same verdict the desk light shows.
    return http(`/state${qs({
        user_id: userId,
        drink_key: drink?.key
    })}`);
}
function getCurve(userId = 1) {
    if (MOCK) {
        return mock(()=>{
            const now = new Date();
            const curve = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureState"])(now, mockDrinks().filter((d)=>sameDay(d.time, now)), userId).curve;
            return {
                now_mg: curve[0].mg,
                h: 5,
                curve
            };
        });
    }
    return http(`/curve${qs({
        user_id: userId
    })}`);
}
function getProfile(userId = 1) {
    if (MOCK) {
        return mock(()=>{
            const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureProfile"])(new Date(), userId);
            return userId === 1 ? {
                ...p,
                checkins: mockSleep()
            } : p;
        });
    }
    if (MOCK_MODEL) return getSleep(userId).then((checkins)=>({
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureProfile"])(new Date(), userId),
            checkins
        }));
    return http(`/profile${qs({
        user_id: userId
    })}`);
}
function getSleep(userId = 1) {
    if (MOCK) return mock(()=>[
            ...mockSleep()
        ].sort((a, b)=>b.night.localeCompare(a.night)));
    return http(`/sleep${qs({
        user_id: userId
    })}`);
}
function getDrinks(userId = 1, days = 14) {
    if (MOCK) return mock(()=>mockDrinks().filter((d)=>Date.now() - new Date(d.time).getTime() < days * 864e5));
    return http(`/drinks${qs({
        user_id: userId,
        days
    })}`);
}
function getPresets() {
    if (MOCK) return mock(()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PRESETS"]);
    return http("/presets");
}
function getSleepPending(userId = 1) {
    if (MOCK) {
        return mock(()=>{
            const y = new Date();
            y.setDate(y.getDate() - 1);
            const night = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isoLocal"])(y).slice(0, 10);
            return {
                needs_checkin: !mockSleep().some((s)=>s.night === night),
                night
            };
        });
    }
    return http(`/sleep/pending${qs({
        user_id: userId
    })}`);
}
function getUser(id = 1) {
    if (MOCK) return mock(()=>({
            ...store.user,
            id
        }));
    return http(`/users/${id}`);
}
function getMachine() {
    if (MOCK) return mock(()=>({
            online: true,
            last_seen: new Date().toISOString(),
            seconds_ago: 1
        }));
    return http("/machine");
}
async function getBrief(userId = 1) {
    if (MOCK || MOCK_MODEL) return "";
    const res = await fetch(`${BASE}/brief${qs({
        user_id: userId
    })}`, {
        credentials: "include",
        cache: "no-store"
    });
    if (!res.ok) throw new Error(`GET /brief failed: ${res.status}`);
    return URL.createObjectURL(await res.blob());
}
function whatIf(userId, drinkKey, mg) {
    if (MOCK || MOCK_MODEL) return mock(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureWhatIf"])(drinkKey, mg));
    return http("/whatif", json("POST", {
        user_id: userId,
        drink_key: drinkKey,
        mg
    }));
}
async function identifyDrink(input) {
    if (MOCK && !LIVE_IDENTIFY) return mock(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureIdentify"])(input.image ? "photo" : "text"));
    const form = new FormData();
    if (input.image) form.append("image", input.image, "drink.jpg");
    if (input.text) form.append("text", input.text);
    form.append("source", input.source);
    form.append("user_id", String(input.user_id ?? storedUserId() ?? 1));
    const out = await http("/drinks/identify", {
        method: "POST",
        body: form
    });
    // The backend logged it; mirror that into the mock store so reads stay consistent.
    if (MOCK && out.logged) mockDrinks().push(out.logged);
    if (out.logged) revalidateDrinks();
    return out;
}
async function logDrink(d) {
    const drink = {
        user_id: 1,
        time: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isoLocal"])(new Date()),
        ...d
    };
    const out = MOCK ? await mock(()=>(mockDrinks().push(drink), drink)) : await http("/drinks", json("POST", d));
    revalidateDrinks();
    return out;
}
function revalidateDrinks() {
    revalidate("/drinks");
    revalidate("/curve");
    revalidate("/state");
}
async function deleteDrinks(userId, times) {
    const drop = new Set(times);
    if (MOCK) await mock(()=>{
        store.drinks = mockDrinks().filter((d)=>!drop.has(d.time));
    });
    else await http("/drinks", json("DELETE", {
        user_id: userId,
        times
    }));
    revalidate("/drinks");
    revalidate("/state");
}
async function deleteSleep(userId, nights) {
    const drop = new Set(nights);
    if (MOCK) await mock(()=>{
        store.sleep = mockSleep().filter((n)=>!drop.has(n.night));
    });
    else await http("/sleep", json("DELETE", {
        user_id: userId,
        nights
    }));
    revalidate("/profile");
    revalidate("/sleep");
    revalidate("/state");
}
async function logAlcohol(units, userId = 1) {
    const out = MOCK ? await mock(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureAlcohol"])(units)) : await http("/alcohol", json("POST", {
        user_id: userId,
        units
    }));
    revalidate("/state");
    return out;
}
async function submitSleep(s) {
    const night = {
        user_id: 1,
        ...s
    };
    const out = MOCK ? await mock(()=>{
        store.sleep = [
            ...mockSleep().filter((n)=>n.night !== night.night),
            night
        ];
        return night;
    }) : await http("/sleep", json("POST", s));
    revalidate("/state");
    revalidate("/profile");
    revalidate("/sleep");
    return out;
}
async function createUser(u) {
    const out = MOCK ? await mock(()=>store.user = {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOCK_USER"],
            ...u
        }) : await http("/users", json("POST", u));
    revalidate("/state");
    return out;
}
async function updateUser(id, patch) {
    const out = MOCK ? await mock(()=>store.user = {
            ...store.user,
            ...patch
        }) : await http(`/users/${id}`, json("PATCH", patch));
    revalidate("/state");
    return out;
}
async function seedDemo() {
    const out = MOCK ? await mock(()=>({
            users: [
                {
                    id: 2,
                    name: "Sam",
                    true_h: 9
                },
                {
                    id: 3,
                    name: "Jo",
                    true_h: 3.5
                }
            ]
        })) : await http("/demo/seed", {
        method: "POST"
    });
    revalidate("/state");
    return out;
}
function postHr(userId, drinkTime, hr, br) {
    if (MOCK) return mock(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fixtureHr"])(hr, br, drinkTime));
    return http("/hr", json("POST", {
        user_id: userId,
        drink_time: drinkTime,
        hr_bpm: hr,
        br_bpm: br
    }));
}
function storedUserId() {
    try {
        const v = localStorage.getItem("user_id");
        return v ? Number(v) : null;
    } catch  {
        return null;
    }
}
const USER_EVENT = "user_id-change";
function setStoredUserId(id) {
    try {
        if (id === null) localStorage.removeItem("user_id");
        else localStorage.setItem("user_id", String(id));
    } catch  {}
    window.dispatchEvent(new Event(USER_EVENT));
}
function useUserId() {
    const [id, setId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Layout components outlive onboarding, so follow later changes too.
        const read = ()=>setId(storedUserId() ?? (MOCK ? 1 : null));
        read();
        window.addEventListener(USER_EVENT, read);
        window.addEventListener("storage", read);
        return ()=>{
            window.removeEventListener(USER_EVENT, read);
            window.removeEventListener("storage", read);
        };
    }, []);
    return id;
}
const cache = new Map();
function clearApiCache() {
    cache.clear();
}
const listeners = new Map();
const refetchers = new Map();
const notify = (key)=>listeners.get(key)?.forEach((fn)=>fn());
function load(key, fetcher) {
    const entry = cache.get(key) ?? {};
    cache.set(key, entry);
    entry.inflight ??= fetcher().then((data)=>{
        entry.data = data;
        entry.error = undefined;
    }).catch((err)=>{
        entry.error = err;
    }).finally(()=>{
        entry.inflight = undefined;
        notify(key);
    });
    return entry.inflight;
}
function revalidate(prefix) {
    for (const [key, subs] of refetchers){
        if (key.startsWith(prefix)) subs.forEach((fn)=>fn());
    }
}
function useApi(key, fetcher) {
    const [, rerender] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const refetch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!key) return Promise.resolve();
        const entry = cache.get(key);
        if (entry) entry.inflight = undefined; // force a fresh request
        return load(key, fetcher);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        key
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!key) return;
        const bump = ()=>rerender((n)=>n + 1);
        const subs = listeners.get(key) ?? new Set();
        subs.add(bump);
        listeners.set(key, subs);
        const rf = refetchers.get(key) ?? new Set();
        rf.add(refetch);
        refetchers.set(key, rf);
        refetch();
        return ()=>{
            subs.delete(bump);
            rf.delete(refetch);
        };
    }, [
        key,
        refetch
    ]);
    const entry = key ? cache.get(key) : undefined;
    return {
        data: entry?.data,
        error: entry?.error,
        isLoading: !!key && entry?.data === undefined && entry?.error === undefined,
        mutate: refetch
    };
}
}),
"[project]/lib/auth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requestPasswordReset",
    ()=>requestPasswordReset,
    "resetPassword",
    ()=>resetPassword,
    "sessionUser",
    ()=>sessionUser,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
"use client";
;
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
async function sessionUser() {
    const res = await fetch(`${BASE}/auth/me`, {
        credentials: "include",
        cache: "no-store"
    });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error("Could not check your session. Please try again.");
    return res.json();
}
async function signIn(mode, body) {
    const res = await fetch(`${BASE}/auth/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const data = await res.json().catch(()=>null);
        throw new Error(typeof data?.detail === "string" ? data.detail : "Check your details and try again.");
    }
    const user = await res.json();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearApiCache"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setStoredUserId"])(user.id);
    return user;
}
async function post(path, body, fallback) {
    const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const data = await res.json().catch(()=>null);
        throw new Error(typeof data?.detail === "string" ? data.detail : fallback);
    }
    return res;
}
async function requestPasswordReset(email) {
    await post("/auth/forgot", {
        email
    }, "Could not send the reset link. Try again.");
}
async function resetPassword(token, password) {
    const res = await post("/auth/reset", {
        token,
        password
    }, "Could not reset your password. Try again.");
    const user = await res.json();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearApiCache"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setStoredUserId"])(user.id);
    return user;
}
async function signOut() {
    const res = await fetch(`${BASE}/auth/logout`, {
        method: "POST",
        credentials: "include"
    });
    if (!res.ok) throw new Error("Could not sign out. Please try again.");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearApiCache"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setStoredUserId"])(null);
    localStorage.removeItem("checkin_skipped");
    window.location.assign("/login");
}
}),
"[project]/lib/fixtures.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MOCK_PROFILES",
    ()=>MOCK_PROFILES,
    "MOCK_USER",
    ()=>MOCK_USER,
    "PRESETS",
    ()=>PRESETS,
    "buildCurve",
    ()=>buildCurve,
    "cutoffForDrink",
    ()=>cutoffForDrink,
    "fixtureAlcohol",
    ()=>fixtureAlcohol,
    "fixtureDrinkHistory",
    ()=>fixtureDrinkHistory,
    "fixtureDrinksToday",
    ()=>fixtureDrinksToday,
    "fixtureHr",
    ()=>fixtureHr,
    "fixtureIdentify",
    ()=>fixtureIdentify,
    "fixtureProfile",
    ()=>fixtureProfile,
    "fixtureSleep",
    ()=>fixtureSleep,
    "fixtureState",
    ()=>fixtureState,
    "fixtureWhatIf",
    ()=>fixtureWhatIf,
    "isoLocal",
    ()=>isoLocal
]);
const MIN = 60_000;
const HALF_LIFE_H = 5; // population default, as in backend/model.py
const pad = (n)=>String(n).padStart(2, "0");
function isoLocal(d) {
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? "+" : "-";
    const a = Math.abs(off);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` + `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` + `${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}
const dateOnly = (d)=>isoLocal(d).slice(0, 10);
/** First 08:00 strictly after `from`. */ function nextEight(from) {
    const d = new Date(from);
    d.setHours(8, 0, 0, 0);
    if (d <= from) d.setDate(d.getDate() + 1);
    return d;
}
/** Mg in body at `t` from a set of drinks, first-order decay with half-life h. */ function amountAt(drinks, t, h) {
    let total = 0;
    for (const d of drinks){
        const dt = (t.getTime() - new Date(d.time).getTime()) / (60 * MIN);
        if (dt >= 0) total += d.mg * Math.pow(0.5, dt / h);
    }
    return total;
}
function buildCurve(drinks, now, h = HALF_LIFE_H) {
    const end = nextEight(now);
    const out = [];
    for(let t = now.getTime(); t <= end.getTime(); t += 15 * MIN){
        out.push({
            t: isoLocal(new Date(t)),
            mg: Math.round(amountAt(drinks, new Date(t), h))
        });
    }
    return out;
}
const MOCK_USER = {
    id: 1,
    name: "Alex",
    bedtime: "23:30",
    smoker: false,
    hormonal_bc: false,
    tolerance_min: 10,
    is_simulated: false
};
const PRESETS = [
    {
        key: "espresso_shot",
        label: "Espresso shot",
        mg: 63,
        mg_low: 50,
        mg_high: 75
    },
    {
        key: "milk_coffee",
        label: "Latte / flat white",
        mg: 130,
        mg_low: 90,
        mg_high: 180
    },
    {
        key: "americano",
        label: "Americano",
        mg: 150,
        mg_low: 100,
        mg_high: 200
    },
    {
        key: "filter_coffee",
        label: "Filter coffee",
        mg: 140,
        mg_low: 95,
        mg_high: 200
    },
    {
        key: "cold_brew",
        label: "Cold brew",
        mg: 200,
        mg_low: 150,
        mg_high: 280
    },
    {
        key: "black_tea",
        label: "Black tea",
        mg: 47,
        mg_low: 30,
        mg_high: 70
    },
    {
        key: "green_tea",
        label: "Green tea",
        mg: 28,
        mg_low: 20,
        mg_high: 45
    },
    {
        key: "matcha",
        label: "Matcha",
        mg: 70,
        mg_low: 40,
        mg_high: 90
    },
    {
        key: "cola",
        label: "Cola",
        mg: 34,
        mg_low: 30,
        mg_high: 40
    },
    {
        key: "red_bull",
        label: "Red Bull",
        mg: 80,
        mg_low: 75,
        mg_high: 85
    },
    {
        key: "energy_drink_500",
        label: "Energy drink (500 ml)",
        mg: 160,
        mg_low: 140,
        mg_high: 200
    },
    {
        key: "decaf",
        label: "Decaf",
        mg: 7,
        mg_low: 2,
        mg_high: 15
    }
];
function fixtureDrinksToday(now = new Date()) {
    const at = (h, m)=>{
        const d = new Date(now);
        d.setHours(h, m, 0, 0);
        if (d > now) d.setDate(d.getDate() - 1); // never in the future
        return isoLocal(d);
    };
    return [
        {
            time: at(8, 15),
            user_id: 1,
            drink_key: "milk_coffee",
            mg: 130,
            mg_low: 90,
            mg_high: 180,
            source: "preset"
        },
        {
            time: at(13, 5),
            user_id: 1,
            drink_key: "americano",
            mg: 150,
            mg_low: 100,
            mg_high: 200,
            source: "photo"
        }
    ];
}
function fixtureDrinkHistory(now = new Date()) {
    const out = [];
    for(let day = 13; day >= 1; day--){
        const base = new Date(now);
        base.setDate(base.getDate() - day);
        const mk = (h, m, key, mg)=>{
            const t = new Date(base);
            t.setHours(h, m, 0, 0);
            return {
                time: isoLocal(t),
                user_id: 1,
                drink_key: key,
                mg,
                mg_low: mg * 0.7,
                mg_high: mg * 1.3,
                source: "preset"
            };
        };
        out.push(mk(8, 20, "milk_coffee", 130));
        if (day % 3 !== 0) out.push(mk(13, 0, "americano", 150));
        if (day % 4 === 0) out.push(mk(16, 30, "black_tea", 47));
    }
    return [
        ...out,
        ...fixtureDrinksToday(now)
    ];
}
function cutoffForDrink(cutoff, h, mg, bedtime) {
    if (!cutoff) return null;
    const mins = (t)=>{
        const [hh, mm] = t.split(":").map(Number);
        return hh * 60 + mm;
    };
    const moved = Math.min(mins(cutoff) - Math.round(h * Math.log2(mg / 130) * 60), mins(bedtime));
    if (moved < 0) return null;
    return `${String(Math.floor(moved / 60)).padStart(2, "0")}:${String(moved % 60).padStart(2, "0")}`;
}
function fixtureState(now = new Date(), drinks = fixtureDrinksToday(now), userId = 1, drink, bedtime = "23:30") {
    const p = MOCK_PROFILES[userId] ?? MOCK_PROFILES[1];
    const curve = buildCurve(drinks, now, p.h);
    const total = drinks.reduce((s, d)=>s + d.mg, 0);
    const cutoff = drink ? cutoffForDrink(p.cutoff, p.h, drink.mg, bedtime) : p.cutoff;
    return {
        now_mg: curve[0].mg,
        bedtime,
        cutoff,
        headline: cutoff ? `Last ${drink?.label ?? "coffee"} today by ${cutoff}` : "No more caffeine today",
        led: total >= 400 ? "red" : p.led,
        daily_total_mg: total,
        cap_mg: 400,
        curve,
        safe_line_mg: 38,
        is_simulated: userId !== 1
    };
}
function fixtureWhatIf(drink_key, mg, now = new Date()) {
    const drinks = [
        ...fixtureDrinksToday(now),
        {
            time: isoLocal(now),
            user_id: 1,
            drink_key,
            mg,
            mg_low: mg * 0.7,
            mg_high: mg * 1.3,
            source: "preset"
        }
    ];
    const median = Math.round(mg / 16);
    return {
        extra_latency_min: {
            median,
            low: Math.max(1, Math.round(median * 0.45)),
            high: Math.round(median * 1.9)
        },
        curve: buildCurve(drinks, now),
        led_after: mg >= 100 ? "red" : "amber",
        cap_exceeded: drinks.reduce((s, d)=>s + d.mg, 0) > 400
    };
}
const NIGHTS = 21;
function fixtureSleep(now = new Date()) {
    const lat = [
        18,
        25,
        14,
        31,
        22,
        12,
        35,
        20,
        17,
        28,
        15,
        33,
        19,
        24,
        13,
        29,
        21,
        16,
        34,
        23,
        26
    ];
    return Array.from({
        length: NIGHTS
    }, (_, i)=>{
        const d = new Date(now);
        d.setDate(d.getDate() - (NIGHTS + 1 - i)); // ends the night before last: last night is pending
        d.setHours(23, 30, 0, 0);
        return {
            night: dateOnly(d),
            user_id: 1,
            bedtime: isoLocal(d),
            latency_min: lat[i],
            rested_1to5: i * 7 % 4 + 2
        };
    });
}
const MOCK_PROFILES = {
    1: {
        h: HALF_LIFE_H,
        sd: 1.0,
        beta: 6.2,
        label: "Average sensitivity",
        cutoff: "14:10",
        led: "amber"
    },
    2: {
        h: 9.0,
        sd: 0.9,
        beta: 7.0,
        label: "Above-average sensitivity",
        cutoff: "11:40",
        led: "red"
    },
    3: {
        h: 3.5,
        sd: 0.5,
        beta: 5.1,
        label: "Average sensitivity",
        cutoff: "18:20",
        led: "green"
    }
};
const POP_H = 5;
function fixtureProfile(now = new Date(), userId = 1) {
    const p = MOCK_PROFILES[userId] ?? MOCK_PROFILES[1];
    const grid = [];
    const prob = [];
    for(let i = 0; i < 200; i++){
        const h = 1.5 * Math.pow(15 / 1.5, i / 199);
        grid.push(Number(h.toFixed(3)));
        // log-normal-ish around the mean, matching the log-h prior
        prob.push(Math.exp(-0.5 * ((Math.log(h) - Math.log(p.h)) / (p.sd / p.h)) ** 2) / h);
    }
    const z = prob.reduce((a, b)=>a + b, 0);
    const checkins = fixtureSleep(now).map((c)=>({
            ...c,
            user_id: userId
        }));
    return {
        half_life: {
            mean: p.h,
            sd: p.sd,
            ci80: [
                Number((p.h - 1.28 * p.sd).toFixed(1)),
                Number((p.h + 1.28 * p.sd).toFixed(1))
            ]
        },
        population_mean_h: POP_H,
        sensitivity: {
            mean: p.beta,
            sd: 2.1,
            label: p.label
        },
        posterior: {
            h_grid: grid,
            prob: prob.map((x)=>x / z)
        },
        history: checkins.map((c, i)=>{
            // Starts at the population prior and converges on the user's value; the band narrows.
            const k = 1 - Math.exp(-(i + 1) / 6);
            const mean = POP_H + (p.h - POP_H) * k;
            const half = 1.28 * (3.4 * (1 - k) + p.sd * k);
            return {
                night: c.night,
                h_mean: Number(mean.toFixed(2)),
                h_low: Number(Math.max(1.5, mean - half).toFixed(2)),
                h_high: Number((mean + half).toFixed(2))
            };
        }),
        checkins
    };
}
function fixtureIdentify(kind = "photo") {
    return {
        gemini: {
            drink: "milk_coffee",
            size: "regular",
            shots: 2,
            brand: "Pret",
            decaf: false,
            label_mg: null,
            confidence: kind === "photo" ? 0.82 : 0.9,
            analysis: {
                verdict: "Pret regular oat flat white",
                description: "A white paper takeaway cup with a burgundy Pret sleeve and a domed lid, held in one hand.",
                category: "coffee",
                product_name: "Flat white",
                container: "paper_cup",
                volume_ml: 340,
                volume_source: "estimated",
                temperature: "hot",
                milk: "oat",
                additions: [],
                visible_text: [
                    "PRET A MANGER",
                    "OAT"
                ],
                printed_caffeine: null,
                evidence: [
                    "Pret logo on the sleeve",
                    "'OAT' marked on the lid",
                    "Cup about the height of the hand holding it"
                ],
                alternatives: [
                    {
                        drink: "americano",
                        confidence: 0.08
                    }
                ],
                image_issues: []
            }
        },
        estimate: {
            drink_key: "milk_coffee",
            label: "Latte (regular)",
            mg: 130,
            mg_low: 90,
            mg_high: 180,
            needs: [
                "decaf"
            ],
            auto_accept: false
        }
    };
}
const fixtureAlcohol = (units, now = new Date())=>({
        time: isoLocal(now),
        user_id: 1,
        units
    });
const fixtureHr = (hr_bpm, br_bpm, drink_time)=>({
        time: isoLocal(new Date()),
        user_id: 1,
        drink_time,
        hr_bpm,
        br_bpm
    });
}),
"[project]/lib/lightsOut.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearLightsOut",
    ()=>clearLightsOut,
    "getLightsOut",
    ()=>getLightsOut,
    "nightOf",
    ()=>nightOf,
    "setLightsOut",
    ()=>setLightsOut
]);
// Lights-out time, kept on this device until the morning check-in saves the night.
const KEY = "lights_out";
function nightOf(t) {
    const d = new Date(t);
    if (d.getHours() < 12) d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getLightsOut(night) {
    try {
        const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
        return v?.night === night ? v.time : null;
    } catch  {
        return null;
    }
}
function setLightsOut(t) {
    const time = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
    try {
        localStorage.setItem(KEY, JSON.stringify({
            night: nightOf(t),
            time
        }));
    } catch  {}
    return time;
}
function clearLightsOut() {
    try {
        localStorage.removeItem(KEY);
    } catch  {}
}
}),
"[project]/lib/toast.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// App-wide toast: any component calls `toast("Logged")`; <Toaster /> in AppShell shows it.
__turbopack_context__.s([
    "onToast",
    ()=>onToast,
    "toast",
    ()=>toast
]);
const listeners = new Set();
function toast(message) {
    listeners.forEach((fn)=>fn(message));
}
function onToast(fn) {
    listeners.add(fn);
    return ()=>{
        listeners.delete(fn);
    };
}
}),
]})(),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1tjpoh74ywj2d._.js.map