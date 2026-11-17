
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { nombreDisponible } = require("../../utils/usuarios");

describe("nombreDisponible", () => {
  test("devuelve el mismo nombre si está libre", () => {
    assert.equal(nombreDisponible("ana", []), "ana");
  });

  test("agrega -github si el nombre ya existe", () => {
    assert.equal(nombreDisponible("ana", [{ username: "ana" }]), "ana-github");
  });

  test("agrega -github2 si también existe ana-github", () => {
    assert.equal(nombreDisponible("ana", [{ username: "ana" }, { username: "ana-github" }]), "ana-github2");
  });

  test("no modifica la lista de usuarios", () => {
    const usuarios = [{ username: "ana" }];
    nombreDisponible("ana", usuarios);
    assert.deepEqual(usuarios, [{ username: "ana" }]);
  });
});