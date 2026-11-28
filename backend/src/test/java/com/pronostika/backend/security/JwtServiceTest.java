package com.pronostika.backend.security;

import java.lang.reflect.Field;
import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        Field secret = JwtService.class.getDeclaredField("secretKey");
        secret.setAccessible(true);
        secret.set(jwtService, "clave_secreta_pruebas_unitarias_pronostika_2026_segura");

        Field exp = JwtService.class.getDeclaredField("jwtExpiration");
        exp.setAccessible(true);
        exp.set(jwtService, 3600000L);
    }

    @Test
    void generaYValidaTokenParaUsuarioCorrecto() {
        UserDetails usuario = User.withUsername("yahel@pronostika.com")
                .password("Password1!")
                .roles("USUARIO")
                .build();
        UserDetails otro = User.withUsername("otro@pronostika.com")
                .password("Password1!")
                .roles("USUARIO")
                .build();

        String token = jwtService.generateToken(usuario, "ROLE_USUARIO");

        assertEquals("yahel@pronostika.com", jwtService.extractEmail(token));
        assertTrue(jwtService.extractExpiration(token).after(new Date()));
        assertTrue(jwtService.isTokenValid(token, usuario));
        assertFalse(jwtService.isTokenValid(token, otro));
    }
}
