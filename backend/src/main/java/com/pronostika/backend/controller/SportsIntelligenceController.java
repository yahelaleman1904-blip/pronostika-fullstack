package com.pronostika.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.util.*;

@RestController
@RequestMapping("/api/sports")
public class SportsIntelligenceController {

    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private static final Map<String, String> LEAGUE_SLUGS = Map.ofEntries(
            Map.entry("bundesliga", "ger.1"),
            Map.entry("laliga", "esp.1"),
            Map.entry("la liga", "esp.1"),
            Map.entry("premier league", "eng.1"),
            Map.entry("serie a", "ita.1"),
            Map.entry("ligue 1", "fra.1"),
            Map.entry("liga mx", "mex.1"),
            Map.entry("champions league", "uefa.champions")
    );

    private String normalize(String text) {
        if (text == null) return "";
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }

    private String getLeagueSlug(String liga) {
        String key = normalize(liga);
        return LEAGUE_SLUGS.getOrDefault(key, "eng.1");
    }

    private JsonNode fetchJson(String url) throws Exception {
        HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() != 200) return null;
        return mapper.readTree(res.body());
    }

    private Map<String, Object> fetchTeamRealData(String slug, String teamName) throws Exception {
        JsonNode teamsRoot = fetchJson("https://site.api.espn.com/apis/site/v2/sports/soccer/" + slug + "/teams");
        if (teamsRoot == null) return Map.of("found", false);

        String target = normalize(teamName);
        JsonNode teamsArr = teamsRoot.path("sports").path(0).path("leagues").path(0).path("teams");
        String teamId = null;

        for (JsonNode wrapper : teamsArr) {
            JsonNode t = wrapper.path("team");
            String display = normalize(t.path("displayName").asText());
            String shortName = normalize(t.path("shortDisplayName").asText());
            if (display.contains(target) || target.contains(display) || shortName.contains(target)) {
                teamId = t.path("id").asText();
                break;
            }
        }
        if (teamId == null) return Map.of("found", false);

        // 1. Plantilla real (jugadores reales del club)
        List<Map<String, Object>> roster = new ArrayList<>();
        JsonNode rosterRoot = fetchJson("https://site.api.espn.com/apis/site/v2/sports/soccer/" + slug + "/teams/" + teamId + "/roster");
        if (rosterRoot != null && rosterRoot.has("athletes")) {
            for (JsonNode a : rosterRoot.path("athletes")) {
                if (roster.size() >= 11) break;
                roster.add(Map.of(
                        "id", a.path("id").asText(),
                        "name", a.path("displayName").asText(),
                        "number", a.path("jersey").asText("0"),
                        "position", a.path("position").path("abbreviation").asText("JUG"),
                        "age", a.path("age").asInt(0)
                ));
            }
        }

        // 2. Últimos 5 partidos reales jugados
       List<Map<String, Object>> recentMatches = new ArrayList<>();
        JsonNode schedRoot = fetchJson("https://site.api.espn.com/apis/site/v2/sports/soccer/" + slug + "/teams/" + teamId + "/schedule");
        if (schedRoot != null && schedRoot.has("events")) {
            List<JsonNode> completed = new ArrayList<>();
            for (JsonNode ev : schedRoot.path("events")) {
                boolean done = ev.path("competitions").path(0).path("status").path("type").path("completed").asBoolean(false);
                if (done) completed.add(ev);
            }
            int start = Math.max(0, completed.size() - 5);
            for (int i = completed.size() - 1; i >= start; i--) {
                JsonNode ev = completed.get(i);
                JsonNode comp = ev.path("competitions").path(0);
                JsonNode c0 = comp.path("competitors").path(0);
                JsonNode c1 = comp.path("competitors").path(1);

                boolean isC0 = c0.path("team").path("id").asText().equals(teamId);
                JsonNode me = isC0 ? c0 : c1;
                JsonNode opp = isC0 ? c1 : c0;

                String myScore = me.path("score").path("displayValue").asText("0");
                String oppScore = opp.path("score").path("displayValue").asText("0");
                boolean win = me.path("winner").asBoolean(false);
                boolean oppWin = opp.path("winner").asBoolean(false);
                String result = win ? "W" : oppWin ? "L" : "D";

                recentMatches.add(Map.of(
                        "date", ev.path("date").asText("").substring(0, Math.min(10, ev.path("date").asText("").length())),
                        "rival", opp.path("team").path("shortDisplayName").asText("Rival"),
                        "score", myScore + " - " + oppScore,
                        "result", result,
                        "isHome", me.path("homeAway").asText().equals("home")
                ));
            }
        }

        return Map.of("found", true, "teamId", teamId, "roster", roster, "recentMatches", recentMatches);
    }

    @GetMapping("/match-details")
    public ResponseEntity<?> getRealMatchDetails(
            @RequestParam String local,
            @RequestParam String visitante,
            @RequestParam(defaultValue = "Bundesliga") String liga) {
        try {
            String slug = getLeagueSlug(liga);
            Map<String, Object> homeData = fetchTeamRealData(slug, local);
            Map<String, Object> awayData = fetchTeamRealData(slug, visitante);
            return ResponseEntity.ok(Map.of("slug", slug, "home", homeData, "away", awayData));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error consultando ESPN: " + e.getMessage()));
        }
    }

    @PostMapping("/ai-analysis")
    public ResponseEntity<?> generateAiAnalysis(@RequestBody Map<String, Object> payload) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta configurar gemini.api-key en application.properties"));
        }

        try {
            String prompt = """
                    Eres un analista táctico profesional de fútbol (estilo Sofascore / Opta).
                    Analiza este partido con pensamiento crítico basándote SOLO en estos datos reales:
                    - Partido: %s vs %s (%s)
                    - Últimos 5 partidos local: %s
                    - Últimos 5 partidos visitante: %s
                    
                    Responde en español en máximo 3 párrafos cortos y directos:
                    1) Momento real de ambos equipos según sus resultados recientes.
                    2) Clave táctica del partido y riesgo principal.
                    3) Veredicto concreto (ganador probable o doble oportunidad y por qué).
                    """.formatted(
                    payload.get("local"),
                    payload.get("visitante"),
                    payload.get("liga"),
                    payload.get("homeRecent"),
                    payload.get("awayRecent")
            );

            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            );

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            JsonNode root = mapper.readTree(res.body());
            String analysis = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");

            return ResponseEntity.ok(Map.of("analysis", analysis));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error generando análisis IA: " + e.getMessage()));
        }
    }
}