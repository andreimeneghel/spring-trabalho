package com.soundhub.common.exception;

/** 409 - dado duplicado (ex.: email ja cadastrado). */
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
