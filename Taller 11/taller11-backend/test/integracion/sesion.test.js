
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../../app");

describe("POST /api/login", () => {
  test("responde 200 con un token si las credenciales son correctas", async () => {
    const respuesta = await request(app).post("/api/login").send({ username: "ana", password: "ana-12345" });
    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.username, "ana");
    assert.ok(respuesta.body.token);
  });

  test("responde 401 si la contraseña es incorrecta", async () => {
    const respuesta = await request(app).post("/api/login").send({ username: "ana", password: "clave-incorrecta" });
    assert.equal(respuesta.status, 401);
  });
});

describe("GET /api/usuarios/yo", () => {
  test("responde 401 sin token", async () => {
    const respuesta = await request(app).get("/api/usuarios/yo");
    assert.equal(respuesta.status, 401);
  });

  test("responde 401 con un token alterado", async () => {
    const respuesta = await request(app)
      .get("/api/usuarios/yo")
      .set("Authorization", "Bearer token-completamente-inventado");
    assert.equal(respuesta.status, 401);
  });
});

describe("Inicio de sesión con GitHub", () => {
  test("la URL de autorización incluye client_id, state y PKCE", async () => {
    const respuesta = await request(app).get("/api/auth/github/url");
    assert.equal(respuesta.status, 200);
    
    const url = new URL(respuesta.body.url);
    assert.ok(url.searchParams.has("client_id"));
    assert.ok(url.searchParams.has("code_challenge"));
    
    assert.match(url.searchParams.get("state"), /^[0-9a-f]{32}$/);
  });

  test("responde 400 si el state no fue generado por el servidor", async () => {
    const respuesta = await request(app).post("/api/auth/github").send({
      code: "12345",
      state: "estado-falso"
    });
    assert.equal(respuesta.status, 400);
  });
});