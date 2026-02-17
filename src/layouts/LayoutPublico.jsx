import React from "react";
import { Outlet } from "react-router-dom";

export default function LayoutPublico() {
    return (
        <div style={{ width: "100%", minHeight: "100vh" }}>
            <Outlet />
        </div>
    );
}
