package com.pronostika.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RecuperarPasswordDTO {
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String email;
}