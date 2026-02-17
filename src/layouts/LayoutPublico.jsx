import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Container, Card, Linha } from "../ui/Base";

export default function LayoutPublico() {
    return (
        <Container>
            <Linha>
                <h2>MVP Dívidas</h2>
                <div style={{ display: "flex", gap: 12 }}>
                    <Link to="/login">Login</Link>
                    <Link to="/cadastro">Cadastro</Link>
                </div>
            </Linha>
            <Card style={{ marginTop: 16 }}>
                <Outlet />
            </Card>
        </Container>
    );
}
