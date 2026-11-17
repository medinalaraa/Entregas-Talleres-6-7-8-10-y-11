
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../../app");

const iniciarSesion = async (username, password) => {
  const respuesta = await request(app).post("/api/login").send({ username, password });
  return respuesta.body.token;
};

describe("GET /api/posts", () => {
  test("responde 200 con las 5 publicaciones iniciales", async () => {
    const respuesta = await request(app).get("/api/posts");
    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.length, 5);
  });

  test("filtra por usuario con ?userId=2", async () => {
    const respuesta = await request(app).get("/api/posts?userId=2");
    assert.equal(respuesta.status, 200);
    assert.ok(respuesta.body.every((post) => post.userId === 2));
  });

  test("responde 404 si la publicación no existe", async () => {
    const respuesta = await request(app).get("/api/posts/999");
    assert.equal(respuesta.status, 404);
  });
});

describe("POST /api/posts", () => {
  test("responde 401 sin token", async () => {
    const respuesta = await request(app).post("/api/posts").send({ title: "Hola", body: "Mundo" });
    assert.equal(respuesta.status, 401);
  });

  test("crea la publicación con el autor del token, no del body", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    const respuesta = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: 99, title: "Publicación de prueba", body: "Creada por una prueba" }); // Enviamos un userId falso
    
    assert.equal(respuesta.status, 201);
    assert.equal(respuesta.body.userId, 1);
  });

  test("responde 400 si falta el title", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    const respuesta = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "Prueba sin titulo" });
    assert.equal(respuesta.status, 400);
  });

  test("responde 400 si el JSON está mal escrito", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    const respuesta = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send('{ "title": "Hola", }');
    assert.equal(respuesta.status, 400);
  });
});

describe("PUT y DELETE /api/posts/:id", () => {
  test("responde 403 si ana edita una publicación de carla", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    const respuesta = await request(app)
      .put("/api/posts/5")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Hackeado", body: "Hackeado" });
    assert.equal(respuesta.status, 403);
  });

  test("el autor puede eliminar su propia publicación", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    
    const resCrear = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Para borrar", body: "Borrame" });
    
    const idGenerado = resCrear.body.id;

    const respuesta = await request(app)
      .delete(`/api/posts/${idGenerado}`)
      .set("Authorization", `Bearer ${token}`);
    
    assert.ok(respuesta.status === 200 || respuesta.status === 204);
  });
});