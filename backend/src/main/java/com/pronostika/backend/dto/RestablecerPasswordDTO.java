package com.pronostika.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RestablecerPasswordDTO {

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Correo inválido")
    private String email;

    @NotBlank(message = "El código de seguridad es obligatorio")
    private String codigo;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#._-]).{8,}$",
            message = "La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo"
    )
    private String nuevaPassword;
}