package com.soundhub.common.exception;

/** 429 - excedeu o limite de tentativas e precisa esperar. */
public class MuitasTentativasException extends RuntimeException {

    /** Quantos segundos faltam para poder tentar de novo. */
    private final long segundosRestantes;

    public MuitasTentativasException(long segundosRestantes) {
        super("Muitas tentativas de login. Tente novamente em " + segundosRestantes
                + (segundosRestantes == 1 ? " segundo" : " segundos"));
        this.segundosRestantes = segundosRestantes;
    }

    public long getSegundosRestantes() {
        return segundosRestantes;
    }
}
