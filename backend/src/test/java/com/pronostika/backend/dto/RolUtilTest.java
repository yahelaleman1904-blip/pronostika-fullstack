package com.pronostika.backend.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class RolUtilTest {

    @Test
    void sinPrefijoRemueveRoleCuandoExiste() {
        assertEquals("ADMIN", RolUtil.sinPrefijo("ROLE_ADMIN"));
        assertEquals("USUARIO", RolUtil.sinPrefijo("ROLE_USUARIO"));
        assertEquals("ANALISTA", RolUtil.sinPrefijo("ANALISTA"));
        assertNull(RolUtil.sinPrefijo(null));
    }

    @Test
    void conPrefijoNormalizaMayusculasYAgregaRole() {
        assertEquals("ROLE_ADMIN", RolUtil.conPrefijo("admin"));
        assertEquals("ROLE_ANALISTA", RolUtil.conPrefijo("  ROLE_ANALISTA "));
        assertEquals("ROLE_USUARIO", RolUtil.conPrefijo("usuario"));
    }
}
