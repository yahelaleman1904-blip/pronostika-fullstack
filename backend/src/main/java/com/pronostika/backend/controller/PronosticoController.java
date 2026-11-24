package com.pronostika.backend.controller;

import com.pronostika.backend.dto.*;
import com.pronostika.backend.entity.*;
import com.pronostika.backend.exception.RecursoNoEncontradoException;
import com.pronostika.backend.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pronosticos")
@RequiredArgsConstructor
public class PronosticoController {

    private final PronosticoRepository pronosticoRepository;
    private final PartidoRepository partidoRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<Page<PronosticoResponseDTO>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String liga,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String s = (search == null || search.isBlank()) ? null : search.trim();
        String l = (liga == null || liga.isBlank() || liga.equalsIgnoreCase("Todas")) ? null : liga.trim();

        Page<PronosticoResponseDTO> resultado = pronosticoRepository
                .buscarConFiltros(s, l, PageRequest.of(page, size, Sort.by("id").descending()))
                .map(this::toDTO);

        return ResponseEntity.ok(resultado);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALISTA')")
    public ResponseEntity<PronosticoResponseDTO> crear(
            @Valid @RequestBody PronosticoRequestDTO req, Authentication auth) {

        Partido partido = partidoRepository.findById(req.getPartidoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Partido no encontrado"));
        Usuario usuario = usuarioRepository.findByEmail(auth.getName()).orElseThrow();

        Pronostico guardado = pronosticoRepository.save(Pronostico.builder()
                .partido(partido)
                .usuario(usuario)
                .ganadorPrevisto(req.getGanadorPrevisto())
                .probabilidad(req.getProbabilidad())
                .estado(req.getEstado() != null ? req.getEstado() : "PENDIENTE")
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(guardado));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALISTA')")
    public ResponseEntity<PronosticoResponseDTO> actualizar(
            @PathVariable Long id, @Valid @RequestBody PronosticoRequestDTO req) {

        Pronostico p = pronosticoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pronóstico no encontrado"));

        p.setGanadorPrevisto(req.getGanadorPrevisto());
        p.setProbabilidad(req.getProbabilidad());
        if (req.getEstado() != null) p.setEstado(req.getEstado());

        return ResponseEntity.ok(toDTO(pronosticoRepository.save(p)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALISTA')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!pronosticoRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Pronóstico no encontrado");
        }
        pronosticoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private PronosticoResponseDTO toDTO(Pronostico p) {
        return new PronosticoResponseDTO(
                p.getId(),
                p.getPartido().getId(),
                p.getPartido().getEquipoLocal() + " vs " + p.getPartido().getEquipoVisitante(),
                p.getPartido().getLiga().getNombre(),
                p.getPartido().getFechaPartido(),
                p.getGanadorPrevisto(),
                p.getProbabilidad(),
                p.getEstado()
        );
    }
}