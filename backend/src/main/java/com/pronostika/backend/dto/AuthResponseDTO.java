package com.pronostika.backend.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;
    private String avatarUrl;
}