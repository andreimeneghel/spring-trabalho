package com.soundhub.auth.service;

import com.soundhub.common.exception.MuitasTentativasException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limita as tentativas de login para dificultar ataque de forca bruta.
 *
 * Depois de {@value #MAX_TENTATIVAS} senhas erradas seguidas, o email fica
 * bloqueado por {@value #BLOQUEIO_SEGUNDOS} segundos. Um login correto zera a
 * contagem.
 *
 * O controle e feito em memoria: basta para um trabalho academico e nao
 * acrescenta dependencia. Numa aplicacao com varias instancias isso precisaria
 * ir para Redis, porque cada instancia teria a propria contagem.
 */
@Slf4j
@Service
public class TentativaLoginService {

    private static final int MAX_TENTATIVAS = 4;
    private static final long BLOQUEIO_SEGUNDOS = 60;

    /** Quanto tempo sem tentar ate a contagem ser esquecida. */
    private static final Duration JANELA = Duration.ofMinutes(15);

    private record Registro(int tentativas, Instant ultimaTentativa, Instant bloqueadoAte) {

        boolean estaBloqueado(Instant agora) {
            return bloqueadoAte != null && agora.isBefore(bloqueadoAte);
        }

        boolean expirou(Instant agora) {
            return Duration.between(ultimaTentativa, agora).compareTo(JANELA) > 0;
        }
    }

    private final Map<String, Registro> registros = new ConcurrentHashMap<>();

    /**
     * Chamado antes de tentar autenticar.
     *
     * @throws MuitasTentativasException se o email estiver bloqueado
     */
    public void validarPodeTentar(String email) {
        Registro registro = registros.get(chave(email));
        if (registro == null) {
            return;
        }

        Instant agora = Instant.now();

        if (registro.estaBloqueado(agora)) {
            long restantes = Duration.between(agora, registro.bloqueadoAte()).toSeconds() + 1;
            log.warn("Login bloqueado por excesso de tentativas: {} ({}s restantes)",
                    email, restantes);
            throw new MuitasTentativasException(restantes);
        }

        // passou do bloqueio ou ficou muito tempo parado: comeca de novo
        if (registro.expirou(agora) || registro.bloqueadoAte() != null) {
            registros.remove(chave(email));
        }
    }

    /** Chamado quando a senha esta errada. */
    public long registrarFalha(String email) {
        String chave = chave(email);
        Instant agora = Instant.now();

        registros.compute(chave, (k, atual) -> {
            int tentativas = (atual == null || atual.expirou(agora)) ? 1 : atual.tentativas() + 1;

            if (tentativas >= MAX_TENTATIVAS) {
                log.warn("Email bloqueado por {}s apos {} tentativas: {}",
                        BLOQUEIO_SEGUNDOS, tentativas, email);
                return new Registro(tentativas, agora, agora.plusSeconds(BLOQUEIO_SEGUNDOS));
            }

            log.info("Tentativa de login {} de {} falhou: {}", tentativas, MAX_TENTATIVAS, email);
            return new Registro(tentativas, agora, null);
        });

        Registro registro = registros.get(chave);
        return registro != null && registro.bloqueadoAte() != null
                ? BLOQUEIO_SEGUNDOS
                : 0;
    }

    /** Chamado quando o login da certo: limpa o historico do email. */
    public void registrarSucesso(String email) {
        registros.remove(chave(email));
    }

    /** Quantas tentativas ainda restam antes do bloqueio (para a mensagem de erro). */
    public int tentativasRestantes(String email) {
        Registro registro = registros.get(chave(email));
        if (registro == null || registro.expirou(Instant.now())) {
            return MAX_TENTATIVAS;
        }
        return Math.max(0, MAX_TENTATIVAS - registro.tentativas());
    }

    private String chave(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
